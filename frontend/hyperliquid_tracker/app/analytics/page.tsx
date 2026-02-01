"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const volumeData = [
  { date: "Mon", volume: 2400000 },
  { date: "Tue", volume: 2210000 },
  { date: "Wed", volume: 2290000 },
  { date: "Thu", volume: 2000000 },
  { date: "Fri", volume: 2181000 },
  { date: "Sat", volume: 2500000 },
  { date: "Sun", volume: 2100000 },
]

const traderDistribution = [
  { name: "Profitable", value: 65, color: "hsl(var(--chart-1))" },
  { name: "Breakeven", value: 15, color: "hsl(var(--chart-2))" },
  { name: "Losing", value: 20, color: "hsl(var(--chart-3))" },
]

const liquidationData = [
  { time: "00:00", count: 45 },
  { time: "04:00", count: 38 },
  { time: "08:00", count: 52 },
  { time: "12:00", count: 61 },
  { time: "16:00", count: 48 },
  { time: "20:00", count: 55 },
]

const assetDistribution = [
  { asset: "BTC", percentage: 35 },
  { asset: "ETH", percentage: 28 },
  { asset: "SOL", percentage: 18 },
  { asset: "Others", percentage: 19 },
]

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Market statistics and trading analytics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$15.2B</div>
              <p className="text-xs text-green-500 mt-1">+12.5% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24,580</div>
              <p className="text-xs text-green-500 mt-1">+8.2% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Liquidations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$428M</div>
              <p className="text-xs text-red-500 mt-1">+5.3% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Leverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.5x</div>
              <p className="text-xs text-muted-foreground mt-1">Stable</p>
            </CardContent>
          </Card>
        </div>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Volume (7 Days)</CardTitle>
            <CardDescription>Daily trading volume trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                volume: { label: "Volume", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="volume" fill="var(--color-volume)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trader Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Trader Distribution</CardTitle>
              <CardDescription>Percentage of profitable traders</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  profitable: { label: "Profitable", color: "hsl(var(--chart-1))" },
                  breakeven: { label: "Breakeven", color: "hsl(var(--chart-2))" },
                  losing: { label: "Losing", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={traderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {traderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Liquidations */}
          <Card>
            <CardHeader>
              <CardTitle>Liquidations (24h)</CardTitle>
              <CardDescription>Hourly liquidation count</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: { label: "Liquidations", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={liquidationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Asset Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Volume by Asset</CardTitle>
            <CardDescription>Distribution of trading volume across assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assetDistribution.map((asset) => (
                <div key={asset.asset} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{asset.asset}</span>
                    <span className="text-muted-foreground">{asset.percentage}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${asset.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
