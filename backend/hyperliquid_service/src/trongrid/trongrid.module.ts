import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TrongridService } from './trongrid.service';
import { PushoverModule } from '../pushover/pushover.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsdtTransfer } from './usdt-transfer.entity';
import { TrongridController } from './trongrid.controller';
import { EventsGateway } from '../events.gateway';

@Module({
    imports: [
        ConfigModule,
        ScheduleModule,
        PushoverModule,
        TypeOrmModule.forFeature([UsdtTransfer]),
    ],
    providers: [TrongridService, EventsGateway],
    controllers: [TrongridController],
    exports: [TrongridService]
})
export class TrongridModule { }
