"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MarketStatsProps {
  isLoading: boolean
}

export default function MarketStats({ isLoading }: MarketStatsProps) {
  const topAssets = [
    { symbol: "BTC", price: "$45,230", change: "+2.5%", volume: "$2.3B", positive: true },
    { symbol: "ETH", price: "$2,280", change: "+1.8%", volume: "$1.1B", positive: true },
    { symbol: "SOL", price: "$142.30", change: "-0.5%", volume: "$450M", positive: false },
    { symbol: "ARB", price: "$1.72", change: "-3.2%", volume: "$280M", positive: false },
    { symbol: "OP", price: "$2.58", change: "+0.8%", volume: "$195M", positive: true },
  ]

  const stats = [
    { label: "Total Volume", value: "$4.3B" },
    { label: "Open Interest", value: "$12.5B" },
    { label: "Funding Rate", value: "0.0125%" },
    { label: "Market Cap", value: "$2.1T" },
  ]

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Market Overview</h2>
        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex justify-between items-center pb-3 border-b border-border last:border-0">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Assets */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Top Assets</h2>
        <div className="space-y-3">
          {topAssets.map((asset, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{asset.symbol}</p>
                <p className="text-xs text-muted-foreground">{asset.price}</p>
              </div>
              <div className="text-right">
                <Badge variant={asset.positive ? "default" : "secondary"} className="mb-1">
                  {asset.change}
                </Badge>
                <p className="text-xs text-muted-foreground">{asset.volume}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
