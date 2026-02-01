"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

// Connect to local NestJS backend
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3005"

export type Trade = {
  coin: string
  side: "A" | "B" // Ask (Sell) or Bid (Buy)
  px: string
  sz: string
  time: number
  fillCount?: number
  isKnownTrader?: boolean
  hash: string
  users: string[] // Add users array
}

export type WhaleTrade = Trade & {
  valueUsd: number
  isWhale: boolean
}

export function useHyperliquidWebSocket() {
  const [trades, setTrades] = useState<WhaleTrade[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const isMountedRef = useRef(false)

  // Fetch initial history
  useEffect(() => {
    isMountedRef.current = true;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/whale-trades?limit=50`);
        if (res.ok) {
          const history = await res.json();
          if (isMountedRef.current) {
            setTrades(prev => {
              // Avoid duplicates if socket connected fast
              const existingHashes = new Set(prev.map(t => t.hash));
              const newHistory = history.filter((t: any) => !existingHashes.has(t.hash));
              return [...newHistory, ...prev];
            });
          }
        }
      } catch (err) {
        console.error("Failed to load historical trades:", err);
      }
    };

    fetchHistory();

    return () => { isMountedRef.current = false };
  }, []);

  useEffect(() => {
    // Initialize Socket.io connection
    const socket = io(BACKEND_URL, {
      transports: ['polling', 'websocket'], // Use polling fallback
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    socket.on("connect", () => {
      console.log("Connected to Backend Proxy")
      if (isMountedRef.current) {
        setIsConnected(true)
      }
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from Backend Proxy")
      if (isMountedRef.current) {
        setIsConnected(false)
      }
    })

    socket.on("connect_error", (err) => {
      console.error("Backend Proxy Connection Error:", err)
      if (isMountedRef.current) {
        setIsConnected(false)
      }
    })

    // Listen for 'whale-trade' events from backend
    socket.on("whale-trade", (trade: WhaleTrade) => {
      console.log("Frontend received whale trade:", trade); // Debug log
      if (!isMountedRef.current) return

      setTrades((prev) => {
        // Prevent duplicates
        if (prev.some(t => t.hash === trade.hash)) return prev;

        // Keep last 50 whale trades
        const updated = [trade, ...prev].sort((a, b) => b.time - a.time).slice(0, 50)
        return updated
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return { trades, isConnected }
}
