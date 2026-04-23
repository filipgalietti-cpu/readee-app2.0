import type { Metadata } from "next";
import Link from "next/link";
import { Shield, FileText, Lock, Building2, ScrollText, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy for Schools — Readee",
  description:
    "COPPA, FERPA, and state privacy compliance details for schools and districts evaluating Readee Learning.",
};

const LAST_UPDATED = "April 2026";

export default function PrivacyForSchoolsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        <Shield className="h-4 w-4" />
        Privacy for schools
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        Readee&apos;s privacy commitments to schools and districts
      </h1>
      <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
        Last updated: {LAST_UPDATED}. This page covers Readee&apos;s COPPA,
        FERPA, and state-law commitments when Readee is used in a school
        setting. Consumer (parent-purchased) disclosures live on the
        separate{" "}
        <Link href="/privacy-policy" className="font-semibold text-indigo-600 underline">
          Privacy Policy
        </Link>
        .
      </p>

      <nav className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          On this page
        </div>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          <li>
            <a href="#summary" className="text-indigo-600 hover:underline">The short version</a>
          </li>
          <li>
            <a href="#coppa" className="text-indigo-600 hover:underline">COPPA (under-13 data)</a>
          </li>
          <li>
            <a href="#ferpa" className="text-indigo-600 hover:underline">FERPA (student records)</a>
          </li>
          <li>
            <a href="#state-laws" className="text-indigo-600 hover:underline">State laws (NY, CA, CO, IL)</a>
          </li>
          <li>
            <a href="#data-inventory" className="text-indigo-600 hover:underline">What data we collect</a>
          </li>
          <li>
            <a href="#security" className="text-indigo-600 hover:underline">Security practices</a>
          </li>
          <li>
            <a href="#dpa" className="text-indigo-600 hover:underline">Data Privacy Agreement (DPA)</a>
          </li>
          <li>
            <a href="#contact" className="text-indigo-600 hover:underline">Contact the privacy team</a>
          </li>
        </ul>
      </nav>

      <Section id="summary" icon={ScrollText} title="The short version">
        <ul className="list-disc space-y-2 pl-5 text-zinc-700 dark:text-slate-300">
          <li>
            Readee treats student information under the <strong>school-consent</strong> model
            for school-purchased accounts: the school acts as the COPPA
            verifiable-parental-consent authority on behalf of parents.
          </li>
          <li>
            Student data is used <strong>solely to provide Readee</strong> to
            the school. We never sell student data, never use it for
            advertising, and never build profiles for any purpose other than
            delivering the reading-instruction product.
          </li>
          <li>
            We sign district DPAs, including the NTSPRA / SDPC Standard
            Student Data Privacy Agreement. Turnaround is typically 5–10
            business days for reasonable markup. Request at{" "}
            <a className="font-semibold text-indigo-600 underline" href="mailto:hello@readee.app">
              hello@readee.app
            </a>
            .
          </li>
          <li>
            Student records are returned or destroyed within 45 days of a
            district&apos;s written request, or automatically 12 months after
            a classroom is archived, whichever is sooner.
          </li>
          <li>
            Readee Learning LLC is a New Jersey company, EIN 42-1903828.
            Data lives in AWS us-east-1 via Supabase.
          </li>
        </ul>
      </Section>

      <Section id="coppa" icon={Shield} title="COPPA — Children's Online Privacy Protection Act">
        <p>
          COPPA applies to online services collecting information from children
          under 13. Readee&apos;s audience is K–4 (ages 5–10), so COPPA
          compliance is central to how we operate.
        </p>
        <p>
          <strong>In a school setting:</strong> under FTC guidance, a school
          may consent to the collection of personal information from a student
          on behalf of parents when the information is collected and used only
          for an educational purpose and for no other commercial purpose.
          Readee relies on this school-consent exception for
          classroom-provisioned student accounts.
        </p>
        <p>
          <strong>For classroom-owned student accounts, we collect:</strong>{" "}
          first name (and optional last initial), grade level, and the
          learning activity the student does inside Readee (items attempted,
          items correct, which lessons completed, time on task). We do{" "}
          <strong>not</strong> collect student emails, last names in full,
          photos, geolocation, or any behavioral advertising identifiers.
        </p>
        <p>
          <strong>Parent notice and opt-out:</strong> schools are responsible
          for providing direct notice to parents under COPPA&apos;s school
          exception. Readee supplies a{" "}
          <a className="font-semibold text-indigo-600 underline" href="mailto:hello@readee.app">
            template parent notice
          </a>{" "}
          on request. Parents may contact Readee directly to review,
          request deletion of, or refuse further collection of their
          child&apos;s information.
        </p>
      </Section>

      <Section id="ferpa" icon={FileText} title="FERPA — Family Educational Rights and Privacy Act">
        <p>
          When a school contracts with Readee, Readee acts as a{" "}
          <strong>&quot;school official&quot; with a legitimate educational
          interest</strong> under 34 CFR § 99.31(a)(1). In that capacity we:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Use education records only for the purpose(s) the school has
            engaged Readee to perform (reading instruction, practice, and
            reporting back to the teacher)
          </li>
          <li>
            Maintain the records under the direct control of the school with
            respect to the use and maintenance of education records
          </li>
          <li>
            Do not redisclose personally identifiable information from
            education records to any third party without the school&apos;s
            prior authorization, except as required by law
          </li>
          <li>
            Allow the school to audit our handling of education records on
            reasonable notice
          </li>
        </ul>
        <p>
          Parents retain all FERPA rights with respect to education records
          stored in Readee, including the right to inspect, request
          amendment of, and (through the school) request deletion of such
          records.
        </p>
      </Section>

      <Section id="state-laws" icon={Building2} title="State student-privacy laws">
        <p>
          Readee commits to the core obligations of the following state
          laws. If your district is in a state not listed here, email us —
          we add coverage as customers request it.
        </p>

        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
          New York Education Law § 2-d / Part 121
        </h3>
        <p>
          Readee will execute a NY Parents&apos; Bill of Rights supplement
          on request. Education records from NY districts are never sold,
          never used for marketing, and are returned/destroyed at contract
          end per Part 121. NY data-breach notification timelines (≤7
          calendar days to the district) are contractually committed.
        </p>

        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
          California AB 1584 / SOPIPA
        </h3>
        <p>
          Readee complies with California&apos;s Student Online Personal
          Information Protection Act: no targeted advertising, no
          profiling for non-educational purposes, no sale of student data,
          and deletion on district request. Pupil records remain the
          property of and under the control of the LEA.
        </p>

        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
          Colorado Student Data Transparency and Security Act (HB 16-1423)
        </h3>
        <p>
          Readee is available for listing on the Colorado Department of
          Education On-Demand Service Provider Contract Database. Data
          handling mirrors the statutory requirements, including incident
          notification and data-destruction obligations.
        </p>

        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
          Illinois SOPPA (Student Online Personal Protection Act)
        </h3>
        <p>
          Readee will sign an Illinois SOPPA-compliant DPA for IL districts.
          We commit to the 30-day breach-notification window and to posting
          the required transparency notices at the school&apos;s direction.
        </p>

        <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
          Other states
        </h3>
        <p>
          For Connecticut Public Act 16-189, Virginia SDPA, Louisiana
          Act 837, Utah 53E-9-308, and other state frameworks, Readee will
          either sign the state&apos;s model DPA or the SDPC Standard DPA
          with the state-specific exhibit. Contact us.
        </p>
      </Section>

      <Section id="data-inventory" icon={ScrollText} title="What data we collect, and why">
        <p>
          For transparency, here is every category of data Readee collects
          for classroom-owned student accounts, along with the reason.
        </p>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              <tr>
                <th className="pb-2 pr-4 font-semibold">Category</th>
                <th className="pb-2 pr-4 font-semibold">Example</th>
                <th className="pb-2 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
              <DataRow
                category="Student identifier"
                example="First name + last initial"
                purpose="Displayed to the teacher and to the student in the name-tile sign-in"
              />
              <DataRow
                category="Grade level"
                example="K, 1st, 2nd…"
                purpose="Selecting the right standards-aligned content"
              />
              <DataRow
                category="Practice activity"
                example="Questions attempted, correct, carrots earned"
                purpose="Progress tracking, teacher reports, assignment completion"
              />
              <DataRow
                category="Lesson progress"
                example="Which lessons completed, scores"
                purpose="Teacher insights and adaptive placement"
              />
              <DataRow
                category="Teacher identifier"
                example="Teacher email (from SSO)"
                purpose="Authentication and communications to the teacher"
              />
              <DataRow
                category="Session cookie"
                example="readee_student (HMAC-signed)"
                purpose="Keeping the student signed in after they tap their name tile. No PII inside."
              />
              <DataRow
                category="Usage telemetry"
                example="Page visits, feature usage"
                purpose="Product improvement. We use PostHog with strict PII masking."
              />
              <DataRow
                category="Error reports"
                example="Uncaught exceptions"
                purpose="Reliability. We use Sentry with student identifiers scrubbed."
              />
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          <strong>What we do NOT collect:</strong> student last names in
          full (only an initial is stored), student emails, student photos,
          student geolocation, parent financial information for school
          accounts, biometric data, or behavioral advertising identifiers.
        </p>
      </Section>

      <Section id="security" icon={Lock} title="Security practices">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Hosting:</strong> Vercel (edge/Node runtime) and Supabase
            (Postgres, Auth, Storage) — both in AWS us-east-1.
          </li>
          <li>
            <strong>Encryption in transit:</strong> TLS 1.2+ for all
            endpoints (<code>learn.readee.app</code>, <code>api.supabase.co</code>).
          </li>
          <li>
            <strong>Encryption at rest:</strong> AES-256 for Supabase
            Postgres, storage, and backups.
          </li>
          <li>
            <strong>Access control:</strong> Row-level security policies on
            every table. Teachers see only their classrooms; students see
            only their own data; admins at schools/districts see only their
            scope.
          </li>
          <li>
            <strong>Authentication:</strong> Supabase Auth for
            educators/parents (password + SSO). Classroom-owned students
            never have passwords; they sign in via class-code + name-tile
            which issues a short-lived signed cookie.
          </li>
          <li>
            <strong>Payments:</strong> handled entirely by Stripe. No card
            data touches Readee servers. Readee is PCI-DSS out-of-scope via
            Stripe SAQ A.
          </li>
          <li>
            <strong>Backups:</strong> Supabase daily automated backups; 7-day
            point-in-time recovery.
          </li>
          <li>
            <strong>Incident response:</strong> any unauthorized disclosure
            of student data is disclosed to the affected district within 72
            hours (or sooner as required by state law).
          </li>
        </ul>
      </Section>

      <Section id="dpa" icon={FileText} title="Data Privacy Agreement (DPA)">
        <p>
          Readee will sign the <strong>SDPC Standard Student Data Privacy
          Agreement</strong> (v2.0) or the district&apos;s model DPA,
          including state-specific exhibits. Our typical turnaround on
          review is 5 business days for standard language and up to 10
          business days when redlines require legal review.
        </p>
        <p>
          Email{" "}
          <a className="font-semibold text-indigo-600 underline" href="mailto:hello@readee.app?subject=DPA%20request">
            hello@readee.app
          </a>{" "}
          with your district name, a DPA draft (if you have one), and the
          primary contact for signature routing. We do not ask districts to
          sign arbitration clauses or limitation-of-liability terms that
          undermine the DPA.
        </p>
      </Section>

      <Section id="contact" icon={Mail} title="Contact the privacy team">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="text-sm">
            <div>
              <strong>Readee Learning LLC</strong>
            </div>
            <div>81 Culver Street, Somerset, NJ 08873</div>
            <div>
              Privacy contact:{" "}
              <a className="font-semibold text-indigo-600 underline" href="mailto:hello@readee.app">
                hello@readee.app
              </a>
            </div>
          </div>
          <div className="mt-4 text-xs text-zinc-500 dark:text-slate-400">
            For DPAs, breach notifications, parent-initiated requests, and
            any privacy questions, email the address above. We respond
            within two business days.
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof Shield;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

function DataRow({
  category,
  example,
  purpose,
}: {
  category: string;
  example: string;
  purpose: string;
}) {
  return (
    <tr>
      <td className="py-2 pr-4 font-semibold text-zinc-900 dark:text-white">
        {category}
      </td>
      <td className="py-2 pr-4 text-zinc-600 dark:text-slate-400">{example}</td>
      <td className="py-2 text-zinc-600 dark:text-slate-400">{purpose}</td>
    </tr>
  );
}
