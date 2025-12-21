import useDataPriceStore from "@/store/DataPrice";
import { Bar } from "@/public/static/charting_library/charting_library";

type TickCallback = (bar: Bar) => void;

export class WebSocketManager {
    private static instance: WebSocketManager;
    private ws: WebSocket | null = null;
    private subscribers: Map<string, Set<TickCallback>> = new Map();
    private isConnecting: boolean = false;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    private readonly URL = "ws://localhost:8082/ws/market";
    private readonly API_KEY = ""; // Not needed for local service

    private constructor() { }

    public static getInstance(): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }

    public subscribe(symbol: string, callback?: TickCallback) {
        if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, new Set());
        }

        if (callback) {
            this.subscribers.get(symbol)?.add(callback);
        }

        // Ensure connection exists
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.connect();
        } else {
            // If already connected, maybe send subscribe message for this symbol?
            // For simplicity and efficiency, we can resubscribe all active symbols
            // or just this one. The existing logic resubscribed everything on open.
            // Let's send a subscribe for this specific instrument if it's new, 
            // but for now, the pattern "resubscribeAll" handles it well on connect.
            // If we want to support dynamic subscription while connected:
            this.sendSubscribe([symbol]);
        }
    }

    public unsubscribe(symbol: string, callback?: TickCallback) {
        if (callback && this.subscribers.has(symbol)) {
            this.subscribers.get(symbol)?.delete(callback);
        }

        // If no more subscribers for this symbol, maybe unsubscribe from WS?
        // Maintaining subscription is fine for now to keep data flowing for Store.
    }

    private connect() {
        if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
        if (!this.URL) {
            console.error("[WebSocketManager] Missing URL");
            return;
        }

        this.isConnecting = true;
        this.ws = new WebSocket(`${this.URL}`);

        this.ws.onopen = () => {
            console.log("[WebSocketManager] Connected");
            this.isConnecting = false;
            this.resubscribeAll();
        };

        this.ws.onmessage = (event) => this.handleMessage(event);

        this.ws.onerror = (error) => {
            console.error("[WebSocketManager] Error:", error);
        };

        this.ws.onclose = () => {
            console.log("[WebSocketManager] Closed. Reconnecting...");
            this.isConnecting = false;
            this.ws = null;
            if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
        };
    }

    private handleMessage(event: MessageEvent) {
        try {
            const data = JSON.parse(event.data);
            if (data.TYPE === "919") {
                const symbol = data.INSTRUMENT;
                const price = data.PRICE;

                // 1. Update Global Store
                const dayOpen = data.CURRENT_DAY_OPEN || price; // Fallback to avoid NaN if missing
                const dayChange = parseFloat((((price - dayOpen) / dayOpen) * 100).toFixed(2));

                useDataPriceStore.getState().setPriceDatas(symbol, {
                    tickPrice: price,
                    dayHigh: data.CURRENT_DAY_HIGH || price,
                    dayLow: data.CURRENT_DAY_LOW || price,
                    dayOpen: data.CURRENT_DAY_OPEN || price,
                    dayChange: dayChange
                });

                // 2. Notify Subscribers (Chart)
                if (this.subscribers.has(symbol)) {
                    // Construct Bar
                    let time = Date.now();
                    if (data.PRICE_LAST_UPDATE_TS) {
                        time = data.PRICE_LAST_UPDATE_TS * 1000 +
                            (data.PRICE_LAST_UPDATE_TS_NS ? Math.floor(data.PRICE_LAST_UPDATE_TS_NS / 1e6) : 0);
                    } else if (data.TIMESTAMP) {
                        time = data.TIMESTAMP * 1000;
                    }

                    const bar: Bar = {
                        time: time,
                        open: price,
                        high: price,
                        low: price,
                        close: price
                    };

                    this.subscribers.get(symbol)?.forEach(cb => cb(bar));
                }
            }
        } catch (e) {
            console.error("[WebSocketManager] Parse Error:", e);
        }
    }

    private resubscribeAll() {
        const symbols = Array.from(this.subscribers.keys());
        // Also include default symbols if we want to ensure they are always subscribed for UI even if no chart is open
        // For now, relies on subscribers.
        if (symbols.length > 0) {
            this.sendSubscribe(symbols);
        }
    }

    private sendSubscribe(symbols: string[]) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        if (symbols.length === 0) return;

        // Local service broadcasts all symbols by default, no need for specific subscribe message
        // const payload = {
        //     action: "SUBSCRIBE",
        //     type: "futures_v1_latest_tick",
        //     groups: ["VALUE", "CURRENT_DAY"], // Needed for UI data (high/low/change)
        //     market: "binance",
        //     instruments: symbols,
        // };
        // this.ws.send(JSON.stringify(payload));
    }
}
