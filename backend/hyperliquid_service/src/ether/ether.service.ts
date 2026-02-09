import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PushoverService } from '../pushover/pushover.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsdtTransfer } from '../trongrid/usdt-transfer.entity';
import { EventsGateway } from '../events.gateway';
import { Network, Alchemy } from 'alchemy-sdk';
import { ethers, formatUnits } from 'ethers';

@Injectable()
export class EtherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EtherService.name);
  private readonly treasuryAddress =
    '0x5754284f345afc66a98fbb0a0afe71e0f00f37e3';
  private readonly usdtContractAddress =
    '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  private readonly minAmount = 100_000_000; // 100M USDT

  private alchemy: Alchemy;

  private subscription: any;

  constructor(
    private configService: ConfigService,
    private pushoverService: PushoverService,
    @InjectRepository(UsdtTransfer)
    private readonly transferRepository: Repository<UsdtTransfer>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('ALCHEMY_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'ALCHEMY_API_KEY not found in env. EtherService will not run.',
      );
      return;
    }

    const settings = {
      apiKey: apiKey,
      network: Network.ETH_MAINNET,
    };

    this.alchemy = new Alchemy(settings);
    this.startListening();
  }

  onModuleDestroy() {
    if (this.subscription) {
      this.alchemy.ws.removeAllListeners();
    }
  }

  private startListening() {
    this.logger.log('Starting Alchemy WebSocket listener for USDT...');

    // Transfer event signature: Transfer(address,address,uint256)
    // We want to verify this topic
    const transferTopic = ethers.id('Transfer(address,address,uint256)');

    // Filter for logs from USDT contract with Transfer topic
    const filter = {
      address: this.usdtContractAddress,
      topics: [transferTopic],
    };

    this.alchemy.ws.on(filter, (log) => {
      void this.handleLog(log);
    });

    this.logger.log('Alchemy listener started.');
  }

  private async handleLog(log: any) {
    try {
      // log.topics has [signature, from, to] (indexed params)
      // log.data has value (non-indexed param)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const from = ethers.stripZerosLeft(log.topics[1]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const to = ethers.stripZerosLeft(log.topics[2]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      const value = BigInt(log.data);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const hash = log.transactionHash as string;

      await this.processTransfer(from, to, value, hash);
    } catch (error) {
      this.logger.error('Error handling log', error);
    }
  }

  private async processTransfer(
    from: string,
    to: string,
    value: bigint,
    hash: string,
  ) {
    try {
      // Filter for Treasury involvement
      const isTreasurySender =
        from.toLowerCase() === this.treasuryAddress.toLowerCase();
      const isTreasuryReceiver =
        to.toLowerCase() === this.treasuryAddress.toLowerCase();

      if (!isTreasurySender && !isTreasuryReceiver) {
        return;
      }

      // USDT has 6 decimals
      const amount = parseFloat(formatUnits(value, 6));

      if (amount < this.minAmount) {
        return;
      }

      const type = isTreasurySender ? 'OUTFLOW' : 'INFLOW';
      const scanUrl = `https://etherscan.io/tx/${hash}`;

      // Save to DB
      const exists = await this.transferRepository.findOne({ where: { hash } });
      if (!exists) {
        const transfer = new UsdtTransfer();
        transfer.hash = hash;
        transfer.amount = amount;
        transfer.sender = from;
        transfer.receiver = to;
        transfer.type = type;
        transfer.chain = 'ETHEREUM';
        transfer.timestamp = Date.now(); // Approximate
        await this.transferRepository.save(transfer);
        this.logger.log(`Saved ETH USDT transfer: ${hash}`);
      }

      const formattedAmount = amount.toLocaleString('en-US', {
        maximumFractionDigits: 0,
      });
      const typeDisplay =
        type === 'OUTFLOW'
          ? '<b>OUTFLOW</b> (Burn/Transfer)'
          : '<b>INFLOW</b> (Mint/Receive)';

      const msg =
        `🚨 <b>Ether Treasury Alert</b> 🚨\n` +
        `Type: ${typeDisplay}\n` +
        `Amount: <b>${formattedAmount} USDT</b>\n` +
        `Sender: ${from}\n` +
        `Receiver: ${to}\n` +
        `<a href="${scanUrl}">View on Etherscan</a>`;

      this.logger.log(
        `Large ETH Transfer detected: ${formattedAmount} USDT - ${hash}`,
      );

      this.eventsGateway.server.emit('usdt-transfer', {
        id: Date.now(),
        hash,
        amount,
        sender: from,
        receiver: to,
        type,
        chain: 'ETHEREUM',
        timestamp: Date.now(),
      });

      await this.pushoverService.sendNotification(
        msg,
        'Ether Treasury Alert',
        'cashregister',
      );
    } catch (error) {
      this.logger.error(`Error processing transfer ${hash}`, error);
    }
  }
}
