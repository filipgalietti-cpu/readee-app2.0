"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { mapsAndPhotos } from "@/app/data/lessons-v2/maps-and-photos";

// FACTORY-AUTHORED lesson · /demo/maps-and-photos
export default function Page() {
  return <LessonRunner lesson={mapsAndPhotos} />;
}
