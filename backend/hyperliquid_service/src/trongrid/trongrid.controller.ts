import { Controller, Get, Query } from '@nestjs/common';
import { TrongridService } from './trongrid.service';

@Controller('usdt-tracker')
export class TrongridController {
    constructor(private readonly trongridService: TrongridService) { }

    @Get()
    async getTransfers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.trongridService.getTransfers(Number(page), Number(limit));
    }
}
