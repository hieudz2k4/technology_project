"use client"

import { useState, useEffect } from "react"
import DashboardHeader from "@/components/dashboard-header"
import PortfolioOverview from "@/components/portfolio-overview"
import PositionsTable from "@/components/positions-table"
import MarketStats from "@/components/market-stats"
import TradingMetrics from "@/components/trading-metrics"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Portfolio Overview Section */}
        <PortfolioOverview isLoading={isLoading} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trading Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <TradingMetrics isLoading={isLoading} />
            <PositionsTable isLoading={isLoading} />
          </div>

          {/* Right Column - Market Stats */}
          <div>
            <MarketStats isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
  )
}
