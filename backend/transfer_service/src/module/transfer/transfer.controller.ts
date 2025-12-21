import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransferRequestDto } from './transfer_request.dto';
import { TransferService } from './transfer.service';

@Controller('api/transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) { }

  @Get('/test')
  test(): string {
    return 'Hello from Transfer Service';
  }

  @Post('/deposit')
  deposit(@Body() transferReqDto: TransferRequestDto): string {
    return this.transferService.deposit(transferReqDto);
  }

  @Post('/withdraw')
  withdraw(@Body() transferReqDto: TransferRequestDto): string {
    return this.transferService.withdraw(transferReqDto);
  }

  @Get('/balance/:address')
  balance(@Param('address') address: string): Promise<string> {
    return this.transferService.balance(address);
  }
}
