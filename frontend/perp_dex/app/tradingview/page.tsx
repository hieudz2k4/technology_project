"use client";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useState } from "react";
import Script from "next/script";

import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "@/public/static/charting_library/charting_library";

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  library_path: "/static/charting_library/",
  symbol: "IBM",
  interval: "1D" as ResolutionString,
  locale: "en",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  fullscreen: true,
  autosize: true,
};

const TradingView = dynamic(
  () => import("@/components/tradingview").then((mod) => mod.TradingView),
  { ssr: false },
);

export default function TradingViewPage() {
  const [isScriptReady, setIsScriptReady] = useState(false);
  return (
    <>
      <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      {isScriptReady && <TradingView {...defaultWidgetProps} />}
    </>
  );
}
