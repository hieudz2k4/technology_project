import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhaleService } from './whale.service';
import { WhaleGateway } from './whale.gateway';
import { EventsGateway } from './events.gateway';
import { PushoverModule } from './pushover/pushover.module';
import { TrongridModule } from './trongrid/trongrid.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { TraderCrawlerModule } from './trader-crawler/trader-crawler.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trader } from './trader-crawler/trader.entity';
import { UsdtTransfer } from './trongrid/usdt-transfer.entity';
import { WhaleTrade } from './whale-trade.entity';
import { WhaleController } from './whale.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PushoverModule,
    TrongridModule,
    HttpModule,
    TraderCrawlerModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_DATABASE', 'tradingdb'),
        entities: [Trader, UsdtTransfer, WhaleTrade],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([WhaleTrade]),
  ],
  controllers: [AppController, WhaleController],
  providers: [AppService, WhaleService, WhaleGateway, EventsGateway],
})
export class AppModule { }
