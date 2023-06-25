import '../styles/globals.css'
//wagmi.
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public';
//rainbow kit UI framework.
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/Home.module.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

const zen = {
  id: 1663,
  name: 'Gobi Testnet',
  network: 'Gobi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZEN',
    symbol: 'ZEN',
  },
  rpcUrls: {
    public: {
      http: ['https://gobi-testnet.horizenlabs.io/ethv1']
    },
    default: {
      http: ['https://gobi-testnet.horizenlabs.io/ethv1']
    },
  },
  testnet: true,
}

const { chains, publicClient } = configureChains([zen], [publicProvider()])

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: '95271011',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )

}

export default MyApp
