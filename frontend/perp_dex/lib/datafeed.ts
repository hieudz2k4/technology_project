import {
  Bar,
  DatafeedConfiguration,
  LibrarySymbolInfo,
  PeriodParams,
  ResolutionString,
  SearchSymbolResultItem,
  SeriesFormat,
  Timezone,
} from "@/public/static/charting_library/charting_library";
import { WebSocketManager } from "./WebSocketManager";

const coinDeskRestAPIUrl = process.env.NEXT_PUBLIC_COINDESK_REST_API_URL;
const coinDeskAPIKey = process.env.NEXT_PUBLIC_COINDESK_API_KEY;

const tailUrls: Record<string, string> = {
  "1": "historical/minutes?market=binance&limit=2000&aggregate=1&fill=true&apply_mapping=true",
  "5": "historical/minutes?market=binance&limit=400&aggregate=5&fill=true&apply_mapping=true",
  "15": "historical/minutes?market=binance&limit=133&aggregate=15&fill=true&apply_mapping=true",
  "60": "historical/hours?market=binance&limit=2000&aggregate=1&fill=true&apply_mapping=true",
  "240":
    "historical/hours?market=binance&limit=500&aggregate=4&fill=true&apply_mapping=true",
  "1D": "historical/days?market=binance&limit=5000&aggregate=1&fill=true&apply_mapping=true",
  W: "historical/days?market=binance&limit=5000&aggregate=7&fill=true&apply_mapping=true",
  M: "historical/days?market=binance&limit=5000&aggregate=1&fill=true&apply_mapping=true",
};

console.log("CoinDesk REST API URL:", coinDeskRestAPIUrl);

// Map to store callbacks for unsubscription (ListenerGUID -> {symbol, callback})
const subscriberRegistry = new Map<string, { symbol: string; onTick: (bar: Bar) => void }>();

export const Datafeed = {
  onReady: (callback: (config: DatafeedConfiguration) => void): void => {
    console.log("Datafeed on ready");
    setTimeout(() => {
      callback({
        supported_resolutions: [
          "1",
          "5",
          "15",
          "60",
          "240",
          "D",
          "W",
          "M",
        ] as ResolutionString[],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
      });
    }, 0);
  },

  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: (item: SearchSymbolResultItem[]) => void,
  ): void => {
    onResult([]);
  },

  resolveSymbol: async (
    symbolName: string,
    onResolve: (symbolInfo: LibrarySymbolInfo) => void,
    onError: (error: string) => void,
  ) => {
    console.log("resolveSymbol:", symbolName);
    const symbolInfo = {
      name: symbolName,
      ticker: symbolName,
      description: symbolName,
      type: "crypto",
      exchange: "DZDEX",
      listed_exchange: "DZDEX",
      format: "price" as SeriesFormat,
      session: "24x7",
      timezone: "Etc/UTC" as Timezone,
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      intraday_multipliers: ["1", "5", "15", "60", "240"],
      supported_resolutions: [
        "1",
        "5",
        "15",
        "60",
        "240",
        "D",
        "W",
        "M",
      ] as ResolutionString[],
      volume_precision: 2,
      data_status: "streaming" as const,
    };

    setTimeout(() => {
      onResolve(symbolInfo);
    }, 0);
  },

  getBars: async (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: (bars: Bar[], meta: { noData: boolean }) => void,
    onError: (error: string) => void,
  ) => {
    console.log(
      "Get history bars for:",
      symbolInfo.name,
      resolution,
      periodParams,
    );

    const { from, to } = periodParams;
    const to_ts = Math.floor(to);
    const tailUrl = tailUrls[resolution];

    if (!tailUrl) {
      onError("Unsupported resolution: " + resolution);
      return;
    }

    const historicalEndpoint = `${coinDeskRestAPIUrl}${tailUrl}&instrument=${symbolInfo.name}&to_ts=${to_ts}`;

    console.log("Fetching historical data from:", historicalEndpoint);
    try {
      const response = await fetch(historicalEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Apikey ${coinDeskAPIKey}`,
        },
      });
      const data = await response.json();

      if (!data.Data || !Array.isArray(data.Data)) {
        onResult([], { noData: true });
        return;
      }

      const bars: Bar[] = data.Data.map((bar: any) => ({
        time: bar.TIMESTAMP * 1000,
        open: bar.OPEN,
        high: bar.HIGH,
        low: bar.LOW,
        close: bar.CLOSE,
        volume: bar.VOLUME,
      }));

      onResult(bars, { noData: bars.length === 0 });
    } catch (error) {
      onError("Failed to fetch historical data: " + error);
    }
  },

  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: (bar: Bar) => void,
    listenerGUID: string,
    onResetCacheNeededCallback: () => void,
  ) => {
    console.log("[Datafeed] subscribeBars:", symbolInfo.name, listenerGUID);
    subscriberRegistry.set(listenerGUID, { symbol: symbolInfo.name, onTick });
    WebSocketManager.getInstance().subscribe(symbolInfo.name, onTick);
  },

  unsubscribeBars: (listenerUID: string) => {
    console.log("[Datafeed] unsubscribeBars:", listenerUID);
    const sub = subscriberRegistry.get(listenerUID);
    if (sub) {
      WebSocketManager.getInstance().unsubscribe(sub.symbol, sub.onTick);
      subscriberRegistry.delete(listenerUID);
    }
  },
};
