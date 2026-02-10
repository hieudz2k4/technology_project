"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { API_URL } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Activity, ArrowUpRight, ArrowDownRight, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useHyperliquidWebSocket } from "@/hooks/use-hyperliquid-ws"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock leaderboard data (Keeping as Historical/Reference for now)
const leaderboardData = [
  {
    rank: 1,
    address: "0x1234...5678",
    pnl: 2450000,
    winRate: 68.5,
    trades: 245,
    volume: 12500000,
    roi: 245,
    createdAt: "2023-01-15",
  },
  {
    rank: 2,
    address: "0x9876...4321",
    pnl: 1850000,
    winRate: 62.3,
    trades: 189,
    volume: 9800000,
    roi: 185,
    createdAt: "2023-02-20",
  },
  {
    rank: 3,
    address: "0xabcd...efgh",
    pnl: 1620000,
    winRate: 71.2,
    trades: 156,
    volume: 8900000,
    roi: 162,
    createdAt: "2023-03-10",
  },
  {
    rank: 4,
    address: "0x5555...6666",
    pnl: 1340000,
    winRate: 58.9,
    trades: 234,
    volume: 7600000,
    roi: 134,
    createdAt: "2023-04-05",
  },
  {
    rank: 5,
    address: "0x7777...8888",
    pnl: 1120000,
    winRate: 65.4,
    trades: 178,
    volume: 6800000,
    roi: 112,
    createdAt: "2023-05-12",
  },
]

