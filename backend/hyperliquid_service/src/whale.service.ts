import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import WebSocket from 'ws';
import { Subject } from 'rxjs';
import { TraderCrawlerService } from './trader-crawler/trader-crawler.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhaleTrade } from './whale-trade.entity';

@Injectable()
export class WhaleService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(WhaleService.name);
    private ws: WebSocket | null = null;
    private readonly WS_URL = 'wss://api.hyperliquid.xyz/ws';
    private readonly WHALE_THRESHOLD_USD = 1000000;

    private reconnectTimeout: NodeJS.Timeout | null = null;
    private pingInterval: NodeJS.Timeout | null = null;
    private shouldReconnect = true;
    private reconnectAttempts = 0;
    private lastPong = 0;

    private knownTraders = new Set<string>();
    private subscribedAssets = new Set<string>();

    // Subject to broadcast 'whale' trades to the Gateway
    public whaleTrades$ = new Subject<any>();

    constructor(
        private readonly traderCrawlerService: TraderCrawlerService,
        private readonly httpService: HttpService,
        @InjectRepository(WhaleTrade)
        private readonly whaleTradeRepository: Repository<WhaleTrade>,
    ) { }

    async onModuleInit() {
        await Promise.all([
            this.updateKnownTraders(),
            this.fetchUniverse()
        ]);

        setInterval(() => this.updateKnownTraders(), 1000 * 60 * 10); // Refresh every 10 mins
        setInterval(() => this.fetchUniverse(), 1000 * 60 * 60); // Refresh assets every 1 hour

        this.connect();
    }

    onModuleDestroy() {
        this.shouldReconnect = false;
        this.disconnect();
    }

    private async fetchUniverse() {
        try {
            this.logger.log('Fetching asset universe from Hyperliquid...');
            const response = await lastValueFrom(
                this.httpService.post('https://api.hyperliquid.xyz/info', { type: 'meta' })
            );

            if (response.data && response.data.universe) {
                const newAssets: string[] = response.data.universe.map((asset: any) => asset.name);

                let newlyAddedCount = 0;
                newAssets.forEach(asset => {
                    if (!this.subscribedAssets.has(asset)) {
                        this.subscribedAssets.add(asset);
                        this.subscribeToAsset(asset);
                        newlyAddedCount++;
                    }
                });

                this.logger.log(`Universe updated. Total assets: ${this.subscribedAssets.size}. New: ${newlyAddedCount}`);
            }
        } catch (error) {
            this.logger.error('Failed to fetch asset universe', error);
        }
    }

    private connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
            this.logger.warn('WebSocket is already open or connecting. Skipping connect() call.');
            return;
        }

        this.logger.log(`Connecting to Hyperliquid WebSocket... (Attempt ${this.reconnectAttempts + 1})`);
        this.ws = new WebSocket(this.WS_URL);

        this.ws.on('open', () => {
            this.logger.log('Connected to Hyperliquid WebSocket');
            this.reconnectAttempts = 0; // Reset on successful connection
            this.lastPong = Date.now(); // Initialize heartbeat
            this.resubscribeAll();
            this.startPing();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            this.handleMessage(data);
        });

        this.ws.on('error', (error) => {
            this.logger.error('Hyperliquid WS Error:', error);
        });

        this.ws.on('close', (code, reason) => {
            this.logger.warn(`Disconnected from Hyperliquid WS. Code: ${code}, Reason: ${reason}`);
            this.ws = null;
            this.stopPing();
            if (this.shouldReconnect) {
                this.scheduleReconnect();
            }
        });
    }

    private disconnect() {
        this.stopPing();
        if (this.ws) {
            // Remove listeners to avoid triggering 'close' logic during intentional disconnect
            this.ws.removeAllListeners();
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

        this.logger.log(`Scheduling reconnect in ${delay}ms...`);

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    private resubscribeAll() {
        this.subscribedAssets.forEach(coin => {
            this.subscribeToAsset(coin);
        });
    }

    private subscribeToAsset(coin: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                method: 'subscribe',
                subscription: { type: 'trades', coin },
            }));
        }
    }

    private startPing() {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                // Watchdog check
                const timeSinceLastPong = Date.now() - this.lastPong;
                if (timeSinceLastPong > 45000) { // 45s threshold (1.5x ping interval)
                    this.logger.warn(`No heartbeat received for ${timeSinceLastPong}ms. Terminating connection.`);
                    this.ws.terminate(); // Force close to trigger 'close' event and reconnect logic
                    return;
                }

                this.ws.send(JSON.stringify({ method: 'ping' }));
                this.logger.debug('Sent ping to Hyperliquid');
            }
        }, 30000); // 30 seconds
    }

    private stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    private handleMessage(data: WebSocket.Data) {
        try {
            const message = JSON.parse(data.toString());

            if (message.channel === 'trades' && message.data) {
                this.lastPong = Date.now(); // Treat data reception as liveness too

                // Hyperliquid sends trades in batches.
                const groups = new Map<string, any[]>();

                message.data.forEach((trade: any) => {
                    const key = `${trade.coin}-${trade.side}`;
                    if (!groups.has(key)) {
                        groups.set(key, []);
                    }
                    groups.get(key)?.push(trade);
                });

                // Process each group
                groups.forEach((trades, key) => {
                    let totalValueUsd = 0;
                    let totalSize = 0;
                    const coin = trades[0].coin;
                    const side = trades[0].side;
                    const users = new Set<string>();

                    let isKnownTrader = false;

                    // Sum up the value
                    trades.forEach(trade => {
                        const px = parseFloat(trade.px);
                        const sz = parseFloat(trade.sz);
                        const val = px * sz;
                        totalValueUsd += val;
                        totalSize += sz;
                        if (trade.users && Array.isArray(trade.users)) {
                            trade.users.forEach((u: string) => {
                                users.add(u);
                                if (this.knownTraders.has(u)) {
                                    isKnownTrader = true;
                                }
                            });
                        }
                    });

                    // Smart Filtering: Whale check OR Known Trader check
                    if (totalValueUsd >= this.WHALE_THRESHOLD_USD || isKnownTrader) {
                        const avgPx = totalValueUsd / totalSize;

                        if (isKnownTrader) {
                            this.logger.log(`Targeted Trader Detected! ${coin} ${side} $${totalValueUsd.toFixed(2)}`);
                        } else {
                            this.logger.log(`Aggregated Whale Trade: ${coin} ${side} $${totalValueUsd.toFixed(2)} from ${trades.length} fills`);
                        }

                        const aggregatedTrade = {
                            coin,
                            side,
                            px: avgPx.toFixed(6), // Average weighted price
                            sz: totalSize.toFixed(6), // Total size
                            time: Date.now(),
                            hash: trades[0].hash, // Use first hash as identifier
                            users: Array.from(users),
                            valueUsd: totalValueUsd,
                            isWhale: totalValueUsd >= this.WHALE_THRESHOLD_USD,
                            isAggregated: true,
                            fillCount: trades.length,
                            isKnownTrader
                        };

                        // Save to DB asynchronously
                        this.saveTradeToDb(aggregatedTrade);

                        this.whaleTrades$.next(aggregatedTrade);
                    }
                });
            } else {
                if (message.channel === 'subscriptionResponse') {
                    // reduce log noise
                } else if (message.channel === 'error') {
                    this.logger.error(`Received error message from WS: ${JSON.stringify(message)}`);
                } else if (message.channel === 'pong' || message.method === 'pong') {
                    this.logger.debug('Received pong');
                    this.lastPong = Date.now();
                } else {
                    this.logger.debug(`Received non-trade message: ${JSON.stringify(message)}`);
                }
            }
        } catch (err) {
            this.logger.error('Error parsing message', err);
        }
    }

    private async saveTradeToDb(tradeData: any) {
        try {
            const trade = new WhaleTrade();
            trade.coin = tradeData.coin;
            trade.side = tradeData.side;
            trade.px = tradeData.px;
            trade.sz = tradeData.sz;
            trade.time = tradeData.time;
            trade.hash = tradeData.hash;
            trade.users = tradeData.users;
            trade.valueUsd = tradeData.valueUsd;
            trade.isWhale = tradeData.isWhale;
            trade.isKnownTrader = tradeData.isKnownTrader;
            trade.fillCount = tradeData.fillCount;

            await this.whaleTradeRepository.save(trade);
        } catch (error) {
            this.logger.error('Failed to persist whale trade', error);
        }
    }

    private async updateKnownTraders() {
        try {
            const addresses = await this.traderCrawlerService.getAllTraderAddresses();
            this.knownTraders = new Set(addresses);
            this.logger.log(`Updated known traders cache. Total: ${this.knownTraders.size}`);
        } catch (error) {
            this.logger.error('Failed to update known traders cache', error);
        }
    }
}
