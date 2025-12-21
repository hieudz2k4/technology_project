import { useAccount, useWalletClient } from "wagmi";

export const deposit = async (amount: number) => {
  const { address } = useAccount();
  const walletClient = useWalletClient();
};
