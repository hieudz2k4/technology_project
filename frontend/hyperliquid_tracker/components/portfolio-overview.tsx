"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface PortfolioOverviewProps {
  isLoading: boolean
}

export default function PortfolioOverview({ isLoading }: PortfolioOverviewProps) {
  const stats = [
    {
      label: "Total Balance",
      value: "$125,432.50",
      change: "+12.5%",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "Unrealized P&L",
      value: "$8,234.75",
      change: "+6.2%",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "Total Positions",
      value: "5",
      change: "2 Long, 3 Short",
      positive: null,
      icon: null,
    },
    {
      label: "Account Leverage",
      value: "5.2x",
      change: "Max: 20x",
      positive: null,
      icon: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p
                  className={`text-xs mt-2 ${
                    stat.positive === true
                      ? "text-green-500"
                      : stat.positive === false
                        ? "text-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              {Icon && (
                <div className={`p-2 rounded-lg ${stat.positive ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <Icon className={`w-5 h-5 ${stat.positive ? "text-green-500" : "text-red-500"}`} />
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
