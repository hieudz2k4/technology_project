import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PushoverService } from './pushover.service';

export class SendNotificationDto {
    message: string;
    title?: string;
    sound?: string;
    priority?: number;
    retry?: number;
    expire?: number;
}

@Controller('pushover')
export class PushoverController {
    constructor(private readonly pushoverService: PushoverService) { }

    @Post('test')
    @HttpCode(HttpStatus.OK)
    async sendTestNotification(@Body() dto: SendNotificationDto) {
        return this.pushoverService.sendNotification(dto.message, dto.title, dto.sound, dto.priority, dto.retry, dto.expire);
    }
}
