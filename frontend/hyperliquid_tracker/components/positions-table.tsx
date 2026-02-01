"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PositionsTableProps {
  isLoading: boolean
}

export default function PositionsTable({ isLoading }: PositionsTableProps) {
  const positions = [
    {
      symbol: "BTC",
      side: "LONG",
      size: "0.5",
      entryPrice: "$42,500",
      currentPrice: "$45,230",
      pnl: "+$1,365",
      pnlPercent: "+6.4%",
      leverage: "5x",
      positive: true,
    },
    {
      symbol: "ETH",
      side: "LONG",
      size: "5.0",
      entryPrice: "$2,150",
      currentPrice: "$2,280",
      pnl: "+$650",
      pnlPercent: "+6.0%",
      leverage: "3x",
      positive: true,
    },
    {
      symbol: "SOL",
      side: "SHORT",
      size: "20.0",
      entryPrice: "$145.50",
      currentPrice: "$142.30",
      pnl: "+$64",
      pnlPercent: "+2.2%",
      leverage: "2x",
      positive: true,
    },
    {
      symbol: "ARB",
      side: "LONG",
      size: "100.0",
      entryPrice: "$1.85",
      currentPrice: "$1.72",
      pnl: "-$130",
      pnlPercent: "-7.0%",
      leverage: "4x",
      positive: false,
    },
    {
      symbol: "OP",
      side: "SHORT",
      size: "50.0",
      entryPrice: "$2.45",
      currentPrice: "$2.58",
      pnl: "-$65",
      pnlPercent: "-5.3%",
      leverage: "2x",
      positive: false,
    },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Open Positions</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Symbol</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Side</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Size</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Entry</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Current</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">P&L</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Leverage</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-4 font-semibold text-foreground">{pos.symbol}</td>
                <td className="py-4 px-4">
                  <Badge variant={pos.side === "LONG" ? "default" : "secondary"}>{pos.side}</Badge>
                </td>
                <td className="py-4 px-4 text-right text-foreground">{pos.size}</td>
                <td className="py-4 px-4 text-right text-muted-foreground">{pos.entryPrice}</td>
                <td className="py-4 px-4 text-right text-foreground font-medium">{pos.currentPrice}</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {pos.positive ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={pos.positive ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                      {pos.pnl}
                    </span>
                  </div>
                  <p className={`text-xs ${pos.positive ? "text-green-500/70" : "text-red-500/70"}`}>
                    {pos.pnlPercent}
                  </p>
                </td>
                <td className="py-4 px-4 text-right text-muted-foreground">{pos.leverage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
