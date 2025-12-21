import { useEffect, useRef } from "react";
import {
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
  widget,
} from "@/public/static/charting_library";
import { Datafeed } from "@/lib/datafeed";

export const TradingView = (props: Partial<ChartingLibraryWidgetOptions>) => {
  const chartContainerRef = useRef<HTMLDivElement>(
    null,
  ) as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      library_path: props.library_path,
      container: chartContainerRef.current,
      symbol: props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: Datafeed,
      interval: props.interval as ResolutionString,
      theme: props.theme,
      locale: props.locale as LanguageCode,
      disabled_features: [
        "use_localstorage_for_settings",
        "header_symbol_search",
        "symbol_search_hot_key",
        "header_compare",
      ],
      enabled_features: ["study_templates"],
      charts_storage_url: props.charts_storage_url,
      charts_storage_api_version: props.charts_storage_api_version,
      client_id: props.client_id,
      user_id: props.user_id,
      fullscreen: props.fullscreen,
      autosize: props.autosize,
      debug: true,
    };

    const tvWidget = new widget(widgetOptions);

    return () => {
      tvWidget.remove();
    };
  }, [props]);

  return (
    <>
      <div ref={chartContainerRef} className="w-full h-full" />
    </>
  );
};
