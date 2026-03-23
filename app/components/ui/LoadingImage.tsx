"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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

  if (errored || !src) return null;

  return (
    <div className={`relative ${containerClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-2xl">
          <motion.div
            className="w-8 h-8 rounded-full border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-500 dark:border-t-indigo-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
      />
    </div>
  );
}
