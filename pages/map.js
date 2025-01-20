import Map from '../components/Map';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function MapTest() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case '1':
          router.push('/community');
          break;
        case '2':
          router.push('/dungeonhall');
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [router]);

  return (
    <div className="relative w-full h-screen">
      <Map />
      {/* Optional: Add visual indicators for the shortcuts */}
      <div className="fixed bottom-4 left-4 text-white text-lg space-y-2 bg-black bg-opacity-50 p-4 rounded">
        <p>Press 1: Go to Community</p>
        <p>Press 2: Go to Dungeon Hall</p>
      </div>
    </div>
  );
}

// Add this to prevent static path error
export async function getStaticProps() {
  return {
    props: {}
  };
}
