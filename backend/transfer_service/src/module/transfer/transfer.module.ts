import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TransferController } from './transfer.controller';
import { Web3Module } from '../web3/web3.module';
import { TransferService } from './transfer.service';

@Module({
  imports: [
    Web3Module,
    ClientsModule.register([
      {
        name: 'TRADING_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'trading',
          protoPath: join(__dirname, '../../proto/trading.proto'),
          url: '0.0.0.0:9094',
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../proto/user.proto'),
          url: '0.0.0.0:9091',
        },
      }
    ]),
  ],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule { }
