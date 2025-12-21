"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "./header";
import { TradingChart } from "./trading-chart";
import { OrderForm } from "./order-form";
import { OrderBook } from "./order-book";
import { RecentTrades } from "./recent-trades";
import { PositionsPanel } from "./positions-panel";

export function TradingInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");

  useEffect(() => {
    const marketParam = searchParams.get("market");
    if (marketParam) {
      setSelectedMarket(marketParam);
    }
  }, [searchParams]);

  const handleMarketChange = (market: string) => {
    router.push(`/trade?market=${market}`);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        selectedMarket={selectedMarket}
        onMarketChange={handleMarketChange}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Order Form */}
        <div className="hidden w-80 border-r border-border lg:block">
          <OrderForm market={selectedMarket} />
        </div>

        {/* Center Panel - Chart */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 border-b border-border">
            <TradingChart market={selectedMarket} />
          </div>

          {/* Bottom Panel - Positions */}
          <div className="h-64 overflow-auto">
            <PositionsPanel />
          </div>
        </div>

        {/* Right Panel - Order Book & Trades */}
        <div className="hidden w-80 border-l border-border xl:block">
          <div className="flex h-full flex-col">
            <div className="flex-1 border-b border-border">
              <OrderBook market={selectedMarket} />
            </div>
            <div className="h-64">
              <RecentTrades market={selectedMarket} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
