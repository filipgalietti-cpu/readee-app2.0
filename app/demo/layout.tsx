import { notFound } from "next/navigation";
import DemoShell from "./DemoShell";

/**
 * /demo is the internal workbench (factory previews, robot QA, pilots).
 * Not customer-facing: hidden in production unless ENABLE_DEMOS=1 is set
 * (e.g. on a preview deployment). Always available in local dev.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMOS !== "1") {
    notFound();
  }
  return <DemoShell>{children}</DemoShell>;
}
