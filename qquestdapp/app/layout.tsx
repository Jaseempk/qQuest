"use client";
import "./styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "viem";
import { Web3Provider } from "@/ConnectKit/Web3Provider";
import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo/apollo-config";

const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http("https://base.llamarpc.com"),
    [baseSepolia.id]: http(
      "https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327"
    ),
  },
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={client}>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <Web3Provider>{children}</Web3Provider>
            </QueryClientProvider>
          </WagmiProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
