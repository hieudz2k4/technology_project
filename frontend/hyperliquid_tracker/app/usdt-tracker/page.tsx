"use client"

import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, ArrowRight, ArrowLeft } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface UsdtTransfer {
    id: number
    hash: string
    amount: number
    sender: string
    receiver: string
    type: string
    timestamp: number
}

export default function UsdtTrackerPage() {
    const [transfers, setTransfers] = useState<UsdtTransfer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const itemsPerPage = 20

    useEffect(() => {
        const fetchTransfers = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`http://localhost:3005/usdt-tracker?page=${currentPage}&limit=${itemsPerPage}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch transfers")
                }
                const data = await response.json()
                setTransfers(data.data)
                setTotalPages(Math.ceil(data.total / itemsPerPage))
            } catch (error) {
                console.error("Error fetching transfers:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTransfers()
    }, [currentPage])

    useEffect(() => {
        const socket = io('http://localhost:3005');

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        socket.on('usdt-transfer', (newTransfer: UsdtTransfer) => {
            console.log('New USDT Transfer:', newTransfer);
            if (currentPage === 1) {
                setTransfers(prev => {
                    const updated = [newTransfer, ...prev];
                    if (updated.length > itemsPerPage) {
                        updated.pop();
                    }
                    return updated;
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount).replace('$', '') + ' USDT'
    }

    const formatDate = (timestamp: number) => {
        return new Date(Number(timestamp)).toLocaleString()
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">USDT Treasury Tracker</h1>
                    <p className="text-muted-foreground">Monitor large USDT mints, burns, and transfers on Tron network</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Large Transfers (&gt;100M USDT)</CardTitle>
                        <CardDescription>Real-time data from TronGrid</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Sender</TableHead>
                                        <TableHead>Receiver</TableHead>
                                        <TableHead className="text-right">Tx Hash</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                Loading transfers...
                                            </TableCell>
                                        </TableRow>
                                    ) : transfers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No transfers found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transfers.map((tx) => (
                                            <TableRow key={tx.id}>
                                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                                    {formatDate(tx.timestamp)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={tx.type === 'INFLOW' ? 'default' : tx.type === 'OUTFLOW' ? 'destructive' : 'secondary'}>
                                                        {tx.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono font-bold">
                                                    {formatAmount(tx.amount)}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <span title={tx.sender}>{formatAddress(tx.sender)}</span>
                                                        <Copy
                                                            className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                                                            onClick={() => navigator.clipboard.writeText(tx.sender)}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <span title={tx.receiver}>{formatAddress(tx.receiver)}</span>
                                                        <Copy
                                                            className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                                                            onClick={() => navigator.clipboard.writeText(tx.receiver)}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={`https://tronscan.org/#/transaction/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                                            View <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-4">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || isLoading}
                            >
                                Next <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
