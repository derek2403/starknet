import "@/styles/globals.css";
import { StarknetConfig, InjectedConnector } from '@starknet-react/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia } from '@starknet-react/chains';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  // Define supported networks
  const networks = {
    testnet: {
      id: 'goerli-alpha',
      name: 'Starknet Testnet',
      chainId: '0x534e5f474f45524c49',
    },
    mainnet: {
      id: 'mainnet-alpha',
      name: 'Starknet Mainnet',
      chainId: '0x534e5f4d41494e',
    }
  };

  const connectors = [
    new InjectedConnector({ 
      options: { 
        id: 'braavos',
        name: 'Braavos'
      }
    }),
    new InjectedConnector({ 
      options: { 
        id: 'argentX',
        name: 'Argent X'
      }
    }),
    // Add other Starknet wallets as needed
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <StarknetConfig 
        autoConnect
        chains={[sepolia]}
        connectors={connectors}
        defaultProvider={{
          network: networks.testnet.id,
        }}
      >
        <Component {...pageProps} />
      </StarknetConfig>
    </QueryClientProvider>
  );
}

export default MyApp;