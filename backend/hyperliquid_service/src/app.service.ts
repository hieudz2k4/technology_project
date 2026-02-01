import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { WalletProfileDto, PositionDto } from './wallet.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/info';

  getHello(): string {
    return 'Hello World!';
  }

  async fetchWalletData(address: string): Promise<WalletProfileDto> {
    try {
      this.logger.log(`Fetching wallet data for ${address}`);

      const payload = {
        type: "clearinghouseState",
        user: address
      };

      const response = await axios.post(this.HYPERLIQUID_API_URL, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = response.data;

      // Handle case where user might not be found or has no state
      if (!data || !data.marginSummary) {
        // Return empty/default state or throw error? 
        // If partial data exists, we try to use it. If completely null, throw 404.
        if (!data) {
          throw new HttpException('Wallet not found or no data returned', HttpStatus.NOT_FOUND);
        }
      }

      const marginSummary = data.marginSummary;
      const accountValue = new BigNumber(marginSummary.accountValue);
      const totalNtlPos = new BigNumber(marginSummary.totalNtlPos);
      const totalMarginUsed = new BigNumber(marginSummary.totalMarginUsed);

      // Calculations
      // Leverage = totalNtlPos / accountValue
      let leverage = new BigNumber(0);
      if (!accountValue.isZero()) {
        leverage = totalNtlPos.dividedBy(accountValue);
      }

      // Margin Usage = (totalMarginUsed / accountValue) * 100
      let marginUsage = new BigNumber(0);
      if (!accountValue.isZero()) {
        marginUsage = totalMarginUsed.dividedBy(accountValue).multipliedBy(100);
      }

      // Map Positions
      const positions: PositionDto[] = [];
      if (data.assetPositions && Array.isArray(data.assetPositions)) {
        data.assetPositions.forEach((posWrapper: any) => {
          const pos = posWrapper.position;
          if (pos) {
            const size = new BigNumber(pos.szi);
            if (!size.isZero()) {
              const side = size.isPositive() ? 'Long' : 'Short';
              positions.push({
                symbol: pos.coin,
                side: side,
                size: size.abs().toString(),
                entryPrice: new BigNumber(pos.entryPx).toString(),
                pnl: new BigNumber(pos.unrealizedPnl).toString()
              });
            }
          }
        });
      }

      const walletProfile: WalletProfileDto = {
        accountValue: accountValue.toFixed(2),
        leverage: leverage.toFixed(2) + 'x',
        marginUsage: marginUsage.toFixed(2) + '%',
        positions: positions
      };

      return walletProfile;

    } catch (error) {
      this.logger.error(`Error fetching wallet data: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to fetch wallet data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
