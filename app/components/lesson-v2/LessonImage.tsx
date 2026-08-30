"use client";

import { LoadingImage } from "@/app/components/ui/LoadingImage";

/** Lesson image with skeleton-while-loading (reuses the app's LoadingImage —
 *  no bare <img> lag flashes; K attention spans don't wait for network). */
export default function LessonImage({
  src,
  width,
  height,
  className,
  containerClassName,
}: {
  src: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <LoadingImage
      src={src}
      alt=""
      containerClassName={containerClassName ?? "rounded-2xl"}
      className={className ?? "h-full w-full object-contain"}
      style={width || height ? { width, height } : undefined}
    />
  );
}
