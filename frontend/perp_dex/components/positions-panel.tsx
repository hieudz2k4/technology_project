"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

// Removed mock positions


const orders = [
  {
    market: "SOL/USD",
    side: "Long",
    type: "Limit",
    size: "10.0",
    price: "140.00",
    filled: "0%",
  },
]

const tradeHistory = [
  {
    market: "BTC/USD",
    side: "Long",
    size: "0.3",
    entryPrice: "61,200.00",
    exitPrice: "63,450.00",
    pnl: "+675.00",
    time: "2024-01-15 12:34",
    positive: true,
  },
  {
    market: "ETH/USD",
    side: "Short",
    size: "1.5",
    entryPrice: "3,600.00",
    exitPrice: "3,520.00",
    pnl: "+120.00",
    time: "2024-01-15 10:22",
    positive: true,
  },
]

// Define types
interface BackendOrder {
  id: number;
  senderAddress: string;
  pair: string;
  side: string;
  type: string;
  entryPrice: number;
  size: number;
  filled: number;
}

interface BackendPosition {
  market: string;
  side: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  liqPrice: string;
  margin: string;
  pnl: string;
  pnlPercent: string;
  positive: boolean;
}

import useUserDataStore from "@/store/UserData"

export function PositionsPanel() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [positions, setPositions] = useState<BackendPosition[]>([]);
  const { balance } = useUserDataStore();

  return (
    <div className="h-full border-t border-border bg-card">
      <Tabs defaultValue="positions" className="h-full">
        <div className="flex items-center justify-between border-b border-border px-4">
          <TabsList className="h-12 bg-transparent">
            <TabsTrigger value="positions">Positions ({positions.length})</TabsTrigger>
            <TabsTrigger value="orders">Open Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="positions" className="m-0 h-[calc(100%-3rem)] overflow-auto p-4">
          {positions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Market</th>
                    <th className="pb-2 font-medium">Side</th>
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium">Entry Price</th>
                    <th className="pb-2 font-medium">Mark Price</th>
                    <th className="pb-2 font-medium">Liq. Price</th>
                    <th className="pb-2 font-medium">Margin</th>
                    <th className="pb-2 font-medium">PnL</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 font-mono font-semibold">{position.market}</td>
                      <td className="py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${position.side === "Long"
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                            }`}
                        >
                          {position.side}
                        </span>
                      </td>
                      <td className="py-3 font-mono">{position.size}</td>
                      <td className="py-3 font-mono">${position.entryPrice}</td>
                      <td className="py-3 font-mono">${position.markPrice}</td>
                      <td className="py-3 font-mono">${position.liqPrice}</td>
                      <td className="py-3 font-mono">${position.margin}</td>
                      <td className="py-3">
                        <div className="font-mono">
                          <div className={position.positive ? "text-success" : "text-destructive"}>{position.pnl}</div>
                          <div className={`text-xs ${position.positive ? "text-success" : "text-destructive"}`}>
                            {position.pnlPercent}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          Close
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No open positions</div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="m-0 h-[calc(100%-3rem)] overflow-auto p-4">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Market</th>
                    <th className="pb-2 font-medium">Side</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium">Price</th>
                    <th className="pb-2 font-medium">Filled</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 font-mono font-semibold">{order.pair}</td>
                      <td className="py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-semibold ${order.side === "BUY" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                            }`}
                        >
                          {order.side}
                        </span>
                      </td>
                      <td className="py-3">{order.type}</td>
                      <td className="py-3 font-mono">{(order.size / 1000).toFixed(3)}</td>
                      <td className="py-3 font-mono">${(order.entryPrice / 100).toFixed(2)}</td>
                      <td className="py-3 font-mono">{order.filled}%</td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">No open orders</div>
          )}
        </TabsContent>

        <TabsContent value="history" className="m-0 h-[calc(100%-3rem)] overflow-auto p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Market</th>
                  <th className="pb-2 font-medium">Side</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Entry Price</th>
                  <th className="pb-2 font-medium">Exit Price</th>
                  <th className="pb-2 font-medium">PnL</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((trade, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 font-mono font-semibold">{trade.market}</td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${trade.side === "Long" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                          }`}
                      >
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-3 font-mono">{trade.size}</td>
                    <td className="py-3 font-mono">${trade.entryPrice}</td>
                    <td className="py-3 font-mono">${trade.exitPrice}</td>
                    <td className={`py-3 font-mono ${trade.positive ? "text-success" : "text-destructive"}`}>
                      {trade.pnl}
                    </td>
                    <td className="py-3 text-muted-foreground">{trade.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="balance" className="m-0 h-[calc(100%-3rem)] overflow-auto p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Total Balance</div>
              <div className="mt-1 font-mono text-2xl font-bold">${balance}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Available Balance</div>
              <div className="mt-1 font-mono text-2xl font-bold">${balance}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="text-xs text-muted-foreground">Unrealized PnL</div>
              <div className="mt-1 font-mono text-2xl font-bold text-success">+$1,018.69</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
