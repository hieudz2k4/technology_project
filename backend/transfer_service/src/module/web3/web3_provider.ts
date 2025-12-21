import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class Web3Provider {
  private jsonRpcProvider: ethers.JsonRpcProvider;
  private wsProvider: ethers.WebSocketProvider;

  constructor(private readonly configService: ConfigService) {
    this.jsonRpcProvider = new ethers.JsonRpcProvider(
      configService.get<string>('RPC_URL') || 'http://localhost:8545',
    );
    this.jsonRpcProvider.pollingInterval = 1000;

  }

  getJsonRpcProvider(): ethers.JsonRpcProvider {
    return this.jsonRpcProvider;
  }

  getContract(address: string, abi: any): ethers.Contract {
    return new ethers.Contract(address, abi, this.jsonRpcProvider);
  }

}
