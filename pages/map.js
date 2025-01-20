import Map from '../components/Map';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GeistSans } from 'geist/font'
import Inventory from '../components/inventory'

const font = GeistSans

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
    <main className={`${font.className} min-h-screen relative`}>
      <div className="relative w-full h-screen">
        <Map />
      </div>
      <Inventory />
    </main>
  );
}

// Add this to prevent static path error
export async function getStaticProps() {
  return {
    props: {}
  };
}
