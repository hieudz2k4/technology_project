"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Code,
  HelpCircle,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl p-6">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-lg text-muted-foreground">
              Learn how to use DZDEX and start trading perpetual futures with
              leverage
            </p>
          </div>

          {/* Quick Start Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <Zap className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up your wallet and make your first trade in minutes
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <Code className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">API Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Integrate DZDEX with your own applications
                </p>
                <Button variant="outline" size="sm">
                  View API
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <Shield className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Understand our security measures and best practices
                </p>
                <Button variant="outline" size="sm">
                  Read More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Documentation */}
          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="guide">User Guide</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            {/* User Guide */}
            <TabsContent value="guide" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Getting Started with DZDEX
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      1. Connect Your Wallet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click the "Connect Wallet" button in the top-right corner.
                      DZDEX supports MetaMask, WalletConnect, and other popular
                      Web3 wallets.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. Deposit Funds</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Transfer USDC or other supported stablecoins to your DZDEX
                      account. Your funds are held in smart contracts and can be
                      withdrawn anytime.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. Choose a Market</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Browse available trading pairs in the Markets section.
                      Each pair shows real-time price data, 24h volume, and
                      price changes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      4. Place Your First Trade
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Go to the Trade page, select your market, choose Long or
                      Short, set your leverage, and enter your order details.
                      Review and confirm your trade.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Understanding the Interface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Price Chart</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time candlestick charts with multiple timeframes (1m,
                      5m, 15m, 1h, 4h, 1d). Use technical analysis tools to
                      identify trading opportunities.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Order Book</h3>
                    <p className="text-sm text-muted-foreground">
                      View buy and sell orders at different price levels. The
                      order book shows market depth and helps you understand
                      price support/resistance.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Recent Trades</h3>
                    <p className="text-sm text-muted-foreground">
                      See the latest executed trades with price, size, and
                      direction. This helps you understand market activity and
                      sentiment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading */}
            <TabsContent value="trading" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Trading Basics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Long Positions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Profit when the price goes up. You borrow the asset and
                      sell it, then buy it back at a lower price. Losses occur
                      if the price rises.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Short Positions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Profit when the price goes down. You buy the asset and
                      sell it at a higher price. Losses occur if the price
                      falls.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Leverage</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Trade with up to 20x leverage. Higher leverage amplifies
                      both gains and losses. Start with lower leverage (2-5x) if
                      you're new to trading.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Take Profit & Stop Loss
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Set automatic exit prices to manage risk. Take Profit
                      closes your position at a profit target. Stop Loss closes
                      your position to limit losses.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Risk Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      • Always use Stop Loss orders to protect against
                      unexpected price movements
                    </li>
                    <li>
                      • Start with small position sizes and low leverage while
                      learning
                    </li>
                    <li>
                      • Never risk more than 2-5% of your account on a single
                      trade
                    </li>
                    <li>
                      • Diversify across multiple trading pairs and strategies
                    </li>
                    <li>
                      • Monitor your positions regularly and adjust as needed
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">
                      What is a perpetual contract?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      A perpetual contract is a derivative that allows you to
                      trade with leverage without an expiration date. Unlike
                      futures, perpetuals don't expire and can be held
                      indefinitely.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      What are funding rates?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Funding rates are periodic payments between long and short
                      traders. They help keep the perpetual price close to the
                      spot price. You pay or receive funding based on your
                      position direction.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Can I lose more than my deposit?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, with leverage. If your position moves against you,
                      you could lose more than your initial deposit. Always use
                      Stop Loss orders and manage your leverage carefully.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      How do I withdraw my funds?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Go to your Portfolio page and click "Withdraw". You can
                      withdraw any available balance. Withdrawals are processed
                      on-chain and may take a few minutes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      What fees does DZDEX charge?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      DZDEX charges a 0.05% maker fee and 0.1% taker fee on all
                      trades. Funding rates are also charged periodically. Check
                      the fee schedule for more details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support */}
            <TabsContent value="support" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Get Help</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Contact Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Have a question or issue? Reach out to our support team at
                      support@perpdex.com or join our Discord community.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Email Support
                      </Button>
                      <Button variant="outline" size="sm">
                        Join Discord
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Report a Bug</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Found a bug? Please report it on our GitHub or email
                      security@perpdex.com for security issues.
                    </p>
                    <Button variant="outline" size="sm">
                      Report on GitHub
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Join our community to discuss trading strategies, share
                      ideas, and connect with other traders.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
