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
  async getTrades(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    // Cap limit to 100 to prevent misuse
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const [data, total] = await this.whaleTradeRepository.findAndCount({
      order: { time: 'DESC' },
      take: take,
      skip: skip,
    });

    return {
      data,
      meta: {
        total,
        page: Number(page),
        last_page: Math.ceil(total / take),
      },
    };
  }
}
