import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // ShadCN

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive" aria-hidden="true" />
        <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/" aria-label="Go back to home">
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;