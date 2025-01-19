import { Contract } from 'starknet';

export const getGameContract = (provider) => {
    return new Contract(
        YOUR_ABI,
        YOUR_CONTRACT_ADDRESS,
        provider
    );
}; 