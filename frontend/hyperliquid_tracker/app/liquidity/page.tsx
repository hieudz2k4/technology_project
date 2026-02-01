"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface LiquidityData {
  symbol: string
  bid: number
  ask: number
  spread: number
  spreadPercent: number
  bidVolume: number
  askVolume: number
  totalVolume: number
  depth: number
}

interface LiquidityTrend {
  time: string
  volume: number
  spread: number
}

export default function LiquidityPage() {
  const [liquidityData, setLiquidityData] = useState<LiquidityData[]>([])
  const [trends, setTrends] = useState<LiquidityTrend[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState("BTC")

  useEffect(() => {
    // Mock data
    const mockData: LiquidityData[] = [
      {
        symbol: "BTC",
        bid: 42500.5,
        ask: 42501.2,
        spread: 0.7,
        spreadPercent: 0.0016,
        bidVolume: 125.5,
        askVolume: 118.3,
        totalVolume: 243.8,
        depth: 2500000,
      },
      {
        symbol: "ETH",
        bid: 2250.3,
        ask: 2250.8,
        spread: 0.5,
        spreadPercent: 0.0022,
        bidVolume: 850.2,
        askVolume: 920.1,
        totalVolume: 1770.3,
        depth: 1800000,
      },
      {
        symbol: "SOL",
        bid: 145.2,
        ask: 145.4,
        spread: 0.2,
        spreadPercent: 0.0014,
        bidVolume: 5200.5,
        askVolume: 4850.3,
        totalVolume: 10050.8,
        depth: 950000,
      },
      {
        symbol: "ARB",
        bid: 0.85,
        ask: 0.851,
        spread: 0.001,
        spreadPercent: 0.0012,
        bidVolume: 125000,
        askVolume: 118000,
        totalVolume: 243000,
        depth: 450000,
      },
      {
        symbol: "OP",
        bid: 2.15,
        ask: 2.152,
        spread: 0.002,
        spreadPercent: 0.0009,
        bidVolume: 85000,
        askVolume: 92000,
        totalVolume: 177000,
        depth: 380000,
      },
    ]

    const mockTrends: LiquidityTrend[] = [
      { time: "00:00", volume: 1200000, spread: 0.0018 },
      { time: "04:00", volume: 1400000, spread: 0.0016 },
      { time: "08:00", volume: 1800000, spread: 0.0014 },
      { time: "12:00", volume: 2200000, spread: 0.0012 },
      { time: "16:00", volume: 2500000, spread: 0.0015 },
      { time: "20:00", volume: 2100000, spread: 0.0017 },
      { time: "24:00", volume: 1900000, spread: 0.0016 },
    ]

    setLiquidityData(mockData)
    setTrends(mockTrends)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Liquidity Analysis</h1>
          <p className="text-muted-foreground">Real-time market depth and liquidity metrics</p>
        </div>

        {/* Liquidity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Trends</CardTitle>
            <CardDescription>24-hour volume and spread analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="volume" className="w-full">
              <TabsList>
                <TabsTrigger value="volume">Volume</TabsTrigger>
                <TabsTrigger value="spread">Spread</TabsTrigger>
              </TabsList>
              <TabsContent value="volume" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="spread" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="spread" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Liquidity Table */}
        <Card>
          <CardHeader>
            <CardTitle>Market Depth</CardTitle>
            <CardDescription>Current bid-ask spreads and order book depth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Bid Price</TableHead>
                    <TableHead className="text-right">Ask Price</TableHead>
                    <TableHead className="text-right">Spread</TableHead>
                    <TableHead className="text-right">Spread %</TableHead>
                    <TableHead className="text-right">Bid Volume</TableHead>
                    <TableHead className="text-right">Ask Volume</TableHead>
                    <TableHead className="text-right">Total Volume</TableHead>
                    <TableHead className="text-right">Depth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liquidityData.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-bold">{item.symbol}</TableCell>
                      <TableCell className="text-right text-green-500">${item.bid.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-500">${item.ask.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${item.spread.toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{(item.spreadPercent * 100).toFixed(3)}%</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{item.bidVolume.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{item.askVolume.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">{item.totalVolume.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${(item.depth / 1000000).toFixed(1)}M</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
