import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhaleTrade } from './whale-trade.entity';

@Controller('whale-trades')
export class WhaleController {
  constructor(
    @InjectRepository(WhaleTrade)
    private readonly whaleTradeRepository: Repository<WhaleTrade>,
  ) {}

  @Get()
  async getTrades(@Query('limit') limit: number = 50) {
    // Cap limit to 100 to prevent misuse
    const take = Math.min(Math.max(limit, 1), 100);

    return this.whaleTradeRepository.find({
      order: { time: 'DESC' },
      take: take,
    });
  }
}
