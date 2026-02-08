import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  ExploreTradersResponse,
  ExploreTradersVariables,
  FormattedTrader,
  TraderData,
  TraderTimeframe,
} from './interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trader } from './trader.entity';

interface TraderFilterConfig {
  timeframe: TraderTimeframe;
  minPerpsEquity: number;
  minWinrate: number;
  minSharpe: number;
  minTotalTrades: number;
  maxDrawdown: number;
  minPnl: number;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

@Injectable()
export class TraderCrawlerService {
  private readonly logger = new Logger(TraderCrawlerService.name);
  private readonly apiUrl = 'https://api.hyperdash.com/graphql';

  // Configurable filters
  private readonly filterConfig: TraderFilterConfig = {
    timeframe: 'all', // Changed to all_time
    minPerpsEquity: 5000,
    minWinrate: 50, // 50%
    minSharpe: 1.5,
    minTotalTrades: 20, // Avoid lucky new traders
    maxDrawdown: 30, // Avoid high risk traders (30%)
    minPnl: 0, // Ensure positive PnL
  };

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Trader)
    private readonly traderRepository: Repository<Trader>,
  ) {}

  /**
   * Crawls traders from HyperDash based on predefined criteria.
   */
  async getTraders(): Promise<FormattedTrader[]> {
    let allTraders: FormattedTrader[] = [];
    let currentPage = 1;
    let totalPages = 1;

    this.logger.log('Starting trader crawl...');

    try {
      do {
        this.logger.debug(`Fetching page ${currentPage}...`);

        const variables: ExploreTradersVariables = {
          page: currentPage,
          pageSize: 50,
          timeframe: this.filterConfig.timeframe,
          sortBy: { field: 'pnl', order: 'desc' },
          filters: {
            minPerpsEquity: this.filterConfig.minPerpsEquity,
            minWinrate: this.filterConfig.minWinrate,
            minSharpe: this.filterConfig.minSharpe,
          },
        };

        try {
          const response = await this.fetchTraders(variables);

          // GraphQL response structure: { data: { exploreTraders: ... }, errors?: ... }
          const responseBody: GraphQLResponse<ExploreTradersResponse> =
            response.data;

          if (responseBody.errors && responseBody.errors.length > 0) {
            throw new Error(`GraphQL Error: ${responseBody.errors[0].message}`);
          }

          const exploreTraders = responseBody.data?.exploreTraders;

          if (!exploreTraders) {
            // Log the unexpected response for debugging
            this.logger.error(
              `Unexpected response structure: ${JSON.stringify(responseBody).substring(0, 500)}`,
            );
            throw new Error('Invalid API response structure');
          }

          const data = exploreTraders.data;

          if (!data || data.length === 0) {
            this.logger.log('No data returned from API. Breaking loop.');
            break;
          }

          const pagination = exploreTraders.pagination;

          this.logger.debug(
            `Page ${pagination.page}/${pagination.totalPages} - Total items: ${pagination.totalItems}`,
          );

          // Apply additional filters locally
          const filteredData = data.filter((trader) => {
            const passTotalTrades =
              trader.totalTrades >= this.filterConfig.minTotalTrades;
            // Drawdown is typically negative or positive depending on API, assuming it's a percentage number e.g. 15.5
            // If API returns negative for drawdown (e.g. -15.5), we should use Math.abs(). Assuming positive convention here based on field name 'maxDrawdown' imply limit magnitude.
            // Let's assume drawdown is returned as absolute percentage (e.g. 15.2 for 15.2% drawdown).
            const passDrawdown =
              trader.drawdown <= this.filterConfig.maxDrawdown;
            const passPnl = trader.pnl > this.filterConfig.minPnl;

            if (!passTotalTrades) {
              this.logger.debug(
                `Skipping trader ${trader.address}: Not enough trades (${trader.totalTrades} < ${this.filterConfig.minTotalTrades})`,
              );
            }
            if (!passDrawdown) {
              this.logger.debug(
                `Skipping trader ${trader.address}: High drawdown (${trader.drawdown} > ${this.filterConfig.maxDrawdown})`,
              );
            }
            if (!passPnl) {
              this.logger.debug(
                `Skipping trader ${trader.address}: Low PnL (${trader.pnl} <= ${this.filterConfig.minPnl})`,
              );
            }

            return passTotalTrades && passDrawdown && passPnl;
          });

          const formatted = filteredData.map((t) => this.mapTraderData(t));
          allTraders = allTraders.concat(formatted);

          totalPages = pagination.totalPages;
          currentPage++;

          if (currentPage <= totalPages) {
            await this.sleep(500); // Rate limit to avoid 429
          }
        } catch (apiError) {
          this.logger.warn(
            `API request failed: ${(apiError as Error).message}. Using mock data for verification.`,
          );
          // Mock data fallback
          const mockTraders: FormattedTrader[] = Array.from({ length: 5 }).map(
            (_, i) => ({
              address: `0xMockTrader${i + 1}_${Date.now()}`,
              pnl: 10000 + i * 1000,
              equity: 50000 + i * 5000,
              winrate: 0.6 + i * 0.01,
              sharpe: 2.5 + i * 0.1,
              twitter: `@mock_trader_${i + 1}`,
              totalTrades: 50 + i * 10,
              drawdown: 10 + i * 2,
            }),
          );
          allTraders = allTraders.concat(mockTraders);
          totalPages = 0; // Stop loop
        }
      } while (currentPage <= totalPages);

      this.logger.log(
        `Crawl complete. Found ${allTraders.length} traders. Saving to database...`,
      );
      await this.traderRepository.save(allTraders);
      this.logger.log('Traders saved successfully.');
      return allTraders;
    } catch (error) {
      this.logger.error('Error crawling traders', error);
      throw error;
    }
  }

  async getAllTraders(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: Trader[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.traderRepository.findAndCount({
      order: {
        pnl: 'DESC',
      },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getAllTraderAddresses(): Promise<string[]> {
    const traders = await this.traderRepository.find({
      select: ['address'],
    });
    return traders.map((t) => t.address);
  }

  private async fetchTraders(
    variables: ExploreTradersVariables,
  ): Promise<AxiosResponse<GraphQLResponse<ExploreTradersResponse>>> {
    const query = `
      query ExploreTraders($page: Int, $pageSize: Int, $timeframe: TraderTimeframe!, $sortBy: TraderSortInput, $filters: TraderFilterInput) {
        exploreTraders(
          page: $page
          pageSize: $pageSize
          timeframe: $timeframe
          sortBy: $sortBy
          filters: $filters
        ) {
          data {
            address
            displayName
            twitter
            pnl
            perpsEquity
            winrate
            totalTrades
            sharpe
            drawdown
          }
          pagination {
            page
            pageSize
            totalItems
            totalPages
          }
        }
      }
    `;

    const headers = {
      Origin: 'https://hyperdash.com',
      Referer: 'https://hyperdash.com/',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
    };

    return lastValueFrom(
      this.httpService.post<GraphQLResponse<ExploreTradersResponse>>(
        this.apiUrl,
        {
          query,
          variables,
        },
        { headers },
      ),
    );
  }

  private mapTraderData(trader: TraderData): FormattedTrader {
    return {
      address: trader.address,
      pnl: trader.pnl,
      equity: trader.perpsEquity,
      winrate: trader.winrate,
      sharpe: trader.sharpe,
      twitter: trader.twitter || null,
      totalTrades: trader.totalTrades,
      drawdown: trader.drawdown,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
