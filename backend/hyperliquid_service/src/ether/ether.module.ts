import { Module } from '@nestjs/common';
import { EtherService } from './ether.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsdtTransfer } from '../trongrid/usdt-transfer.entity';
import { PushoverModule } from '../pushover/pushover.module';
import { EventsGateway } from '../events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([UsdtTransfer]), PushoverModule],
  providers: [EtherService, EventsGateway],
  exports: [EtherService],
})
export class EtherModule {}
