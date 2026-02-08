export class PositionDto {
  symbol: string;
  side: 'Long' | 'Short';
  size: string;
  entryPrice: string;
  pnl: string;
}

export class WalletProfileDto {
  accountValue: string;
  leverage: string;
  marginUsage: string;
  positions: PositionDto[];
}
