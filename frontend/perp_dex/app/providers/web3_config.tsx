"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useThemeStore } from "@/store/ThemeState";
import { wagmiConfig } from "./wagmi_config";
import { anvilChain } from "./chain_config";

const config = wagmiConfig;

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  const themeStore = useThemeStore();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={
            themeStore.selectedTheme === "dark" ? darkTheme() : lightTheme()
          }
          initialChain={anvilChain}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
