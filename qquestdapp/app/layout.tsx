'use client'
import './styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider,createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { http } from 'viem'

// const { wallets } = getDefaultWallets({
//   appName: 'qQuest',
//   projectId: 'YOUR_PROJECT_ID',
//   chains: [base, baseSepolia],
// })

const wagmiConfig = createConfig({

  chains: [base, baseSepolia], 
  transports: { 
    [base.id]: http("https://base.llamarpc.com"), 
    [baseSepolia.id]: http("https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327"), 
  }, 
})

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}