interface LeaderboardUser {
  rank: number
  address: string
  pnl: number
  winRate: number
  trades: number
  volume: number
  roi: number
  createdAt: string
}

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("pnl")
  // Whale Feed State
  const { lastWhaleTrade, isConnected } = useHyperliquidWebSocket()
  const [whaleTrades, setWhaleTrades] = useState<any[]>([])
  const [whalePage, setWhalePage] = useState(1)
  const [whaleTotalPages, setWhaleTotalPages] = useState(1)
  const [isWhaleLoading, setIsWhaleLoading] = useState(false)
  const WHALE_ITEMS_PER_PAGE = 10

  // Fetch Whale Trades on Page Change
  useEffect(() => {
    const fetchWhaleTrades = async () => {
      setIsWhaleLoading(true)
      try {
        const response = await fetch(`${API_URL}/whale-trades?page=${whalePage}&limit=${WHALE_ITEMS_PER_PAGE}`)
        if (response.ok) {
          const resData = await response.json()
          // Support both array response (old) and paginated response (new)
          // But we expect { data, meta } now
          const trades = resData.data || (Array.isArray(resData) ? resData : [])
          const meta = resData.meta || { total: trades.length, page: 1, last_page: 1 }

          setWhaleTrades(trades)
          setWhaleTotalPages(meta.last_page)
        }
      } catch (error) {
        console.error("Error fetching whale trades:", error)
      } finally {
        setIsWhaleLoading(false)
      }
    }
    fetchWhaleTrades()
  }, [whalePage])

  // Listen for Real-time Whale Trades
  useEffect(() => {
    if (lastWhaleTrade && whalePage === 1) {
      setWhaleTrades(prev => {
        // Avoid duplicates
        if (prev.some(t => t.hash === lastWhaleTrade.hash)) return prev;

        // Prepend new trade
        const updated = [lastWhaleTrade, ...prev];

        // Keep page size consistent if full?
        // User asked "thứ tự thời gian cái nào mới nhất thì thêm vào đầu".
        // If we strictly follow pagination, we should pop the last one to stay at 10.
        // But for "live feed" feel, growing it slightly or popping is a choice.
        // Let's pop to maintain "10 items per page"
        if (updated.length > WHALE_ITEMS_PER_PAGE) {
          updated.pop();
        }
        return updated;
      })
    }
  }, [lastWhaleTrade, whalePage])

  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_URL}/traders?page=${currentPage}&limit=${itemsPerPage}`)
        if (!response.ok) {
          throw new Error("Failed to fetch traders")
        }
        const responseData = await response.json()
        const { data, total } = responseData

        const mappedUsers: LeaderboardUser[] = data.map((trader: any, index: number) => ({
          rank: (currentPage - 1) * itemsPerPage + index + 1,
          address: trader.address,
          pnl: trader.pnl,
          winRate: trader.winrate,
          trades: trader.totalTrades,
          volume: trader.equity, // Using equity as proxy for display based on available data
          roi: trader.equity > 0 ? (trader.pnl / trader.equity) * 100 : 0,
          createdAt: trader.updatedAt ? new Date(trader.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }))

        setUsers(mappedUsers)
        setTotalPages(Math.ceil(total / itemsPerPage))
      } catch (error) {
        console.error("Error fetching users:", error)
        // Keep empty or show error state
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage])

  const filteredData = users
    .filter((item) => item.address.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "pnl") return b.pnl - a.pnl;
      if (sortBy === "winRate") return b.winRate - a.winRate;
      if (sortBy === "volume") return b.volume - a.volume;
      if (sortBy === "roi") return b.roi - a.roi;
      return 0;
    });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard & Whale Tracker</h1>
          <p className="text-muted-foreground">Top traders ranked by PnL and live high-value transaction monitoring</p>
        </div>

        {/* Live Whale Feed Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary animate-pulse" />
                <CardTitle>Live Whale Feed</CardTitle>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Live Connection" : "Connecting..."}
              </Badge>
            </div>
            <CardDescription>Real-time trades over $1M (Known) or $10M (Unknown)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border h-[500px] overflow-auto relative">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow className="bg-muted/50 hover:bg-muted/50 transition-none">
                    <TableHead>Address</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whaleTrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {isWhaleLoading ? "Loading..." : "Waiting for whale trades..."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    whaleTrades.map((trade, idx) => {
                      const isBuy = trade.side === "B";
                      // Assuming the first user in the array is the relevant one or the "Whale"
                      // Truncate address 0x1234...5678
                      const address = trade.users && trade.users.length > 0
                        ? `${trade.users[0].substring(0, 6)}..${trade.users[0].substring(trade.users[0].length - 2)}`
                        : "Unknown";

                      const activity = isBuy ? "Open Long" : "Open Short";
                      const rowBgClass = isBuy ? "bg-green-500/10 hover:bg-green-500/20" : "bg-red-500/10 hover:bg-red-500/20";

                      return (
                        <TableRow key={`${trade.coin}-${trade.time}-${idx}`} className={rowBgClass}>
                          <TableCell className="font-mono underline decoration-dotted underline-offset-4 cursor-pointer" title={trade.users?.[0]}>
                            <div className="hover:text-blue-500 transition-colors">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <span className="cursor-pointer flex items-center gap-2">
                                    {address}
                                    {trade.isKnownTrader && (
                                      <Badge variant="secondary" className="px-1 py-0 text-[10px] h-5 bg-blue-500/10 text-blue-500 border-blue-500/20">
                                        Known
                                      </Badge>
                                    )}
                                  </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (trade.users?.[0]) {
                                        navigator.clipboard.writeText(trade.users[0]);
                                      }
                                    }}
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Address
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`https://hyperdash.com/address/${trade.users?.[0] || ""}`}
                                      className="flex items-center"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      Explore Address
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">{trade.coin}</TableCell>
                          <TableCell className={isBuy ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {activity}
                          </TableCell>
                          <TableCell className="font-mono font-medium">
                            ${(trade.valueUsd / 1000000).toFixed(2)}M
                          </TableCell>
                          <TableCell className="font-mono">
                            ${Number(trade.px).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(trade.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Whale Feed Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWhalePage(Math.max(1, whalePage - 1))}
                disabled={whalePage === 1 || isWhaleLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {whalePage} of {whaleTotalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWhalePage(Math.min(whaleTotalPages, whalePage + 1))}
                disabled={whalePage === whaleTotalPages || isWhaleLoading}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Static Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Historical Top Traders</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search wallet address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-md border border-border bg-background"
                >
                  <option value="pnl">Sort by PnL</option>
                  <option value="winRate">Sort by Win Rate</option>
                  <option value="roi">Sort by ROI</option>
                  <option value="volume">Sort by Volume</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold">Wallet Address</th>
                      <th className="text-right py-3 px-4 font-semibold">PnL</th>
                      <th className="text-right py-3 px-4 font-semibold">Win Rate</th>
                      <th className="text-right py-3 px-4 font-semibold">Trades</th>
                      <th className="text-right py-3 px-4 font-semibold">Volume</th>
                      <th className="text-right py-3 px-4 font-semibold">ROI</th>
                      <th className="text-right py-3 px-4 font-semibold">Created</th>
                      <th className="text-center py-3 px-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8">Loading...</td>
                      </tr>
                    ) : (
                      filteredData.map((trader) => (
                        <tr key={trader.rank} className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-lg font-bold">
                              #{trader.rank}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{trader.address}</td>
                          <td className="text-right py-3 px-4 font-semibold text-green-500">
                            ${(trader.pnl / 1000000).toFixed(2)}M
                          </td>
                          <td className="text-right py-3 px-4">
                            <Badge variant="default">{trader.winRate}%</Badge>
                          </td>
                          <td className="text-right py-3 px-4">{trader.trades}</td>
                          <td className="text-right py-3 px-4">${(trader.volume / 1000000).toFixed(1)}M</td>
                          <td className="text-right py-3 px-4 text-green-500 font-semibold">{trader.roi.toFixed(1)}%</td>
                          <td className="text-right py-3 px-4 text-xs text-muted-foreground">{trader.createdAt}</td>
                          <td className="text-center py-3 px-4">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <ExternalLink className="w-4 h-4" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

