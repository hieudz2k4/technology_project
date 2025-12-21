"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHotkeys } from "@/lib/hotkey";
import useDataPriceStore from "@/store/DataPrice";
import { mapperSymbol } from "@/lib/mapper_symbol";
import { useDataObserverRealTime } from "@/lib/data_observer_realtime";
import { useRouter } from "next/navigation";
import { CustomConnectButton } from "@/components/CustomConnectButton";
import { useThemeStore } from "@/store/ThemeState";

interface HeaderProps {
  selectedMarket?: string;
  onMarketChange?: (market: string) => void;
}

const markets = [
  { symbol: "BTC/USD", price: "64,234.50", change: "+2.34%", positive: true },
  { symbol: "ETH/USD", price: "3,456.78", change: "+1.23%", positive: true },
  { symbol: "SOL/USD", price: "145.67", change: "-0.89%", positive: false },
];

export function Header({
  selectedMarket = "BTC/USD",
  onMarketChange,
}: HeaderProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();
  const priceDatasState = useDataPriceStore((state) => state.priceDatas);
  const themeStore = useThemeStore();
  useHotkeys();
  useDataObserverRealTime();
  const router = useRouter();
  const pathName = usePathname();

  const connectWallet = () => {
    console.log("Connect Wallet clicked");

    if (pathName != "/portfolio") {
      router.push("/portfolio");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    themeStore.setSelectedTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const currentMarket =
    markets.find((m) => m.symbol === selectedMarket) || markets[0];

  const navItems = [
    { href: "/markets", label: "Markets" },
    { href: "/trade", label: "Trade" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/chatbot", label: "AI Finance Assistant" },
    { href: "/docs", label: "Docs" },
  ];

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4">
      {/* Logo & Navigation */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-lg font-bold text-primary-foreground">
              DZ
            </span>
          </div>
          <span className="text-xl font-bold">DZDEX</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`text-sm transition-colors ${pathname === item.href
                  ? "font-semibold text-primary"
                  : "hover:text-primary"
                  }`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Market Selector & Controls */}
      <div className="flex items-center gap-4">
        {pathname === "/trade" && onMarketChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden gap-2 lg:flex">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">
                      {currentMarket.symbol}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono">
                      $
                      {priceDatasState?.[mapperSymbol[currentMarket.symbol]]
                        ?.tickPrice ?? ""}
                    </span>
                    <span
                      className={
                        (priceDatasState?.[mapperSymbol[currentMarket.symbol]]
                          ?.dayChange ?? 0) > 0
                          ? "text-success"
                          : "text-destructive"
                      }
                    >
                      {(priceDatasState?.[mapperSymbol[currentMarket.symbol]]
                        ?.dayChange ?? 0) > 0
                        ? "+"
                        : ""}
                      {priceDatasState?.[mapperSymbol[currentMarket.symbol]]
                        ?.dayChange ?? 0}
                      %
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {markets.map((market) => (
                <DropdownMenuItem
                  key={market.symbol}
                  onClick={() => onMarketChange(market.symbol)}
                  className="flex items-center justify-between"
                >
                  <span className="font-mono font-semibold">
                    {market.symbol}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono">
                      $
                      {priceDatasState?.[
                        mapperSymbol[market.symbol]
                      ]?.tickPrice?.toFixed(2) ?? "--"}
                    </span>
                    <span
                      className={
                        (priceDatasState?.[mapperSymbol[market.symbol]]
                          ?.dayChange ?? 0) > 0
                          ? "text-success"
                          : "text-destructive"
                      }
                    >
                      {(priceDatasState?.[mapperSymbol[market.symbol]]?.dayChange ??
                        0) > 0
                        ? "+"
                        : ""}
                      {priceDatasState?.[mapperSymbol[market.symbol]]
                        ?.dayChange ?? 0}
                      %
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Theme Toggle & Connect Wallet */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="transition-transform hover:scale-110"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <CustomConnectButton />

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
