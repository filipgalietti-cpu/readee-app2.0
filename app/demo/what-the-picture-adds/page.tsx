"use client";

import LessonRunner from "@/app/components/lesson-v2/LessonRunner";
import { whatThePictureAdds } from "@/app/data/lessons-v2/what-the-picture-adds";

// FACTORY-AUTHORED lesson · /demo/what-the-picture-adds
export default function Page() {
  return <LessonRunner lesson={whatThePictureAdds} />;
}
