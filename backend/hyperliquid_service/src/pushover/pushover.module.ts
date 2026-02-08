import { Module } from '@nestjs/common';
import { PushoverController } from './pushover.controller';
import { PushoverService } from './pushover.service';

@Module({
  controllers: [PushoverController],
  providers: [PushoverService],
  exports: [PushoverService],
})
export class PushoverModule {}
