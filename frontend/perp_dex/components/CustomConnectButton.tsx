import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";

export function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              className="px-5 py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold shadow-lg hover:from-indigo-500 hover:to-cyan-400 transition-all"
            >
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return <button onClick={openChainModal}>Chain unsupported</button>;
        }

        return (
          <div className="flex gap-2">
            <button
              onClick={openChainModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold shadow-lg hover:from-purple-500 hover:to-pink-400 transition-all"
            >
              {chain.hasIcon && chain.iconUrl && (
                <img
                  src={chain.iconUrl}
                  alt={chain.name}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span>{chain.name}</span>
            </button>

            <button
              onClick={openAccountModal}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-semibold shadow-lg hover:from-indigo-500 hover:to-cyan-400 transition-all"
            >
              {account.displayName}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
