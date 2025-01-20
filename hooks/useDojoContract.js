import { useAccount, useConnect } from '@starknet-react/core';
import { useState, useEffect, useCallback } from 'react';
import { WORLD_ADDRESS } from '../constants/contracts';

export function useDojoContract() {
  const { address } = useAccount();
  const { connect } = useConnect();
  const [position, setPosition] = useState({ x: 523, y: 280 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [pendingMoves, setPendingMoves] = useState(new Set());

  // Check if wallet is connected
  const isConnected = Boolean(address);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Initialize character when account is connected
  useEffect(() => {
    if (!isConnected || isInitialized) return;

    const initCharacter = async () => {
      try {
        await spawn();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing character:', error);
      }
    };

    initCharacter();
  }, [isConnected]);

  // Handle smooth movement
  useEffect(() => {
    if (!isConnected || pendingMoves.size === 0) return;

    const FRAME_RATE = 1000 / 60;
    const STEP = 3;

    const moveInterval = setInterval(() => {
      setPosition(prevPos => {
        const newPos = { ...prevPos };
        
        pendingMoves.forEach(direction => {
          switch(direction) {
            case 'ArrowLeft':
              newPos.x -= STEP;
              break;
            case 'ArrowRight':
              newPos.x += STEP;
              break;
            case 'ArrowUp':
              newPos.y -= STEP;
              break;
            case 'ArrowDown':
              newPos.y += STEP;
              break;
          }
        });

        return newPos;
      });
    }, FRAME_RATE);

    return () => clearInterval(moveInterval);
  }, [pendingMoves, isConnected]);

  const sendMoveToContract = useCallback(async (direction) => {
    if (!isConnected || !window.starknet?.account) return;

    try {
      const directionMap = {
        'ArrowLeft': 0,
        'ArrowRight': 1,
        'ArrowUp': 2,
        'ArrowDown': 3
      };

      const tx = await window.starknet.account.execute({
        contractAddress: WORLD_ADDRESS,
        entrypoint: 'move',
        calldata: [directionMap[direction]]
      });

      window.starknet.provider.waitForTransaction(tx.transaction_hash)
        .catch(error => console.error('Move transaction failed:', error));
    } catch (error) {
      console.error('Error sending move to contract:', error);
    }
  }, [isConnected]);

  const move = useCallback((direction, isKeyDown) => {
    if (!isConnected) return;
    
    setPendingMoves(prev => {
      const newMoves = new Set(prev);
      if (isKeyDown) {
        newMoves.add(direction);
        sendMoveToContract(direction);
      } else {
        newMoves.delete(direction);
      }
      return newMoves;
    });
  }, [sendMoveToContract, isConnected]);

  const spawn = async () => {
    if (!isConnected || !window.starknet?.account) return;
    
    try {
      const tx = await window.starknet.account.execute({
        contractAddress: WORLD_ADDRESS,
        entrypoint: 'spawn',
        calldata: []
      });
      await window.starknet.provider.waitForTransaction(tx.transaction_hash);
    } catch (error) {
      console.error('Error spawning character:', error);
    }
  };

  return {
    position,
    spawn,
    move,
    isInitialized,
    isConnected,
    connectWallet
  };
} 