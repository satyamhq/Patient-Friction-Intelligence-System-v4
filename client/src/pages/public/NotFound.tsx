import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home, Compass } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
        <Compass className="w-8 h-8 animate-spin" />
      </div>
      <h1 className="text-4xl font-black text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
        The accessibility route or clinical portal you requested does not exist.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
          Return to PFIS Home
        </Button>
      </Link>
    </div>
  );
};
