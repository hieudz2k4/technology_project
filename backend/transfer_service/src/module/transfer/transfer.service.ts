import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { TransferRequestDto } from './transfer_request.dto';
import { Web3Service } from '../web3/web3.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class TransferService implements OnModuleInit {
  private tradingGRPCService: TradingGRPCService;
  private userGRPCService: UserGRPCService;

  constructor(
    private readonly web3Service: Web3Service,
    @Inject('TRADING_SERVICE') private client: ClientGrpc,
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.tradingGRPCService = this.client.getService<TradingGRPCService>('TradingService');
    this.userGRPCService = this.userClient.getService<UserGRPCService>('UserService');
  }

  deposit(transferReqDto: TransferRequestDto): string {
    return `Deposit ${transferReqDto.amount} from ${transferReqDto.addressFrom} to ${transferReqDto.addressTo}`;
  }

  withdraw(transferReqDto: TransferRequestDto): string {
    return `Withdraw ${transferReqDto.amount} from ${transferReqDto.addressFrom} to ${transferReqDto.addressTo}`;
  }

  async balance(address: string): Promise<string> {
    return this.web3Service.getBalance(address);
  }

  @OnEvent('vault.deposit')
  handleDeposit(payload: any) {
    console.log('TransferService received deposit:', payload);
    this.userGRPCService.getUidByAddress({ address: payload.from }).subscribe((response) => {
      console.log('UserGRPCService getUidByAddress response:', response);
      this.tradingGRPCService.deposit({ uid: response.uid, amount: payload.amount, currency: payload.currency }).subscribe((response) => {
        console.log('TradingGRPCService deposit response:', response);
      });
    });
  }

  @OnEvent('vault.withdraw')
  handleWithdraw(payload: any) {
    console.log('TransferService received withdraw:', payload);
    this.userGRPCService.getUidByAddress({ address: payload.to }).subscribe((response) => {
      console.log('UserGRPCService getUidByAddress response:', response);
      this.tradingGRPCService.withdraw({ uid: response.uid, amount: payload.amount, currency: payload.currency }).subscribe((response) => {
        console.log('TradingGRPCService withdraw response:', response);
      });
    });
  }
}

interface TradingGRPCService {
  ping(data: { message: string }): Observable<{ message: string }>;
  deposit(data: { uid: number, amount: string, currency: string }): Observable<{ message: string }>;
  withdraw(data: { uid: number, amount: string, currency: string }): Observable<{ message: string }>;
}

interface UserGRPCService {
  getUidByAddress(data: { address: string }): Observable<{ uid: number }>;
}
