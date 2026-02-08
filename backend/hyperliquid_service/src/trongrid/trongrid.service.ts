import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { PushoverService } from '../pushover/pushover.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsdtTransfer } from './usdt-transfer.entity';
import { EventsGateway } from '../events.gateway';

interface TronTransaction {
  transaction_id: string;
  block_timestamp: number;
  from: string;
  to: string;
  value: string;
  type: string;
  [key: string]: any;
}

interface TronGridResponse {
  data: TronTransaction[];
  success: boolean;
  meta: any;
}

@Injectable()
export class TrongridService implements OnModuleInit {
  private readonly logger = new Logger(TrongridService.name);
  private readonly treasuryAddress = 'TKHuVq1oKVruCGLvqVexFs6dawKv6fQgFs';
  private readonly usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  private readonly minAmount = 100_000_000; // 100M USDT
  private lastTimestamp = Date.now();
  private isPolling = false;

  constructor(
    private configService: ConfigService,
    private pushoverService: PushoverService,
    @InjectRepository(UsdtTransfer)
    private readonly transferRepository: Repository<UsdtTransfer>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  onModuleInit() {
    this.logger.log(
      'Trongrid Service initialized. Polling for large USDT transfers...',
    );
    // In production, you might want to load the last seen timestamp from DB
    this.lastTimestamp = Date.now();
  }

  async getTransfers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.transferRepository.findAndCount({
      order: { timestamp: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { data, total, page, limit };
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async pollTransactions() {
    if (this.isPolling) {
      this.logger.debug('Skipping poll: Previous poll still running.');
      return;
    }

    this.isPolling = true;

    try {
      const apiKey = this.configService.get<string>('TRONGRID_API_KEY');
      const url = `https://api.trongrid.io/v1/accounts/${this.treasuryAddress}/transactions/trc20`;

      const params: Record<string, string | number | boolean> = {
        contract_address: this.usdtContractAddress,
        only_confirmed: true,
        min_timestamp: this.lastTimestamp,
        limit: 50,
      };

      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['TRON-PRO-API-KEY'] = apiKey;
      }

      const response = await axios.get<TronGridResponse>(url, {
        params,
        headers,
      });
      const transactions = response.data.data;

      if (!transactions || transactions.length === 0) {
        return;
      }

      // SORTING: Important to process Oldest -> Newest
      transactions.sort((a, b) => a.block_timestamp - b.block_timestamp);

      let maxTime = this.lastTimestamp;

      for (const tx of transactions) {
        const txTime = tx.block_timestamp;

        if (txTime < this.lastTimestamp) continue;

        if (txTime > maxTime) {
          maxTime = txTime;
        }

        // Process transaction
        await this.processTransaction(tx);
      }

      this.lastTimestamp = maxTime + 1;
    } catch (error: any) {
      const errorMsg = `Error polling TronGrid: ${(error as Error).message}`;
      this.logger.error(errorMsg);
      try {
        await this.pushoverService.sendNotification(
          `⚠️ <b>TronGrid Polling Error</b> ⚠️\n${(error as Error).message}`,
          'TronGrid Error',
          'intermission',
        );
      } catch (notifyError) {
        this.logger.error('Failed to send error notification', notifyError);
      }
    } finally {
      this.isPolling = false;
    }
  }

  private async processTransaction(tx: TronTransaction) {
    const rawAmount = parseFloat(tx.value);
    const amountDisplay = rawAmount / 1_000_000;

    if (amountDisplay < this.minAmount) {
      return;
    }

    const sender = tx.from;
    const receiver = tx.to;
    const hash = tx.transaction_id;
    const scanUrl = `https://tronscan.org/#/transaction/${hash}`;

    // Determine direction
    let type = 'UNKNOWN';
    if (sender === this.treasuryAddress) {
      type = 'OUTFLOW'; // Burn/Transfer
    } else if (receiver === this.treasuryAddress) {
      type = 'INFLOW'; // Mint/Receive
    }

    // Save to DB
    try {
      // Check if exists
      const exists = await this.transferRepository.findOne({
        where: { hash: hash },
      });
      if (!exists) {
        const transfer = new UsdtTransfer();
        transfer.hash = hash;
        transfer.amount = amountDisplay;
        transfer.sender = sender;
        transfer.receiver = receiver;
        transfer.type = type;
        transfer.timestamp = tx.block_timestamp;
        await this.transferRepository.save(transfer);
        this.logger.log(`Saved USDT transfer: ${hash}`);
      }
    } catch (dbError) {
      this.logger.error(`Failed to save transfer ${hash}`, dbError);
    }

    const formattedAmount = amountDisplay.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
    const typeDisplay =
      type === 'OUTFLOW'
        ? '<b>OUTFLOW</b> (Burn/Transfer)'
        : type === 'INFLOW'
          ? '<b>INFLOW</b> (Mint/Receive)'
          : 'UNKNOWN';

    const msg =
      `🚨 <b>Tether Treasury Alert</b> 🚨\n` +
      `Type: ${typeDisplay}\n` +
      `Amount: <b>${formattedAmount} USDT</b>\n` +
      `Sender: ${sender}\n` +
      `Receiver: ${receiver}\n` +
      `<a href="${scanUrl}">View on TronScan</a>`;

    this.logger.log(
      `Large Transfer detected: ${formattedAmount} USDT - ${hash}`,
    );

    // Emit WebSocket event
    this.eventsGateway.server.emit('usdt-transfer', {
      id: Date.now(), // Temporary ID if not saved yet, or use saved entity
      hash,
      amount: amountDisplay,
      sender,
      receiver,
      type,
      timestamp: tx.block_timestamp,
    });

    try {
      await this.pushoverService.sendNotification(
        msg,
        'Tether Treasury Alert',
        'cashregister',
      );
    } catch (err) {
      this.logger.error('Failed to send push notification', err);
    }
  }
}
