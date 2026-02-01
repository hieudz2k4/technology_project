import { Controller, Post, Get, Query } from '@nestjs/common';
import { TraderCrawlerService } from './trader-crawler.service';

@Controller('traders')
export class TraderCrawlerController {
    constructor(private readonly traderCrawlerService: TraderCrawlerService) { }

    @Post('crawl')
    async crawlTraders() {
        return this.traderCrawlerService.getTraders();
    }

    @Get()
    async getAllTraders(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
    ) {
        return this.traderCrawlerService.getAllTraders(Number(page), Number(limit));
    }
}
