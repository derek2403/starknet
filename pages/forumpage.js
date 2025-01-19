import Forum from '../components/Forum';

export default function ForumPage() {
  return (
    <Forum onClose={() => window.history.back()} />
  );
}
