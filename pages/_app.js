import '../styles/globals.css'
//wagmi.
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public';
//rainbow kit UI framework.
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/Home.module.css';
import { baseGoerli, zoraTestnet, goerli, optimismGoerli, polygonMumbai } from 'wagmi/chains'

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

const mode = {
  id: 919,
  name: 'Mode Sepolia',
  network: 'Mode Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: {
      http: ['https://sepolia.mode.network']
    },
    default: {
      http: ['https://sepolia.mode.network']
    },
  },
  testnet: true,
}

const { chains, publicClient } = configureChains([baseGoerli, mode, zoraTestnet, goerli, optimismGoerli, polygonMumbai], [publicProvider()])

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: '85ceb16fbb2d375117555eb7391cc5ca',
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
