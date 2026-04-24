import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import PrintButton from "@/app/_components/PrintButton";

export const metadata: Metadata = {
  title: "Data Privacy Agreement — Readee for Schools",
  description:
    "Readee's Data Privacy Agreement (DPA) template and countersignature instructions for school and district procurement offices.",
};

export default function DpaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 print:max-w-none print:p-6">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/schools"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Schools
        </Link>
        <PrintButton />
      </div>

      <div className="mt-6 print:mt-0">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600">
          <Shield className="h-4 w-4" />
          Data Privacy Agreement
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 print:text-2xl">
          Readee Data Privacy Agreement
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          For school and district procurement offices. Readee follows the{" "}
          <strong>SDPC Standard DPA</strong> (National Data Privacy Agreement
          v1.0), with state exhibits as required.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">How to countersign</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
          <li>
            Email your preferred DPA (district template OR SDPC Standard DPA)
            to <strong>hello@readee.app</strong> with subject{" "}
            <em>"Readee DPA — [District name]"</em>.
          </li>
          <li>
            We return a countersigned version within 5-10 business days,
            typically same-week. Include state exhibits (NY 2-d, CA SOPIPA,
            CO HB 16-1423, IL SOPPA) on request.
          </li>
          <li>
            We maintain a signed copy on file. You can request a fresh PDF
            at any time.
          </li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">What Readee commits to</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          <li>
            <strong>No selling student data.</strong> Ever. This is in our
            TOS and binding under the Student Privacy Pledge.
          </li>
          <li>
            <strong>No targeted advertising</strong> using student
            information, and no ad networks of any kind in the K-4 app.
          </li>
          <li>
            <strong>No secondary use.</strong> Student data is used only to
            operate Readee as the district directs — not to build a model
            or product for sale.
          </li>
          <li>
            <strong>COPPA school-consent model.</strong> School acts as the
            authorized COPPA agent for students under 13, as permitted by
            the FTC's school-authorization guidance.
          </li>
          <li>
            <strong>FERPA school-official status.</strong> Readee operates
            as a school official with a legitimate educational interest in
            student records, under direct control of the school.
          </li>
          <li>
            <strong>Data minimization.</strong> We collect only what the
            product requires to function: first name, class code, reading
            progress. No surveillance-style data collection.
          </li>
          <li>
            <strong>Breach notification.</strong> Within 72 hours of
            confirmed unauthorized access, to the district&apos;s
            designated contact.
          </li>
          <li>
            <strong>Deletion.</strong> On written request or contract end,
            all student records are deleted within 30 days. Backups
            purge on the normal rotation cycle (90 days max).
          </li>
          <li>
            <strong>Subprocessors disclosed.</strong> Supabase (database,
            auth, storage), Vercel (hosting), Google Gemini (AI, U.S.
            region only), Stripe (billing), Resend (transactional
            email). All US-based. Full list and changes at{" "}
            <Link href="/privacy-for-schools" className="font-semibold text-indigo-700 hover:underline">
              /privacy-for-schools
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">What Readee needs from your team</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          <li>
            A primary data-privacy contact email (kept confidential).
          </li>
          <li>
            Which state-specific exhibits, if any, are required.
          </li>
          <li>
            Rostering source: Google Classroom (live), manual list,
            or Clever/ClassLink (Q3 2026).
          </li>
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-xs text-zinc-600 print:break-inside-avoid">
        <div className="font-bold text-zinc-900">Readee Learning LLC</div>
        <div className="mt-0.5">EIN 42-1903828 · NJ LLC</div>
        <div className="mt-0.5">hello@readee.app · 81 Culver Street, Somerset NJ 08873</div>
        <div className="mt-2">
          For non-DPA privacy questions, see our{" "}
          <Link href="/privacy-for-schools" className="font-semibold text-indigo-700 hover:underline">
            privacy-for-schools
          </Link>{" "}
          policy page.
        </div>
      </section>
    </div>
  );
}
