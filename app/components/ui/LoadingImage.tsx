"use client";

import { useState, useEffect, useRef } from "react";

interface LoadingImageProps {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  /** CSS aspect-ratio for the skeleton (defaults to "1 / 1" for square question images). */
  aspectRatio?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function LoadingImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  aspectRatio = "1 / 1",
  onError,
}: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setErrored(false);
    // If the browser already has the image cached, `complete` is true and onLoad
    // won't fire — flip `loaded` manually so the fade-in still completes.
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    // Safety timeout so a dropped onLoad event can never leave the image invisible.
    const fallback = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(fallback);
  }, [src]);

  if (errored || !src) return null;

  return (
    <div
      className={`relative inline-block overflow-hidden rounded-2xl ${containerClassName}`}
      style={{ aspectRatio }}
    >
      <div
        className={`absolute inset-0 skeleton-shimmer rounded-2xl pointer-events-none transition-opacity duration-300 ${loaded ? "opacity-0" : "opacity-100"}`}
      />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-out ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
      />
    </div>
  );
}
