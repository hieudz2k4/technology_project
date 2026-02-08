/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { TrongridService } from './trongrid.service';
import { ConfigService } from '@nestjs/config';
import { PushoverService } from '../pushover/pushover.service';
import axios from 'axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsGateway } from '../events.gateway';
import { UsdtTransfer } from './usdt-transfer.entity';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TrongridService', () => {
  let service: TrongridService;

  const mockPushoverService = {
    sendNotification: jest.fn().mockResolvedValue({ status: 1 }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'TRONGRID_API_KEY') return 'test-api-key';
      return null;
    }),
  };

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockEventsGateway = {
    server: {
      emit: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrongridService,
        { provide: PushoverService, useValue: mockPushoverService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(UsdtTransfer), useValue: mockRepository },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    service = module.get<TrongridService>(TrongridService);
    // pushoverService = module.get<PushoverService>(PushoverService);
    // configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize lastTimestamp', () => {
      const now = Date.now();
      service.onModuleInit();
      // We can't easily access private property 'lastTimestamp' easily without casting to any
      // but we can infer it's working if no errors are thrown
      expect((service as any).lastTimestamp).toBeGreaterThanOrEqual(now);
    });
  });

  describe('pollTransactions', () => {
    it('should skip polling if already polling', async () => {
      (service as any).isPolling = true;
      await service.pollTransactions();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch transactions and process them (sorted)', async () => {
      // Mock data: newer is first (API default), but we want to process older first
      const txOlder = {
        transaction_id: 'tx_older',
        block_timestamp: 1000,
        from: 'sender',
        to: 'receiver',
        value: 200_000_000 * 1_000_000, // 200M USDT
      };
      const txNewer = {
        transaction_id: 'tx_newer',
        block_timestamp: 2000,
        from: 'sender',
        to: 'receiver',
        value: 150_000_000 * 1_000_000, // 150M USDT
      };

      // Set lastTimestamp before these
      (service as any).lastTimestamp = 0;

      mockedAxios.get.mockResolvedValue({
        data: {
          data: [txNewer, txOlder], // API returns newest first
        },
      });

      await service.pollTransactions();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('api.trongrid.io'),
        expect.objectContaining({
          headers: { 'TRON-PRO-API-KEY': 'test-api-key' },
        }),
      );

      // Should be called twice
      expect(mockPushoverService.sendNotification).toHaveBeenCalledTimes(2);

      // Check call order - older should be processed first
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const call1 = mockPushoverService.sendNotification.mock.calls[0][0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const call2 = mockPushoverService.sendNotification.mock.calls[1][0];

      expect(call1).toContain('200,000,000 USDT'); // txOlder
      expect(call2).toContain('150,000,000 USDT'); // txNewer

      // lastTimestamp should be updated to max + 1
      expect((service as any).lastTimestamp).toBe(2001);
    });

    it('should filter out small amounts', async () => {
      const txSmall = {
        transaction_id: 'tx_small',
        block_timestamp: 3000,
        from: 'sender',
        to: 'receiver',
        value: 50 * 1_000_000, // 50 USDT (below 100M threshold)
      };

      (service as any).lastTimestamp = 0;
      mockedAxios.get.mockResolvedValue({
        data: {
          data: [txSmall],
        },
      });

      await service.pollTransactions();
      expect(mockPushoverService.sendNotification).not.toHaveBeenCalled();
    });

    it('should handle API errors and alert', async () => {
      const errorMsg = 'Network Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMsg));

      await service.pollTransactions();

      expect(mockPushoverService.sendNotification).toHaveBeenCalledWith(
        expect.stringContaining('TronGrid Polling Error'),
        'TronGrid Error',
        'intermission',
      );

      // Ensure isPolling is reset
      expect((service as any).isPolling).toBe(false);
    });
  });
});
