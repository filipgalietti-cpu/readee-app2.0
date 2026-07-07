"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

interface LoadingImageProps {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  /** Inline style for the container — lets callers size the skeleton box
   *  (e.g. a dynamic `vh` height) so the shimmer is visible while loading. */
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Rendered in place of the image when load fails. If omitted, the
   *  default fallback is a soft gradient with the Readee bunny mascot
   *  so a missing image still feels on-brand instead of broken. Pass
   *  `null` explicitly to suppress any fallback (legacy behavior). */
  fallback?: ReactNode | null;
}

function DefaultBunnyFallback({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-pink-50 dark:from-indigo-950/30 dark:via-violet-950/30 dark:to-pink-950/30 ${className ?? ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/ui/bunny-thinking.png"
        alt=""
        className="h-1/2 w-1/2 max-h-32 max-w-32 object-contain opacity-90"
      />
    </div>
  );
}

export function LoadingImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  style,
  onError,
  fallback,
}: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setErrored(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const safety = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(safety);
  }, [src]);

  // No src — render fallback (bunny) so the lesson layout doesn't
  // collapse around a missing image cell.
  if (!src) {
    if (fallback === null) return null;
    return (
      <div className={`relative ${containerClassName}`} style={style}>
        {fallback ?? <DefaultBunnyFallback className={className} />}
      </div>
    );
  }

  if (errored) {
    if (fallback === null) return null;
    return (
      <div className={`relative ${containerClassName}`} style={style}>
        {fallback ?? <DefaultBunnyFallback className={className} />}
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`} style={style}>
      {!loaded && (
        <div className="absolute inset-0 skeleton-shimmer rounded-2xl pointer-events-none" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ease-out ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
      />
    </div>
  );
}
