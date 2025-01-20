import '../styles/globals.css';
import { StarknetConfig, InjectedConnector } from '@starknet-react/core';
import { Provider } from 'starknet';

const connectors = [
    new InjectedConnector({ options: { id: 'argentX' }}),
    new InjectedConnector({ options: { id: 'braavos' }})
];

// Define the Dojo testnet chain
const dojoTestnet = {
    id: "DOJO-TESTNET",
    name: "Dojo Testnet",
    network: "testnet",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://api.cartridge.gg/x/my-game/katana"]
        },
        public: {
            http: ["https://api.cartridge.gg/x/my-game/katana"]
        }
    },
    blockExplorers: {
        default: {
            name: "Starkscan",
            url: "https://testnet.starkscan.co"
        }
    }
};

// Create provider factory
const providerFactory = (chain) => {
    return new Provider({ 
        rpc: { 
            nodeUrl: chain.rpcUrls.default.http[0] 
        }
    });
};

function MyApp({ Component, pageProps }) {
    return (
        <StarknetConfig 
            chains={[dojoTestnet]} 
            connectors={connectors}
            autoConnect
            provider={providerFactory}
        >
            <Component {...pageProps} />
        </StarknetConfig>
    );
}

export default MyApp;
