"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  description: string
  source: string
  impact: "high" | "medium" | "low"
  sentiment: "positive" | "negative" | "neutral"
  affectedAssets: string[]
  timestamp: string
  url: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [sentiment, setSentiment] = useState<"all" | "positive" | "negative" | "neutral">("all")

  useEffect(() => {
    // Mock news data
    const mockNews: NewsItem[] = [
      {
        id: "1",
        title: "Bitcoin ETF Approval Expected This Week",
        description: "SEC signals approval for spot Bitcoin ETF, potentially driving significant market movement",
        source: "CoinDesk",
        impact: "high",
        sentiment: "positive",
        affectedAssets: ["BTC", "ETH"],
        timestamp: "2024-10-27T14:30:00Z",
        url: "#",
      },
      {
        id: "2",
        title: "Ethereum Shanghai Upgrade Delayed",
        description: "Core developers announce 2-week delay for major network upgrade",
        source: "The Block",
        impact: "medium",
        sentiment: "negative",
        affectedAssets: ["ETH"],
        timestamp: "2024-10-27T12:15:00Z",
        url: "#",
      },
      {
        id: "3",
        title: "Solana Network Achieves 100k TPS Milestone",
        description: "Solana blockchain reaches new throughput record with latest optimization",
        source: "Solana Blog",
        impact: "high",
        sentiment: "positive",
        affectedAssets: ["SOL"],
        timestamp: "2024-10-27T10:45:00Z",
        url: "#",
      },
      {
        id: "4",
        title: "Arbitrum DAO Proposes New Fee Structure",
        description: "Community vote on revised transaction fee model for Arbitrum network",
        source: "Arbitrum Forum",
        impact: "medium",
        sentiment: "neutral",
        affectedAssets: ["ARB"],
        timestamp: "2024-10-27T09:20:00Z",
        url: "#",
      },
      {
        id: "5",
        title: "Regulatory Crackdown on Staking Services",
        description: "Multiple countries announce new regulations for cryptocurrency staking platforms",
        source: "Reuters",
        impact: "high",
        sentiment: "negative",
        affectedAssets: ["ETH", "SOL", "OP"],
        timestamp: "2024-10-27T08:00:00Z",
        url: "#",
      },
      {
        id: "6",
        title: "Optimism Launches New Developer Grant Program",
        description: "$50M fund announced to support Optimism ecosystem development",
        source: "Optimism",
        impact: "medium",
        sentiment: "positive",
        affectedAssets: ["OP"],
        timestamp: "2024-10-26T16:30:00Z",
        url: "#",
      },
    ]

    setNews(mockNews)
  }, [])

  const filteredNews = news.filter((item) => {
    const impactMatch = filter === "all" || item.impact === filter
    const sentimentMatch = sentiment === "all" || item.sentiment === sentiment
    return impactMatch && sentimentMatch
  })

  const getImpactColor = (impact: string) => {
    if (impact === "high") return "bg-red-500/10 text-red-700"
    if (impact === "medium") return "bg-yellow-500/10 text-yellow-700"
    return "bg-blue-500/10 text-blue-700"
  }

  const getSentimentIcon = (sent: string) => {
    if (sent === "positive") return <TrendingUp className="w-4 h-4 text-green-500" />
    if (sent === "negative") return <TrendingDown className="w-4 h-4 text-red-500" />
    return <AlertCircle className="w-4 h-4 text-gray-500" />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Market News</h1>
          <p className="text-muted-foreground">Real-time news and events affecting crypto markets</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Impact Level</p>
              <div className="flex gap-2 flex-wrap">
                {["all", "high", "medium", "low"].map((level) => (
                  <Button
                    key={level}
                    variant={filter === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(level as any)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Sentiment</p>
              <div className="flex gap-2 flex-wrap">
                {["all", "positive", "negative", "neutral"].map((sent) => (
                  <Button
                    key={sent}
                    variant={sentiment === sent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSentiment(sent as any)}
                    className="capitalize"
                  >
                    {sent}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News Feed */}
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{getSentimentIcon(item.sentiment)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-foreground leading-tight">{item.title}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge className={getImpactColor(item.impact)}>{item.impact.toUpperCase()}</Badge>
                        <Badge variant="outline" className="capitalize">
                          {item.sentiment}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {item.affectedAssets.map((asset) => (
                          <Badge key={asset} variant="secondary">
                            {asset}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.source}</span>
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            Read More
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
