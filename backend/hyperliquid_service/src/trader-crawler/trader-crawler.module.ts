import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraderCrawlerService } from './trader-crawler.service';
import { Trader } from './trader.entity';
import { HttpModule } from '@nestjs/axios';
import { TraderCrawlerController } from './trader-crawler.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trader]), HttpModule],
  controllers: [TraderCrawlerController],
  providers: [TraderCrawlerService],
  exports: [TraderCrawlerService],
})
export class TraderCrawlerModule {}
