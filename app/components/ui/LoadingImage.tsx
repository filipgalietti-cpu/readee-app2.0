"use client";

import { useState, useEffect, useRef } from "react";

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
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset when src changes. If the browser already has the image cached, `complete` is true
  // and onLoad won't fire — flip `loaded` manually. Also safety-timeout so the skeleton can
  // never stay over a loaded image indefinitely.
  useEffect(() => {
    setErrored(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const fallback = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(fallback);
  }, [src]);

  if (errored || !src) return null;

  return (
    <div className={`relative ${containerClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 skeleton-shimmer rounded-2xl pointer-events-none" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
      />
    </div>
  );
}
