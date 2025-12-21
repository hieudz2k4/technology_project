
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import useDataPriceStore from "@/store/DataPrice";
import { mapperSymbol } from "@/lib/mapper_symbol";

interface RecentTradesProps {
  market: string;
}

interface Trade {
  price: string;
  size: string;
  time: string;
  type: "buy" | "sell";
}

export function RecentTrades({ market }: RecentTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const priceDatasState = useDataPriceStore((state) => state.priceDatas);

  useEffect(() => {
    // Basic mock setup
    let basePrice = 90000;

    // Attempt to get real price from store
    const mappedSymbol = mapperSymbol[market];
    if (mappedSymbol && priceDatasState[mappedSymbol]?.tickPrice) {
      basePrice = priceDatasState[mappedSymbol].tickPrice;
    } else {
      if (market.startsWith("ETH")) basePrice = 3000;
      else if (market.startsWith("SOL")) basePrice = 150;
      else if (market.startsWith("BTC")) basePrice = 95000;
    }

    // Generate initial trades
    const initialTrades: Trade[] = [];
    for (let i = 0; i < 20; i++) {
      const type = Math.random() > 0.5 ? "buy" : "sell";
      // Create diversity in past trades
      const priceOffset = (Math.random() - 0.5) * (basePrice * 0.005);
      const price = basePrice + priceOffset;
      const size = Math.random() * 2 + 0.1;
      const time = new Date(Date.now() - i * 1000 * 5).toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

      initialTrades.push({
        price: price.toFixed(2),
        size: size.toFixed(4),
        time: time,
        type: type
      });
    }
    setTrades(initialTrades);

    // Update loop
    const interval = setInterval(() => {
      // Always try to center around current market price
      let currentPrice = basePrice;
      if (mappedSymbol && priceDatasState[mappedSymbol]?.tickPrice) {
        currentPrice = priceDatasState[mappedSymbol].tickPrice;
      }

      const type = Math.random() > 0.5 ? "buy" : "sell";
      // Trade price is close to market price
      const price = currentPrice + (Math.random() - 0.5) * (currentPrice * 0.0005);
      const size = Math.random() * 2 + 0.1;
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const newTrade: Trade = {
        price: price.toFixed(2),
        size: size.toFixed(4),
        time: time,
        type: type
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 30));
    }, 800);

    return () => clearInterval(interval);
  }, [market, priceDatasState]);

  return (
    <Card className="flex h-full flex-col rounded-none border-0 p-3">
      <h3 className="mb-3 mt-3 text-sm font-semibold text-center">Recent Trades</h3>

      <div className="mb-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="text-left">Price (USD)</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-auto">
        {trades.map((trade, i) => (
          <div
            key={i}
            className={`grid grid - cols - 3 gap - 2 py - 0.5 text - xs font - mono hover: bg - muted / 50 ${trade.type === "buy" ? "text-success" : "text-destructive"
              } `}
          >
            <div className="text-left">{trade.price}</div>
            <div className="text-right text-foreground">{trade.size}</div>
            <div className="text-right text-muted-foreground">{trade.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
