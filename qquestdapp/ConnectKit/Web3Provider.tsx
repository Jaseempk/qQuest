import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [baseSepolia, base],
    transports: {
      // RPC URL for each chain
      [baseSepolia.id]: http(
        "https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327"
      ),
    },

    // Required API Keys
    walletConnectProjectId: "b1647c589ac18a28722c490d2f840895",

    // Required App Info
    appName: "QQuest",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
