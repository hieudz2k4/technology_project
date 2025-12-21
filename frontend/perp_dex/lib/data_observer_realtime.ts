"use client";
import { useEffect, useState } from "react";
import { WebSocketManager } from "./WebSocketManager";

export const useDataObserverRealTime = () => {
  // Initial connection is handled by manager when first subscribed
  // We just want to ensure we are subscribed to the "Market Watch" symbols here.
  // In a real app, this list might come from a config or API.
  const symbols = ["BTCUSD_PERP", "ETHUSD_PERP", "SOLUSD_PERP"];

  useEffect(() => {
    // Subscribe to all market watch symbols
    // We don't need a callback here because the Manager updates the store directly
    // and components consume the store.
    symbols.forEach(sym => {
      WebSocketManager.getInstance().subscribe(sym);
    });

    // Cleanup: Unsubscribe?
    // If we unsubscribe, the Chart might stop receiving updates if it's the same symbol.
    // But the Manager handles multiple subscribers.
    // Checks: If we unsubscribe here, we remove *a* subscriber.
    // But since we didn't pass a callback, what are we removing?
    // Our subscribe call above added the symbol to the map but with 'undefined' callback if we didn't pass one?
    // Let's check Manager implementation:
    // `if (callback) this.subscribers.get(symbol)?.add(callback);`
    // So if no callback, it just ensures connection and maybe sends SUBSCRIBE packet.
    // So no need to unsubscribe distinct callback.

    // Ideally we should probably have a way to say "I'm interested in this data" so if count drops to 0 we unsubscribe from server.
    // For now, persistent subscription is fine.

    return () => {
      // Optional: Manager.unsubscribe(sym) if we tracked interest count.
    };
  }, []);

  return { isConnected: true }; // Mocking connected state as Manager handles auto-reconnect
};
