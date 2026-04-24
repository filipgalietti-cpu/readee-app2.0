import type { Metadata } from "next";
import Link from "next/link";
import { School, Users2, GraduationCap, FileText, Check, Download, Shield, DollarSign, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Readee for Schools & Districts",
  description:
    "Per-seat pricing, PO-friendly billing, and privacy-agreement-ready Readee deployments for schools and districts.",
};

export default function SchoolsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        <School className="h-4 w-4" />
        Schools &amp; districts
      </div>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
        Readee for every classroom
      </h1>
      <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-slate-300">
        K–4 reading instruction aligned to Common Core and the Science of
        Reading, authored by a certified reading specialist. Per-seat
        pricing, district-friendly billing, and DPA-ready from day one.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <ValueProp
          icon={GraduationCap}
          title="Zero-friction student onboarding"
          body="Students sign in with a 6-character class code and tap their name. No email, no password, no parent required."
        />
        <ValueProp
          icon={Shield}
          title="Privacy-first by design"
          body="COPPA school-consent model, FERPA school-official status, SDPC-standard DPA, and state-specific exhibits."
        />
        <ValueProp
          icon={FileText}
          title="PO-ready billing"
          body="Purchase orders, W-9 on file, and annual invoicing. No teacher credit cards required."
        />
      </div>

      {/* Pricing */}
      <section className="mt-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Pricing
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Simple per-seat pricing. A &quot;seat&quot; = one student, billed
          annually.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <PricingCard
            tier="Classroom"
            price="$3"
            unit="per student / year"
            highlight={false}
            features={[
              "Up to 35 students in one class",
              "Full K–4 reading curriculum",
              "Assignments + teacher dashboard",
              "Parent-invite add-on available",
            ]}
            cta="Start free trial"
            ctaHref="/signup"
          />
          <PricingCard
            tier="School"
            price="$2.50"
            unit="per student / year"
            highlight
            features={[
              "Unlimited classrooms in one school",
              "Principal admin dashboard",
              "Bulk roster import (CSV, Google Classroom)",
              "Priority email support",
              "50+ seats minimum",
            ]}
            cta="Request a quote"
            ctaHref="mailto:hello@readee.app?subject=Readee%20School%20pricing"
          />
          <PricingCard
            tier="District"
            price="Custom"
            unit="volume discount"
            highlight={false}
            features={[
              "Multi-school admin rollup",
              "Clever / ClassLink rostering (coming Q3 2026)",
              "SSO for teachers on school domains",
              "Dedicated onboarding + success manager",
              "Signed DPA with state exhibits",
            ]}
            cta="Talk to us"
            ctaHref="mailto:hello@readee.app?subject=Readee%20District%20pricing"
          />
        </div>
      </section>

      {/* Funding */}
      <section className="mt-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Funding your purchase
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-slate-400">
          Readee fits inside several federal and state funding streams.
          Pull a one-pager for your business manager or grant writer.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <FundingCard
            title="Title I, Part A"
            body="Supplemental instruction for low-income schools. Readee qualifies as a supplemental literacy intervention tool."
          />
          <FundingCard
            title="Title II, Part A"
            body="Teacher training + instructional technology. Readee.ai assignment wizard + teacher dashboards qualify."
          />
          <FundingCard
            title="Title IV, Part A"
            body="Well-rounded education, safe &amp; healthy schools, effective use of technology. Reading is well-rounded."
          />
          <FundingCard
            title="IDEA, Part B"
            body="Supplementary aids for students with IEPs. Read-aloud audio + dyslexia-friendly design qualify."
          />
          <FundingCard
            title="State reading grants"
            body="Many states have dedicated K-3 reading proficiency funds. Readee aligns to the Science of Reading."
          />
          <FundingCard
            title="Curriculum adoption funds"
            body="Readee works as a supplement to your core ELA curriculum — purchasable under your annual adoption budget."
          />
        </div>
        <div className="mt-5">
          <Link
            href="/schools/funding-guide"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Open the printable funding guide
          </Link>
        </div>
      </section>

      {/* Trust / privacy pledge */}
      <section className="mt-14 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-indigo-50 p-6 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-indigo-950/30">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Award className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-zinc-900 dark:text-white">
              Student Privacy Pledge signatory
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-slate-400">
              Readee is a signatory of the Student Privacy Pledge (SDPC).
              We commit to not sell student information, not use student
              data for targeted advertising, and to disclose our data
              practices in plain English.{" "}
              <Link href="/privacy-for-schools" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
                Read our full privacy commitments →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Procurement */}
      <section className="mt-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Procurement &amp; paperwork
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Everything your procurement office needs, in one place.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <PaperworkLink
            icon={FileText}
            title="W-9"
            body="Readee Learning LLC, EIN 42-1903828. Email for signed copy."
            href="mailto:hello@readee.app?subject=Readee%20W-9%20request"
          />
          <PaperworkLink
            icon={FileText}
            title="Purchase Order form"
            body="Send your district's PO template to hello@readee.app; we sign and return same-day."
            href="mailto:hello@readee.app?subject=Readee%20Purchase%20Order"
          />
          <PaperworkLink
            icon={Shield}
            title="Data Privacy Agreement"
            body="SDPC Standard DPA + state exhibits. Download the printable template or email to countersign."
            href="/schools/dpa"
          />
          <PaperworkLink
            icon={Download}
            title="Privacy-for-schools detail"
            body="COPPA, FERPA, NY 2-d, CA SOPIPA, CO, IL — full policy page."
            href="/privacy-for-schools"
          />
          <PaperworkLink
            icon={Users2}
            title="Certificate of Insurance"
            body="Available on request; general liability + cyber."
            href="mailto:hello@readee.app?subject=Readee%20COI%20request"
          />
          <PaperworkLink
            icon={FileText}
            title="Vendor security questionnaire"
            body="We'll respond to your standard form (HECVAT Lite, SIG, custom)."
            href="mailto:hello@readee.app?subject=Readee%20vendor%20security%20questionnaire"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 text-center dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/30">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Start with a pilot classroom — free
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">
          One free teacher account, one classroom, full curriculum access.
          Bring Readee to your reading block tomorrow; we&apos;ll quote the
          school or district once you&apos;re ready.
        </p>
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Create a free teacher account
          </Link>
          <a
            href="mailto:hello@readee.app?subject=Readee%20district%20pilot"
            className="inline-flex items-center justify-center rounded-full border border-indigo-300 bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
          >
            Talk to us about a district pilot
          </a>
        </div>
      </section>
    </div>
  );
}

