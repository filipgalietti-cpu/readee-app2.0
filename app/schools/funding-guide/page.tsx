import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, DollarSign } from "lucide-react";
import PrintButton from "@/app/_components/PrintButton";

export const metadata: Metadata = {
  title: "Funding Readee — ESSER, Title I, Title IV, IDEA | Readee for Schools",
  description:
    "Printable guide for school business managers and grant writers: how to fund a Readee K-4 reading deployment with federal and state grant dollars.",
};

export default function FundingGuidePage() {
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
          <DollarSign className="h-4 w-4" />
          Funding guide
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 print:text-2xl">
          Funding a Readee purchase with federal and state grant dollars
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          A one-pager for school business managers and grant writers. Readee is
          a K-4 reading comprehension and phonics program aligned to Common
          Core and the Science of Reading, authored by a Certified Reading
          Specialist. Per-student-per-year pricing. PO-friendly billing.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">
          Federal funding streams
        </h2>
        <div className="mt-3 space-y-4 text-sm text-zinc-700">
          <Stream
            code="Title I, Part A"
            allowed="Supplemental literacy instruction for low-income schools"
            justification="Readee provides supplemental standards-aligned reading instruction targeted at at-risk K-4 readers. Adaptive placement, per-standard practice, and parent reports all fit the supplemental-instruction category."
            citation="ESEA §1114, §1115"
          />
          <Stream
            code="Title II, Part A"
            allowed="Teacher training and instructional technology"
            justification="Readee's teacher dashboard, assignment wizard, and Readee.ai content tools function as professional-learning infrastructure — teachers build formative assessments and differentiated passages in minutes instead of hours."
            citation="ESEA §2103"
          />
          <Stream
            code="Title IV, Part A — SSAE"
            allowed="Well-rounded education, safe &amp; healthy schools, effective use of technology"
            justification="Reading comprehension is a core component of well-rounded education. Readee's use of technology for instruction (not just assessment) meets the Title IV-A effective-use-of-tech criterion."
            citation="ESEA §4107, §4109"
          />
          <Stream
            code="Title III, Part A"
            allowed="Supplemental instruction for English Learners"
            justification="Readee's comprehension questions use plain, decodable vocabulary with read-aloud audio — suitable as a supplemental ELL support. (Bilingual Spanish content coming late 2026.)"
            citation="ESEA §3115"
          />
          <Stream
            code="IDEA, Part B"
            allowed="Supplementary aids and services for students with IEPs"
            justification="Readee's built-in text-to-speech, hint audio, and dyslexia-friendly UI make it a standard supplementary aid for students with specific learning disabilities affecting reading."
            citation="IDEA §612(a)(5)(A)"
          />
          <Stream
            code="ESEA §1003 SIG / School Improvement"
            allowed="Instructional improvements in low-performing schools"
            justification="Readee deployments with principal-dashboard rollup can be tied to an SIG intervention plan focused on K-4 reading proficiency gains."
            citation="ESEA §1003"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">State-level funding</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          <li>
            <strong>State K-3 reading proficiency grants:</strong> many states
            (MS, FL, NC, CO, TN, others) fund K-3 reading intervention on top
            of Title I. Readee&apos;s alignment to the Science of Reading fits
            these programs.
          </li>
          <li>
            <strong>Dyslexia / SLD state funds:</strong> several states have
            dedicated dyslexia-screening and support budgets that allow
            supplemental read-aloud and phonics tools.
          </li>
          <li>
            <strong>Curriculum adoption budgets:</strong> annual ELA adoption
            funds cover Readee as a digital supplement. Readee is not a
            replacement for a core program; it augments one.
          </li>
          <li>
            <strong>PTA / building discretionary funds:</strong> for small
            pilots (one classroom, one grade), PTA or principal
            discretionary funds are often the fastest path.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">
          Why Readee qualifies as "supplemental"
        </h2>
        <p className="mt-2 text-sm text-zinc-700">
          Federal supplemental-funding guidance requires tools to{" "}
          <em>add to, not replace</em> core instruction. Readee is a
          digital supplement: teachers assign specific standards practice,
          targeted passages, or decoding drills that complement (not
          replace) the district&apos;s core ELA curriculum. Usage data and
          mastery reports demonstrate the supplementary effect.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-zinc-900">How to order</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
          <li>Request a quote at <strong>hello@readee.app</strong> — tell us seat count and funding source.</li>
          <li>We send a signable SDPC-standard DPA with state exhibits.</li>
          <li>Your purchasing office cuts a PO — we accept PO, check, ACH, or card.</li>
          <li>Rostering: Google Classroom OAuth live; Clever/ClassLink Q3 2026.</li>
          <li>Teachers are onboarded same-week; students join with a 6-char class code.</li>
        </ol>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-xs text-zinc-600 print:break-inside-avoid">
        <div className="font-bold text-zinc-900">Readee Learning LLC</div>
        <div className="mt-0.5">EIN 42-1903828 · NJ LLC · Formed April 2026</div>
        <div className="mt-0.5">hello@readee.app · 81 Culver Street, Somerset NJ 08873</div>
        <div className="mt-2">
          This document is provided as a general-purpose funding-eligibility
          reference. It does not constitute legal or procurement advice.
          Districts should confirm with their own business office and state
          education agency before final purchase.
        </div>
      </section>
    </div>
  );
}

function Stream({
  code,
  allowed,
  justification,
  citation,
}: {
  code: string;
  allowed: string;
  justification: string;
  citation: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 print:break-inside-avoid">
      <div className="flex flex-wrap items-baseline gap-2">
        <div className="font-bold text-zinc-900">{code}</div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          {citation}
        </div>
      </div>
      <div
        className="mt-1 text-sm font-semibold text-indigo-700"
        dangerouslySetInnerHTML={{ __html: allowed }}
      />
      <p className="mt-2 text-sm text-zinc-600">{justification}</p>
    </div>
  );
}
