"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import useDataPriceStore from "@/store/DataPrice";
import { mapperSymbol } from "@/lib/mapper_symbol";

interface OrderBookProps {
  market: string;
}

interface OrderBookLevel {
  price: number;
  size: number;
}

interface OrderBookDto {
  symbol: string;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  timestamp: number;
}

export function OrderBook({ market }: OrderBookProps) {
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const priceDatasState = useDataPriceStore((state) => state.priceDatas);

  useEffect(() => {
    // Basic mock data setup
    let basePrice = 90000;

    // Attempt to get real price from store
    const mappedSymbol = mapperSymbol[market];
    if (mappedSymbol && priceDatasState[mappedSymbol]?.tickPrice) {
      basePrice = priceDatasState[mappedSymbol].tickPrice;
    } else {
      // Fallback
      if (market.startsWith("ETH")) basePrice = 3000;
      else if (market.startsWith("SOL")) basePrice = 150;
      else if (market.startsWith("BTC")) basePrice = 95000;
    }

    const generateMockData = () => {
      // If we have a live price, we should probably stick close to it rather than wandering too far off 
      // with a persistent cumulative random walk that ignores the updated store price.
      // So let's re-fetch base price inside the interval if possible, or use a ref?
      // Actually, since priceDatasState changes, this effect might re-run if we include it in deps, 
      // or we can just read it if we are careful. 
      // Better: Let's use a local ref or just rely on the effect re-triggering if we add priceDatasState to dependency array?
      // Re-triggering the whole effect on every price tick (100ms) might be too much for the interval setup.
      // Let's keep the interval but read the latest price from a ref or just let the random walk happen 
      // and maybe reset 'basePrice' to the store price occasionally?

      // Simpler approach for "Mock around Market": use the store price as the center *every time* we generate.
      let currentCenter = basePrice;
      if (mappedSymbol && priceDatasState[mappedSymbol]?.tickPrice) {
        currentCenter = priceDatasState[mappedSymbol].tickPrice;
      }

      const spread = currentCenter * 0.0005;

      // Random walk around the CURRENT center
      // (Visual noise only)
      const noise = (Math.random() - 0.5) * (currentCenter * 0.001);
      const effectiveCenter = currentCenter + noise;

      const newAsks: OrderBookLevel[] = [];
      const newBids: OrderBookLevel[] = [];

      for (let i = 0; i < 15; i++) {
        // Asks
        const askPrice = effectiveCenter + spread + (i * spread) + (Math.random() * spread * 0.5);
        newAsks.push({
          price: askPrice,
          size: Math.random() * 2 + 0.1,
        });

        // Bids
        const bidPrice = effectiveCenter - spread - (i * spread) - (Math.random() * spread * 0.5);
        newBids.push({
          price: bidPrice,
          size: Math.random() * 2 + 0.1,
        });
      }

      setAsks(newAsks.sort((a, b) => a.price - b.price));
      setBids(newBids.sort((a, b) => b.price - a.price));
    };

    generateMockData();
    const interval = setInterval(generateMockData, 2000);

    return () => clearInterval(interval);
  }, [market, priceDatasState]);

  // Helper to format numbers
  const formatPrice = (price: number) => price.toFixed(2);
  const formatSize = (size: number) => size.toFixed(3);
  const calculateTotal = (orders: OrderBookLevel[]) => orders.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <Card className="flex h-full flex-col rounded-none border-0 p-3">
      <h3 className="mb-3 mt-3 text-sm font-semibold text-center">
        Order Book ({market})
      </h3>

      <div className="mb-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="text-left">Price (USD)</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-auto">
        {/* Asks (Sell Orders) - Reverse order for display (highest price top? No, usually lowest ask closest to conversion) 
            Standard: Asks (Sell): Lowest Price at bottom (closest to spread). 
            Bids (Buy): Highest Price at top (closest to spread).
        */}
        {/* We typically show Asks in descending order going UP from the spread, or ascending order?
            Visual:
            Ask High
            ...
            Ask Low
            SPREAD
            Bid High
            ...
            Bid Low
            
            So Asks should be sorted Descending? 
            If data.asks comes sorted by price ascending (100, 101, 102), we want to display 102, 101, 100.
        */}
        {/* Bids (Buy Orders) - Sort Descending (Highest at top) */}
        {[...bids].sort((a, b) => b.price - a.price).map((bid, i) => (
          <div
            key={`bid-${i}`}
            className="relative grid grid-cols-3 gap-2 py-0.5 text-xs font-mono hover:bg-success/10"
          >
            <div
              className="absolute inset-y-0 right-0 bg-success/10"
              style={{ width: `${Math.min((bid.size / 10) * 100, 100)}%` }}
            />
            <div className="relative text-left text-success">{formatPrice(bid.price)}</div>
            <div className="relative text-right">{formatSize(bid.size)}</div>
            <div className="relative text-right text-muted-foreground">
              -
            </div>
          </div>
        ))}

        {/* Spread */}
        <div className="my-2 flex items-center justify-center gap-2 border-y border-border py-2">
          {asks.length > 0 && bids.length > 0 && (
            <span className="font-mono text-lg font-bold text-success">
              {formatPrice((asks[0].price + bids[0].price) / 2)}
            </span>
          )}
          {/* <span className="text-xs text-muted-foreground">Spread: ...</span> */}
        </div>

        {/* Asks (Sell Orders) - Reverse order for display (highest price top? No, usually lowest ask closest to conversion) 
            Standard: Asks (Sell): Lowest Price at bottom (closest to spread). 
            Bids (Buy): Highest Price at top (closest to spread).
        */}
        {/* We typically show Asks in descending order going UP from the spread, or ascending order?
            Visual:
            Ask High
            ...
            Ask Low
            SPREAD
            Bid High
            ...
            Bid Low
            
            So Asks should be sorted Descending? 
            If data.asks comes sorted by price ascending (100, 101, 102), we want to display 102, 101, 100.
        */}
        {/* Asks (Sell Orders) - Display reversed (High -> Low) so lowest is at bottom */}
        {[...asks].reverse().map((ask, i) => (
          <div
            key={`ask-${i}`}
            className="relative grid grid-cols-3 gap-2 py-0.5 text-xs font-mono hover:bg-destructive/10"
          >
            <div
              className="absolute inset-y-0 right-0 bg-destructive/10"
              style={{ width: `${Math.min((ask.size / 10) * 100, 100)}%` }}
            />
            <div className="relative text-left text-destructive">
              {formatPrice(ask.price)}
            </div>
            <div className="relative text-right">{formatSize(ask.size)}</div>
            <div className="relative text-right text-muted-foreground">
              -
            </div>
          </div>
        ))}

        {asks.length === 0 && bids.length === 0 && (
          <div className="text-center text-xs text-muted-foreground mt-4">
            No orders
          </div>
        )}
      </div>
    </Card>
  );
}
