"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TradingMetricsProps {
  isLoading: boolean
}

export default function TradingMetrics({ isLoading }: TradingMetricsProps) {
  const chartData = [
    { time: "00:00", value: 120000 },
    { time: "04:00", value: 118500 },
    { time: "08:00", value: 122000 },
    { time: "12:00", value: 119800 },
    { time: "16:00", value: 125000 },
    { time: "20:00", value: 123500 },
    { time: "24:00", value: 125432 },
  ]

  const metrics = [
    { label: "Win Rate", value: "68%", color: "text-green-500" },
    { label: "Avg Win", value: "$245.50", color: "text-green-500" },
    { label: "Avg Loss", value: "-$156.25", color: "text-red-500" },
    { label: "Profit Factor", value: "2.15", color: "text-blue-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Portfolio Value Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Portfolio Value</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="value" stroke="var(--chart-1)" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Trading Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="p-4">
            <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
            <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
