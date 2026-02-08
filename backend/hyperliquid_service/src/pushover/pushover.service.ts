import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushoverService {
  private readonly logger = new Logger(PushoverService.name);
  private readonly metadataApiUrl = 'https://api.pushover.net/1/messages.json';

  constructor(private configService: ConfigService) {}

  async sendNotification(
    message: string,
    title?: string,
    sound?: string,
    priority?: number,
    retry?: number,
    expire?: number,
  ): Promise<any> {
    const userKey = this.configService.get<string>('PUSHOVER_USER_KEY');
    const token = this.configService.get<string>('PUSHOVER_API_TOKEN');

    if (!userKey || !token) {
      throw new Error('Pushover credentials not configured');
    }

    try {
      const payload = {
        token: token,
        user: userKey,
        message: message,
        title: title || 'Hyperliquid Notification',
        sound: sound || 'war_alarm',
        priority: priority || 2,
        retry: retry || 60,
        expire: expire || 3600,
        html: 1,
      };

      const response = await axios.post(this.metadataApiUrl, payload);
      this.logger.log(
        `Notification sent successfully: ${JSON.stringify(response.data)}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send Pushover notification: ${(error as Error).message}`,
      );
      if (axios.isAxiosError(error) && error.response) {
        this.logger.error(
          `Pushover API response: ${JSON.stringify(error.response.data)}`,
        );
        throw new Error(
          `Pushover API Error: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }
}
