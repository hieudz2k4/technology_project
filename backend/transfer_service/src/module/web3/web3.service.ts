import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { vaultsAbi } from 'src/abi/vault';
import { Web3Provider } from 'src/module/web3/web3_provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class Web3Service implements OnModuleInit {
  constructor(
    private readonly web3Provider: Web3Provider,
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) { }

  onModuleInit() {
    const vaultAddress = this.configService.get<string>('ADDRESS_USDZ_VAULT');
    if (vaultAddress) {
      const contract = this.web3Provider.getContract(vaultAddress, vaultsAbi);

      contract.on('Deposit', (from, amount) => {
        this.eventEmitter.emit('vault.deposit', { from, amount, currency: 'USDZ' });
        console.log(`Deposit event: from ${from}, amount ${amount}, currency USDZ`);
      });

      contract.on('Withdraw', (to, amount) => {
        this.eventEmitter.emit('vault.withdraw', { to, amount, currency: 'USDZ' });
        console.log(`Withdraw event: to ${to}, amount ${amount}, currency USDZ`);
      });
    }
  }

  async getBalance(address: string): Promise<string> {
    const vaultAddress = this.configService.get<string>('ADDRESS_USDZ_VAULT');
    if (!vaultAddress) {
      throw new Error('ADDRESS_USDZ_VAULT not set');
    }

    console.log(vaultAddress);
    return this.web3Provider
      .getContract(vaultAddress, vaultsAbi)
      .getBalance(address)
      .then((balance) => balance.toString());
  }

  transfer(from: string, to: string, amount: string, currency: string): string {
    return `Transfer ${amount} from ${from} to ${to} currency ${currency}`;
  }
}
