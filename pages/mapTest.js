import Map from '../components/Map';

export default function MapTest() {
  return (
    <div className="relative w-full h-screen">
      <Map />
    </div>
  );
}

// Add this to prevent static path error
export async function getStaticProps() {
  return {
    props: {}
  };
}
