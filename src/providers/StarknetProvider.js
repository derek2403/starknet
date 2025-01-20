import { StarknetConfig, jsonRpcProvider } from '@starknet-react/core';
import { sepolia } from '@starknet-react/chains';
import { ControllerConnector } from '@cartridge/connector';

// Your deployed world address from the migration
const WORLD_ADDRESS = '0x0525177c8afe8680d7ad1da30ca183e482cfcd6404c1e09d83fd3fa2994fd4b8';
const PROJECT_NAME = 'my-game';
const RPC_URL = `https://api.cartridge.gg/x/${PROJECT_NAME}/katana`;

// Initialize the connector with minimal configuration
const connector = new ControllerConnector({
    url: 'https://x.cartridge.gg',
    hostname: 'x.cartridge.gg',
    projectId: PROJECT_NAME,
    rpc: RPC_URL,
    namespace: 'my_game',
    policies: {
        contracts: {
            [WORLD_ADDRESS]: {
                name: "My Game",
                methods: [
                    {
                        name: "Set Mood",
                        entrypoint: "set_mood",
                        args: []
                    }
                ]
            }
        }
    },
    chains: [
        {
            id: sepolia.id,
            name: sepolia.name,
            rpcUrl: RPC_URL
        }
    ]
});

// Configure provider
const provider = jsonRpcProvider({
    rpc: () => ({
        nodeUrl: RPC_URL
    })
});

const StarknetProvider = ({ children }) => {
    return (
        <StarknetConfig
            autoConnect
            chains={[sepolia]}
            provider={provider}
            connectors={[connector]}
            defaultNetwork={sepolia}
        >
            {children}
        </StarknetConfig>
    );
};

export default StarknetProvider; 