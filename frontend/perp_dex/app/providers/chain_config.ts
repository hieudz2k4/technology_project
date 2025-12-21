import { defineChain } from "viem";

export const anvilChain = defineChain({
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["http://localhost:8545"] } },
  testnet: true,
});
