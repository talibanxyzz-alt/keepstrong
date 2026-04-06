/**
 * Optimized image component with automatic compression and lazy loading
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getOptimizedImageUrl, generateBlurDataUrl } from '@/lib/utils/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  objectFit = 'cover',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Optimize image URL
  const optimizedSrc = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format: 'webp',
  });

  // Generate blur placeholder
  const blurDataURL = generateBlurDataUrl();

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-100 ${className}`}
        style={{ width, height }}
      >
        <span className="text-slate-400 text-sm">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          objectFit,
          width: '100%',
          height: '100%',
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
      )}
    </div>
  );
}

/**
 * Progress photo component with specific optimizations
 */
export function ProgressPhoto({
  src,
  angle,
  takenAt,
  className = '',
}: {
  src: string;
  angle: string;
  takenAt: string;
  className?: string;
}) {
  return (
    <div className={`group relative aspect-[3/4] ${className}`}>
      <OptimizedImage
        src={src}
        alt={`Progress photo - ${angle}`}
        width={400}
        height={533}
        quality={80}
        className="rounded-lg"
        objectFit="cover"
      />
      
      {/* Overlay with info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
        <div className="absolute bottom-2 left-2 text-white">
          <p className="text-xs font-medium capitalize">{angle.replace('_', ' ')}</p>
          <p className="text-xs opacity-75">{new Date(takenAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Avatar component with optimizations
 */
export function Avatar({
  src,
  name,
  size = 40,
  className = '',
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  if (!src) {
    // Show initials if no image
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        className={`flex items-center justify-center bg-primary text-white font-medium rounded-full ${className}`}
        style={{ width: size, height: size, fontSize: size / 2.5 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={name}
      width={size}
      height={size}
      quality={90}
      className={`rounded-full ${className}`}
      objectFit="cover"
    />
  );
}

