"use client";

import { useEffect } from "react";

type Props = {
    className?: string;
    style?: React.CSSProperties;
    dataAdClient: string;
    dataAdSlot: string;
    dataAdFormat?: "auto" | "fluid" | "rectangle";
    dataFullWidthResponsive?: boolean;
};

export default function AdUnit({
    className,
    style,
    dataAdClient,
    dataAdSlot,
    dataAdFormat = "auto",
    dataFullWidthResponsive = true
}: Props) {

    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div className={className} style={style}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={dataAdClient}
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive}
            />
        </div>
    );
}
