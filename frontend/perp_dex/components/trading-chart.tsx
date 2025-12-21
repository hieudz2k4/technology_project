"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "@/public/static/charting_library/charting_library";
import dynamic from "next/dynamic";
import { useState } from "react";
import Script from "next/script";
import useDataPriceStore from "@/store/DataPrice";
import { HeaderTradingChart } from "./header-trading-chart";
import { useTfStore } from "@/store/Timeframe";

const TradingView = dynamic(
  () => import("@/components/tradingview").then((mod) => mod.TradingView),
  { ssr: false },
);

interface TradingChartProps {
  market: string;
}

export function TradingChart({ market }: TradingChartProps) {
  const selectedTf = useTfStore((state) => state.selectedTf);
  const [isScriptReady, setIsScriptReady] = useState(false);
  // const pricesState = useDataPriceStore((state) => state.prices);
  const resolutionMap: Record<string, ResolutionString> = {
    "1m": "1" as ResolutionString,
    "5m": "5" as ResolutionString,
    "15m": "15" as ResolutionString,
    "1H": "60" as ResolutionString,
    "4H": "240" as ResolutionString,
    "1D": "D" as ResolutionString,
    "1W": "W" as ResolutionString,
    "1M": "M" as ResolutionString,
  };

  const symbolMap: Record<string, string> = {
    "BTC/USD": "BTCUSD_PERP",
    "ETH/USD": "ETHUSD_PERP",
    "SOL/USD": "SOLUSD_PERP",
  };

  const widgetProps: Partial<ChartingLibraryWidgetOptions> = {
    library_path: "/static/charting_library/",
    symbol: symbolMap[market] || "BTCUSDT.P",
    interval: resolutionMap[selectedTf] || ("60" as ResolutionString),
    locale: "en",
    theme: "dark",
    charts_storage_url: "https://saveload.tradingview.com",
    charts_storage_api_version: "1.1",
    client_id: "tradingview.com",
    user_id: "public_user_id",
    fullscreen: false,
    autosize: true,
  };

  return (
    <Card className="flex h-full flex-col rounded-none border-0 py-0 gap-0 ">
      <HeaderTradingChart market={market} />
      <div className="relative flex-1 bg-gradient-to-b from-background to-muted/20">
        <Script
          src="/static/datafeeds/udf/dist/bundle.js"
          strategy="lazyOnload"
          onReady={() => setIsScriptReady(true)}
        />

        {isScriptReady ? (
          <div className="absolute inset-0 ">
            <TradingView {...widgetProps} />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Loading Chart...
          </div>
        )}
      </div>
    </Card>
  );
}
