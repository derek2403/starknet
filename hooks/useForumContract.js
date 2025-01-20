import { useState, useEffect } from 'react';
import { WORLD_ADDRESS, DOJO_ACCOUNTS } from '../constants/contracts';
import { Account, Provider } from 'starknet';

// Hardcoded messages for testing
const HARDCODED_MESSAGES = [
  {
    id: 1,
    text: "Welcome to the community forum!",
    sender: "Admin",
    timestamp: Date.now() - 1000000
  },
  {
    id: 2,
    text: "Feel free to chat with other players",
    sender: "Admin",
    timestamp: Date.now() - 500000
  }
];

// Define the contract ABI for the message system
const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "store_message",
    "inputs": [
      {
        "name": "content",
        "type": "felt"
      }
    ],
    "outputs": [],
    "stateMutability": "external"
  },
  {
    "type": "event",
    "name": "MessageStored",
    "inputs": [
      {
        "name": "player",
        "type": "felt"
      },
      {
        "name": "content",
        "type": "felt"
      }
    ]
  }
];

// Cairo 0 Account Class Hash for Dojo testnet
const ACCOUNT_CLASS_HASH = "0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f";

// Add this near the top with other constants
const MY_WALLET_ADDRESS = DOJO_ACCOUNTS.account1.address;

export function useForumContract() {
  const [messages, setMessages] = useState(HARDCODED_MESSAGES);
  const [isReady, setIsReady] = useState(true); // Always ready in hardcoded mode
  const [dojoAccount, setDojoAccount] = useState(null);

  // Keep the Dojo initialization code but don't use it yet
  useEffect(() => {
    const initDojoAccount = async () => {
      try {
        // Create a provider with specific sequencer URL
        const provider = new Provider({ 
          sequencer: { 
            baseUrl: 'https://api.cartridge.gg/x/my-game/katana',
            chainId: 'SN_GOERLI'
          }
        });

        // Create account instance
        const account = new Account(
          provider,
          DOJO_ACCOUNTS.account1.address,
          DOJO_ACCOUNTS.account1.privateKey
        );

        // Check if account is accessible
        try {
          const nonce = await provider.getNonce(DOJO_ACCOUNTS.account1.address);
          console.log('Account nonce:', nonce);
        } catch (e) {
          console.log('Account might need initialization');
        }

        setDojoAccount(account);
        setIsReady(true);
        console.log('Dojo account initialized:', account.address);
      } catch (error) {
        console.log('Using hardcoded messages instead of Dojo');
      }
    };

    // Uncomment this when ready to use Dojo
    // initDojoAccount();
  }, []);

  // Subscribe to message events
  useEffect(() => {
    if (!isReady || !dojoAccount?.provider) return;

    const subscribeToMessages = async () => {
      try {
        const fromBlock = await dojoAccount.provider.getBlock('latest');

        const unsubscribe = await dojoAccount.provider.subscribeEvent({
          address: WORLD_ADDRESS,
          eventName: 'MessageStored',
          fromBlock: fromBlock.block_number,
          handler: (event) => {
            console.log('Message event received:', event);
            const { player, content } = event.data;
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: content,
              sender: player === dojoAccount.address ? 'You' : `Player ${player.slice(0, 6)}...`,
              timestamp: Date.now()
            }]);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error subscribing to messages:', error);
      }
    };

    subscribeToMessages();
  }, [isReady, dojoAccount]);

  const sendMessage = async (content) => {
    try {
      console.log('Sending message:', content);
      
      // Format wallet address for display
      const formattedAddress = `${MY_WALLET_ADDRESS.slice(0, 6)}...${MY_WALLET_ADDRESS.slice(-4)}`;
      
      // Add message locally instead of sending to contract
      const newMessage = {
        id: Date.now(),
        text: content,
        sender: formattedAddress, // Use formatted wallet address instead of 'You'
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, newMessage]);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    sendMessage,
    isReady,
    dojoAddress: MY_WALLET_ADDRESS // Use actual wallet address here too
  };
} 