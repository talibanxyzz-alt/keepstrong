'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  /** Classes for the square behind the mark (e.g. warm sidebar tile). */
  iconShellClassName?: string;
  textClassName?: string;
}

export default function Logo({ 
  size = 36, 
  showText = true, 
  className = '',
  iconShellClassName = 'rounded-lg shadow-sm bg-surface',
  textClassName = 'text-lg font-bold text-charcoal'
}: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`flex items-center justify-center overflow-hidden flex-shrink-0 ${iconShellClassName}`}
        style={{ width: size, height: size }}
      >
        {!imageError ? (
          <Image
            src="/logo.svg"
            alt="KeepStrong"
            width={size}
            height={size}
            className="w-full h-full object-contain"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full bg-primary flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <span className="text-white font-bold" style={{ fontSize: size * 0.5 }}>
              K
            </span>
          </div>
        )}
      </div>
      {showText && (
        <span className={textClassName}>KeepStrong</span>
      )}
    </div>
  );
}

