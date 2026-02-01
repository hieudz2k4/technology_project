import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIỆT NAM MUÔN NĂM",
  description: "Tự hào Việt Nam - Cờ đỏ sao vàng",
};

import GoogleAdsense from "@/components/GoogleAdsense";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAdsense pId="YOUR-PUBLISHER-ID-HERE" />
        {children}
      </body>
    </html>
  );
}
