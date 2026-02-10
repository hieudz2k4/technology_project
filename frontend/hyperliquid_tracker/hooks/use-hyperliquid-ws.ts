"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

// Connect to local NestJS backend
import { API_URL } from "@/lib/config"

const BACKEND_URL = API_URL

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
  const [lastWhaleTrade, setLastWhaleTrade] = useState<WhaleTrade | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true;

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
      if (isMountedRef.current) {
        setLastWhaleTrade(trade);
      }
    })

    return () => {
      isMountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return { lastWhaleTrade, isConnected }
}