function ValueProp({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Shield;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-bold text-zinc-900 dark:text-white">{title}</div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">{body}</p>
    </div>
  );
}

function PricingCard({
  tier,
  price,
  unit,
  highlight,
  features,
  cta,
  ctaHref,
}: {
  tier: string;
  price: string;
  unit: string;
  highlight: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        highlight
          ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-white shadow-lg dark:border-indigo-500 dark:from-indigo-950/30 dark:to-slate-900/40"
          : "border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
          {tier}
        </div>
        {highlight && (
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Most common
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{price}</span>
        <span className="text-xs text-zinc-500 dark:text-slate-400">{unit}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-slate-300">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        {cta}
      </Link>
    </div>
  );
}

function FundingCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <DollarSign className="h-4 w-4" />
      </div>
      <div>
        <div className="font-bold text-zinc-900 dark:text-white">{title}</div>
        <div
          className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>
    </div>
  );
}

function PaperworkLink({
  icon: Icon,
  title,
  body,
  href,
}: {
  icon: typeof Shield;
  title: string;
  body: string;
  href: string;
}) {
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");
  const Tag: any = isExternal ? "a" : Link;
  const props = isExternal ? { href } : { href };
  return (
    <Tag
      {...props}
      className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="font-bold text-zinc-900 dark:text-white">{title}</div>
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">{body}</div>
      </div>
    </Tag>
  );
}
