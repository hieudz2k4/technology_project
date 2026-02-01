"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  LineChart,
  CircleDollarSign,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/leaderboard", label: "Leaderboard", icon: Users },
    { href: "/usdt-tracker", label: "USDT Tracker", icon: CircleDollarSign },
    { href: "/analytics", label: "Analytics", icon: Zap },
  ];

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 overflow-x-auto">
          <Link
            href="/"
            className="font-bold text-lg text-primary whitespace-nowrap mr-8"
          >
            HyperTracker
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
