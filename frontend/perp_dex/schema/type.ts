export const tradingPairs = ["BTC/USD", "ETH/USD", "SOL/USD"] as const;
export type TradingPairType = (typeof tradingPairs)[number];
