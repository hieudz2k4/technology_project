"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDataPriceStore from "@/store/DataPrice";
import { mapperSymbol } from "@/lib/mapper_symbol";

const marketData = [
  {
    symbol: "BTC/USD",
    price: 64234.5,
    change24h: 2.34,
    volume24h: 28500000000,
    high24h: 65000,
    low24h: 62500,
    favorite: false,
  },
  {
    symbol: "ETH/USD",
    price: 3456.78,
    change24h: 1.23,
    volume24h: 15200000000,
    high24h: 3500,
    low24h: 3400,
    favorite: false,
  },
  {
    symbol: "SOL/USD",
    price: 145.67,
    change24h: -0.89,
    volume24h: 2100000000,
    high24h: 148,
    low24h: 142,
    favorite: true,
  },
  {
    symbol: "ARB/USD",
    price: 1.23,
    change24h: 5.67,
    volume24h: 450000000,
    high24h: 1.25,
    low24h: 1.15,
    favorite: false,
  },
  {
    symbol: "OP/USD",
    price: 2.45,
    change24h: 3.21,
    volume24h: 320000000,
    high24h: 2.5,
    low24h: 2.35,
    favorite: false,
  },
  {
    symbol: "DOGE/USD",
    price: 0.38,
    change24h: -1.45,
    volume24h: 890000000,
    high24h: 0.4,
    low24h: 0.37,
    favorite: true,
  },
  {
    symbol: "AVAX/USD",
    price: 35.67,
    change24h: 4.12,
    volume24h: 1200000000,
    high24h: 36.5,
    low24h: 34.2,
    favorite: false,
  },
  {
    symbol: "LINK/USD",
    price: 28.9,
    change24h: 2.89,
    volume24h: 850000000,
    high24h: 29.5,
    low24h: 28.0,
    favorite: false,
  },
];

export default function MarketsPage() {
  console.log("Rendering MarketsPage");

  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState(
    marketData.filter((m) => m.favorite).map((m) => m.symbol),
  );

  const priceDatasState = useDataPriceStore((state) => state.priceDatas);

  const allowedSymbols = ["BTC/USD", "ETH/USD", "SOL/USD"];
  const filteredMarkets = marketData
    .filter((market) => allowedSymbols.includes(market.symbol))
    .filter((market) =>
      market.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol],
    );
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    return `$${volume.toFixed(0)}`;
  };

  console.log("Page: " + priceDatasState["BTCUSD_PERP"]?.dayChange);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Markets</h1>
            <p className="text-muted-foreground">
              Explore all available trading pairs and market data
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Markets Table */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>All Markets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Pair</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">24h Change</TableHead>
                      <TableHead className="text-right">24h High</TableHead>
                      <TableHead className="text-right">24h Low</TableHead>
                      <TableHead className="text-right">24h Volume</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMarkets.map((market) => (
                      <TableRow
                        key={market.symbol}
                        className="border-border hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <button
                            onClick={() => toggleFavorite(market.symbol)}
                            className="transition-colors hover:text-primary"
                          >
                            <Star
                              className="h-4 w-4"
                              fill={
                                favorites.includes(market.symbol)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {market.symbol}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          $
                          {priceDatasState?.[mapperSymbol[market.symbol]]
                            ?.tickPrice ?? ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              (priceDatasState?.[mapperSymbol[market.symbol]]
                                ?.dayChange ?? 0) > 0
                                ? "text-success border-success/30"
                                : "text-destructive border-destructive/30"
                            }
                          >
                            {(priceDatasState?.[mapperSymbol[market.symbol]]
                              ?.dayChange ?? 0) > 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {(
                              priceDatasState?.[mapperSymbol[market.symbol]]
                                ?.dayChange ?? 0
                            ).toFixed(2)}
                            %
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          $
                          {priceDatasState?.[mapperSymbol[market.symbol]]
                            ?.dayHigh ?? ""}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          $
                          {priceDatasState?.[mapperSymbol[market.symbol]]
                            ?.dayLow ?? ""}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatVolume(market.volume24h)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => router.push(`/trade?market=${market.symbol}`)}
                          >
                            Trade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
