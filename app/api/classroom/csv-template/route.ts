import { NextResponse } from "next/server";
import { buildTemplateCsv } from "@/lib/csv/quiz-template";

export const dynamic = "force-static";

export async function GET() {
  const csv = buildTemplateCsv();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="readee-quiz-template.csv"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
