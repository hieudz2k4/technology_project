export type TraderTimeframe = 'thirty_days' | 'all';

export interface TraderSortInput {
  field: string;
  order: 'asc' | 'desc';
}

export interface TraderFilterInput {
  minPerpsEquity?: number;
  minWinrate?: number;
  minSharpe?: number;
  [key: string]: any;
}

export interface ExploreTradersVariables {
  page: number;
  pageSize: number;
  timeframe: TraderTimeframe;
  sortBy?: TraderSortInput;
  filters?: TraderFilterInput;
}

export interface TraderData {
  address: string;
  displayName?: string;
  twitter?: string;
  pnl: number;
  perpsEquity: number;
  winrate: number;
  totalTrades: number;
  sharpe: number;
  drawdown: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ExploreTradersResponse {
  exploreTraders: {
    data: TraderData[];
    pagination: Pagination;
  };
}

export interface FormattedTrader {
  address: string;
  pnl: number;
  equity: number;
  winrate: number;
  sharpe: number;
  twitter: string | null;
  totalTrades: number;
  drawdown: number;
}
