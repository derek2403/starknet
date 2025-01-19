import Image from "next/image";
import { GeistProvider, CssBaseline } from '@geist-ui/core';
import dynamic from 'next/dynamic';

const StarknetProvider = dynamic(() => import('../src/providers/StarknetProvider'), {
  ssr: false
});
const GameLogin = dynamic(() => import('../components/GameLogin'), {
  ssr: false
});

export default function Home() {
  return (
    <GeistProvider>
      <CssBaseline />
      <StarknetProvider>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
          <GameLogin />
        </div>
      </StarknetProvider>
    </GeistProvider>
  );
}
