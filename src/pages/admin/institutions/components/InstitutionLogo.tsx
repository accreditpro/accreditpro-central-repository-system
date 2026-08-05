import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const LOGO_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
];

function getInstitutionInitials(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1);
  const initials = words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return initials || 'UN';
}

function getGradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return LOGO_GRADIENTS[hash % LOGO_GRADIENTS.length];
}

const sizeMap = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-2xl',
} as const;

interface InstitutionLogoProps {
  name: string;
  logo?: string;
  size?: keyof typeof sizeMap;
  className?: string;
  rounded?: 'md' | 'full';
}

/**
 * Displays an institution's college logo. Falls back to a deterministic
 * gradient-initials avatar when no logo URL is present or the image fails
 * to load, so the logo column always renders something polished.
 */
export function InstitutionLogo({
  name,
  logo,
  size = 'md',
  className,
  rounded = 'md',
}: InstitutionLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Reset the error state when the logo URL changes so a corrected URL can re-render
  useEffect(() => {
    setImgError(false);
  }, [logo]);

  const showImage = Boolean(logo) && !imgError;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border bg-muted',
        rounded === 'md' ? 'rounded-xl' : 'rounded-full',
        sizeMap[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={cn(
            'flex h-full w-full select-none items-center justify-center bg-gradient-to-br font-bold text-white',
            getGradientFor(name)
          )}
        >
          {getInstitutionInitials(name)}
        </span>
      )}
    </div>
  );
}
