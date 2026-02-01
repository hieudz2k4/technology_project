"use client";

import { useEffect, useRef } from "react";

interface TradingChartProps {
    symbol?: string;
    theme?: "light" | "dark";
    autosize?: boolean;
}

export default function TradingChart({
    symbol = "BINANCE:BTCUSDT",
    theme = "dark",
    autosize = true,
}: TradingChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Check if script is already present to prevent duplicates (though cleaning up is better)
        if (containerRef.current.querySelector("script")) return;

        const script = document.createElement("script");
        script.src =
            "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize: autosize,
            symbol: symbol,
            interval: "D",
            timezone: "Etc/UTC",
            theme: theme,
            style: "1",
            locale: "en",
            enable_publishing: false,
            allow_symbol_change: true,
            calendar: false,
            support_host: "https://www.tradingview.com",
        });

        containerRef.current.appendChild(script);

        // Cleanup isn't strictly necessary for the widget itself as it replaces content,
        // but good practice if we were mounting/unmounting frequently.
        // However, the widget script modifies the DOM extensively.
        // Ideally we wipe the container on unmount.
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [symbol, theme, autosize]);

    return (
        <div
            className="tradingview-widget-container h-full w-full"
            ref={containerRef}
        >
            <div
                className="tradingview-widget-container__widget"
                style={{ height: "calc(100% - 32px)", width: "100%" }}
            ></div>
            <div className="tradingview-widget-copyright">
                <a
                    href="https://www.tradingview.com/"
                    rel="noopener nofollow"
                    target="_blank"
                >
                    <span className="blue-text">Track all markets on TradingView</span>
                </a>
            </div>
        </div>
    );
}
