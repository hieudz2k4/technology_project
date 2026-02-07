"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { API_URL } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ArrowLeft, TrendingUp, DollarSign, Activity, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type Position = {
    symbol: string
    side: 'Long' | 'Short'
    size: string
    entryPrice: string
    pnl: string
}

type WalletProfile = {
    accountValue: string
    leverage: string
    marginUsage: string
    positions: Position[]
}

export default function AddressPage() {
    const params = useParams()
    const address = params.address as string
    const [data, setData] = useState<WalletProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch(`${API_URL}/wallet/${address}`)
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Wallet not found")
                    throw new Error("Failed to fetch wallet data")
                }
                const json = await res.json()
                setData(json)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (address) {
            fetchData()
        }
    }, [address])

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/leaderboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Wallet Details</h1>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Wallet className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle className="font-mono text-xl">{address}</CardTitle>
                                    <CardDescription>Hyperliquid Wallet Profile</CardDescription>
                                </div>
                            </div>
                            {/* Tags */}
                            <div className="ml-auto flex gap-2">
                                {data && (
                                    <>
                                        <Badge variant="outline" className="text-lg">
                                            Account Value: ${Number(data.accountValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </Badge>
                                        <Badge variant={Number(data.marginUsage.replace('%', '')) > 80 ? 'destructive' : 'secondary'} className="text-lg">
                                            Margin: {data.marginUsage}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Activity className="animate-spin h-8 w-8 text-muted-foreground" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
                                <AlertCircle className="h-8 w-8" />
                                <p className="font-medium">{error}</p>
                            </div>
                        ) : data ? (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-muted/40 border-none">
                                        <CardContent className="pt-6 flex items-center gap-4">
                                            <div className="p-2 bg-background rounded-full">
                                                <DollarSign className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Equity</p>
                                                <p className="text-2xl font-bold">${Number(data.accountValue).toLocaleString()}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted/40 border-none">
                                        <CardContent className="pt-6 flex items-center gap-4">
                                            <div className="p-2 bg-background rounded-full">
                                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Leverage</p>
                                                <p className="text-2xl font-bold">{data.leverage}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted/40 border-none">
                                        <CardContent className="pt-6 flex items-center gap-4">
                                            <div className="p-2 bg-background rounded-full">
                                                <Activity className="w-5 h-5 text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Active Positions</p>
                                                <p className="text-2xl font-bold">{data.positions.length}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Positions Table */}
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Symbol</TableHead>
                                                <TableHead>Side</TableHead>
                                                <TableHead>Size</TableHead>
                                                <TableHead>Entry Price</TableHead>
                                                <TableHead className="text-right">Unrealized PnL</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.positions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                        No active positions found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.positions.map((pos) => (
                                                    <TableRow key={pos.symbol}>
                                                        <TableCell className="font-bold">{pos.symbol}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={pos.side === 'Long' ? 'default' : 'destructive'}>
                                                                {pos.side}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{pos.size}</TableCell>
                                                        <TableCell>${Number(pos.entryPrice).toLocaleString()}</TableCell>
                                                        <TableCell className={`text-right font-medium ${Number(pos.pnl) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {Number(pos.pnl) >= 0 ? '+' : ''}${Number(pos.pnl).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
