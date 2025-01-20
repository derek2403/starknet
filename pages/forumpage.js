import Forum from '../components/Forum';
import { GeistSans } from 'geist/font'
import Inventory from '../components/inventory'

const font = GeistSans

export default function ForumPage() {
  return (
    <main className={`${font.className} min-h-screen relative`}>
      <Forum onClose={() => window.history.back()} />
      <Inventory />
    </main>
  );
}
