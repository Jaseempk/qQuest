import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react"; // Add this import

export const config = createConfig(
  getDefaultConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(
        "https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327"
      ),
    },
    walletConnectProjectId: "b1647c589ac18a28722c490d2f840895",
    appName: "QQuest",
  })
);

const queryClient = new QueryClient();

// Add type for the props
interface Web3ProviderProps {
  children: ReactNode;
}

// Use the interface in the component definition
export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
