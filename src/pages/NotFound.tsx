import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h1 className="text-6xl font-black text-muted-foreground/20">404</h1>
      <h2 className="text-2xl font-bold">Page not found</h2>
      <p className="text-muted-foreground">The content you are looking for has vanished into the void.</p>
      <Link to="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}