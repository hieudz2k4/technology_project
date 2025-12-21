import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, optimism, arbitrum, sepolia } from "wagmi/chains";
import { anvilChain } from "./chain_config";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!projectId) {
  console.warn("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
}

const config = {
  appName: "DZDEX",
  projectId: projectId || "test_project_id", // Fallback to prevent crash if env is missing
  chains: [mainnet, polygon, optimism, arbitrum, sepolia, anvilChain],
  ssr: true,
} as const;

// Use global singleton to prevent re-initialization in dev
const globalForWagmi = global as unknown as {
  wagmiConfig: ReturnType<typeof getDefaultConfig>;
};

export const wagmiConfig =
  globalForWagmi.wagmiConfig || getDefaultConfig(config);

if (process.env.NODE_ENV !== "production") {
  globalForWagmi.wagmiConfig = wagmiConfig;
}
