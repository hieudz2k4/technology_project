import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import { mapperSymbol } from "@/lib/mapper_symbol";
import useDataPriceStore from "@/store/DataPrice";
import { useTfStore } from "@/store/Timeframe";

export const HeaderTradingChart = (market: any) => {
  const priceDatasState = useDataPriceStore((state) => state.priceDatas);
  const priceDataSymbol = priceDatasState?.[mapperSymbol[market.market]];
  const tickPrice = priceDataSymbol?.tickPrice;
  const dayHighPrice = priceDataSymbol?.dayHigh;
  const dayLowPrice = priceDataSymbol?.dayLow;
  const dayOpenPrice = priceDataSymbol?.dayOpen;
  const dayChangePrice = priceDataSymbol?.dayChange;

  const { selectedTf, setSelectedTf } = useTfStore();
  const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "1W", "1M"];

  return (
    <>
      <div className="flex items-center justify-between border-b border-border p-3 py-5 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {dayChangePrice >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className="font-mono text-2xl font-bold">
              ${tickPrice ?? ""}
            </span>
            <span
              className={`text-sm ${dayChangePrice >= 0 ? "text-success" : "text-destructive"}`}
            >
              {dayChangePrice > 0 ? "+" : ""}
              {dayChangePrice?.toFixed(2) ?? ""}%
            </span>
          </div>
          <div className="hidden gap-4 text-xs text-muted-foreground md:flex">
            <div>
              <span className="mr-1">24h Open:</span>
              <span className="font-mono">${dayOpenPrice ?? ""}</span>
            </div>
            <div>
              <span className="mr-1">24h High:</span>
              <span className="font-mono">${dayHighPrice ?? ""}</span>
            </div>
            <div>
              <span className="mr-1">24h Low:</span>
              <span className="font-mono">${dayLowPrice ?? ""} </span>
            </div>
            <div>
              <span className="mr-1">Funding rate:</span>
              <span className="font-mono">0.01%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              onClick={() => setSelectedTf(tf)}
              variant={tf === selectedTf ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};
