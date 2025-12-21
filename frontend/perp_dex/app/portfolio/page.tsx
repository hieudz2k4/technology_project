"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { vaultsAbi } from "@/abis/vaults_abi";
import { formatUnits, maxUint256, parseUnits } from "viem";
import { usdzAbi } from "@/abis/usdz_abi";

interface Position {
  symbol: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: string;
  status: string;
}

interface Order {
  symbol: string;
  type: string;
  price: number;
  size: number;
  status: string;
  createdAt: string;
}

interface TradeHistory {
  symbol: string;
  type: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  closedAt: string;
}

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<{
    totalBalance: number;
    totalPnL: number;
    totalPnLPercent: number;
    positions: Position[];
    orders: Order[];
    tradeHistory: TradeHistory[];
  }>({
    totalBalance: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    positions: [],
    orders: [],
    tradeHistory: [],
  });

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [amountDeposit, setAmountDeposit] = useState("");
  const [amountWithdraw, setAmountWithdraw] = useState("");

  const [isValidAmountDeposit, setIsValidAmountDeposit] = useState(false);
  const [isValidAmountWithdraw, setIsValidAmountWithdraw] = useState(false);

  const { address, isConnected } = useAccount();

  const {
    data: hash,
    isPending,
    isSuccess,
    error,
    writeContractAsync,
  } = useWriteContract();

  const { data: balance } = useReadContract({
    chainId: 31337,
    address: process.env.NEXT_PUBLIC_USDZ_VAULT_ADDRESS as `0x${string}`,
    abi: vaultsAbi,
    functionName: "getBalance",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: isConnected && !!address && !showDepositModal,
      select(data) {
        return typeof data === "bigint" ? formatUnits(data, 6) : "0.00";
      },
    },
  });

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      return;
    }
  };

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: process.env.NEXT_PUBLIC_USDZ_TOKEN_ADDRESS as `0x${string}`,
    abi: usdzAbi,
    functionName: "allowance",
    args: [
      address,
      process.env.NEXT_PUBLIC_USDZ_VAULT_ADDRESS as `0x${string}`,
    ],
    query: {
      enabled: showDepositModal,
    },
  });

  const handleDeposit = () => {
    console.log("Deposit triggered");

    if (
      (amountDeposit.includes(".") &&
        amountDeposit.split(".")[1].length == 0) ||
      amountDeposit.length == 0
    ) {
      toast.error("Please enter a valid deposit amount.");
    } else {
      try {
        const amountAsBigInt = parseUnits(amountDeposit, 6);

        console.log("Amount as BigInt:", amountAsBigInt);
        console.log("Allowance: ", allowance);

        const needToApprove = allowance != null && allowance < amountAsBigInt;

        if (needToApprove) {
          writeContractAsync({
            chainId: 31337,
            address: process.env
              .NEXT_PUBLIC_USDZ_TOKEN_ADDRESS as `0x${string}`,
            abi: usdzAbi,
            functionName: "approve",
            args: [process.env.NEXT_PUBLIC_USDZ_VAULT_ADDRESS, maxUint256],
          });

          writeContractAsync({
            chainId: 31337,
            address: process.env
              .NEXT_PUBLIC_USDZ_VAULT_ADDRESS as `0x${string}`,
            abi: vaultsAbi,
            functionName: "deposit",
            args: [amountAsBigInt],
          });
          console.log(hash, isPending, isSuccess, error);
        } else {
          writeContractAsync({
            chainId: 31337,
            address: process.env
              .NEXT_PUBLIC_USDZ_VAULT_ADDRESS as `0x${string}`,
            abi: vaultsAbi,
            functionName: "deposit",
            args: [amountAsBigInt],
          });
          console.log(hash, isPending, isSuccess, error);
        }
      } catch (e) {
        console.error("Error parseUnits:", e);
      }
    }
  };

  const handleWithdraw = () => {
    console.log("Withdraw triggered");
    setShowWithdrawModal(false);
  };

  const validateAmount = (value: string, nameAmount: string) => {
    if (/^([1-9]\d*|0)(\.\d{0,2})?$/.test(value)) {
      nameAmount === "deposit"
        ? (setAmountDeposit(value), setIsValidAmountDeposit(true))
        : (setAmountWithdraw(value), setIsValidAmountWithdraw(true));
    } else if (value.length == 0) {
      nameAmount === "deposit"
        ? (setAmountDeposit(value), setIsValidAmountDeposit(false))
        : (setAmountWithdraw(value), setIsValidAmountWithdraw(false));
    } else {
      return;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">
              Manage your positions, orders, and trading history
            </p>
          </div>

          {/* Wallet Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-border gap-4">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl font-medium text-muted-foreground">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${balance}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected ? "Connected Wallet" : "Disconnected Wallet"}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() =>
                      isConnected
                        ? setShowDepositModal(true)
                        : (setShowDepositModal(false),
                          toast.error("Please connect your wallet first."))
                    }
                    className="flex-1 bg-success text-black hover:bg-success/90 font-semibold"
                    size="sm"
                  >
                    <ArrowDownLeft className="h-4 w-4 mr-1" />
                    Deposit
                  </Button>
                  <Button
                    onClick={() => setShowWithdrawModal(true)}
                    variant="outline"
                    className="flex-1 border-muted-foreground/30 hover:bg-muted/50 font-semibold"
                    size="sm"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border gap-4">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl font-medium text-muted-foreground">
                  Total P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${portfolioData.totalPnL >= 0 ? "text-success" : "text-destructive"}`}
                >
                  $
                </div>
                <p
                  className={`text-xs mt-1 ${portfolioData.totalPnLPercent >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {portfolioData.totalPnLPercent >= 0 ? "+" : ""}
                  {portfolioData.totalPnLPercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-border gap-4">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl font-medium text-muted-foreground">
                  Wallet Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono truncate">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Not connected"}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {copiedAddress && (
                  <p className="text-xs text-success mt-1">Copied!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
              <TabsTrigger value="orders">Open Orders</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
            </TabsList>

            {/* Open Positions */}
            <TabsContent value="positions">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>
                    Open Positions ({portfolioData.positions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Pair</TableHead>
                          <TableHead className="text-right">Size</TableHead>
                          <TableHead className="text-right">
                            Entry Price
                          </TableHead>
                          <TableHead className="text-right">
                            Current Price
                          </TableHead>
                          <TableHead className="text-right">Leverage</TableHead>
                          <TableHead className="text-right">P&L</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {portfolioData.positions.map((position) => (
                          <TableRow
                            key={position.symbol}
                            className="border-border hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-mono font-semibold">
                              {position.symbol}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {position.size}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${position.entryPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${position.currentPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="font-mono">
                                {position.leverage}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div
                                className={`font-mono font-semibold ${position.pnl >= 0 ? "text-success" : "text-destructive"}`}
                              >
                                ${position.pnl.toFixed(2)}
                              </div>
                              <div
                                className={`text-xs ${position.pnl >= 0 ? "text-success" : "text-destructive"}`}
                              >
                                {position.pnlPercent >= 0 ? "+" : ""}
                                {position.pnlPercent.toFixed(2)}%
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive bg-transparent"
                              >
                                Close
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Open Orders */}
            <TabsContent value="orders">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>
                    Open Orders ({portfolioData.orders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Pair</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Size</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {portfolioData.orders.map((order, idx) => (
                          <TableRow
                            key={idx}
                            className="border-border hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-mono font-semibold">
                              {order.symbol}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  order.type.includes("Buy")
                                    ? "text-success border-success/30"
                                    : "text-destructive border-destructive/30"
                                }
                              >
                                {order.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${order.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {order.size}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-yellow-500 border-yellow-500/30"
                              >
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {order.createdAt}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive bg-transparent"
                              >
                                Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trade History */}
            <TabsContent value="history">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Pair</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">
                            Entry Price
                          </TableHead>
                          <TableHead className="text-right">
                            Exit Price
                          </TableHead>
                          <TableHead className="text-right">Size</TableHead>
                          <TableHead className="text-right">P&L</TableHead>
                          <TableHead>Closed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {portfolioData.tradeHistory.map((trade, idx) => (
                          <TableRow
                            key={idx}
                            className="border-border hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-mono font-semibold">
                              {trade.symbol}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  trade.type === "Long"
                                    ? "text-success border-success/30"
                                    : "text-destructive border-destructive/30"
                                }
                              >
                                {trade.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${trade.entryPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ${trade.exitPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {trade.size}
                            </TableCell>
                            <TableCell className="text-right">
                              <div
                                className={`font-mono font-semibold ${trade.pnl >= 0 ? "text-success" : "text-destructive"}`}
                              >
                                ${trade.pnl.toFixed(2)}
                              </div>
                              <div
                                className={`text-xs ${trade.pnl >= 0 ? "text-success" : "text-destructive"}`}
                              >
                                {trade.pnlPercent >= 0 ? "+" : ""}
                                {trade.pnlPercent.toFixed(2)}%
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {trade.closedAt}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-96 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownLeft className="h-5 w-5 text-success" />
                  Deposit Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={amountDeposit}
                    className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-success/50"
                    onChange={(e) => validateAmount(e.target.value, "deposit")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Token
                  </label>
                  <select className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-success/50">
                    <option>USDC</option>
                    <option>USDT</option>
                    <option>USDZ</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowDepositModal(false), setAmountDeposit("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    className="flex-1 bg-success text-black hover:bg-success/90 font-semibold"
                  >
                    Confirm Deposit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-96 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                  Withdraw Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={amountWithdraw}
                    onChange={(e) => validateAmount(e.target.value, "withdraw")}
                    className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-success/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Select Token
                  </label>
                  <select className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-success/50">
                    <option>USDC</option>
                    <option>USDT</option>
                    <option>USDZ</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Withdrawal Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="w-full mt-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:border-success/50"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowWithdrawModal(false), setAmountWithdraw("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWithdraw}
                    className="flex-1 bg-destructive hover:bg-destructive/90 font-semibold"
                  >
                    Confirm Withdrawal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
