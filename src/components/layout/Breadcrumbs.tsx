import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Skip the first segment if it's 'app' or 'admin' (prefix)
  const displaySegments = pathSegments.filter((s) => s !== 'app' && s !== 'admin');

  const formatSegment = (segment: string) => {
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const buildPath = (index: number) => {
    return '/' + pathSegments.slice(0, pathSegments.indexOf(displaySegments[index]) + 1).join('/');
  };

  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {displaySegments.map((segment, index) => {
          const isLast = index === displaySegments.length - 1;
          return (
            <li key={segment + index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              )}
              {isLast ? (
                <span className="text-sm font-medium text-foreground">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link
                  to={buildPath(index)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {formatSegment(segment)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};