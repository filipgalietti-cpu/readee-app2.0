"use client";

import { useState, useEffect } from "react";

interface LoadingImageProps {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function LoadingImage({ src, alt = "", className = "", containerClassName = "", onError }: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Reset when src changes (e.g. slide transitions)
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [src]);

  if (errored || !src) return null;

  return (
    <div className={`relative ${containerClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 skeleton-shimmer rounded-2xl" />
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
      />
    </div>
  );
}
