import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { WalletProfileDto } from './wallet.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthTags(): { status: string } {
    return { status: 'ok' };
  }

  @Get('/wallet/:address')
  async getWalletProfile(@Param('address') address: string): Promise<WalletProfileDto> {
    return this.appService.fetchWalletData(address);
  }
}
