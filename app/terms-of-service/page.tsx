import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Readee.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-zinc-400 mb-8">Last updated: April 2026 · Version 2.0</p>

      <div className="prose prose-zinc max-w-none space-y-8 text-zinc-700">
        <section>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of Readee, the
            educational reading platform operated by Readee Learning LLC, a New
            Jersey limited liability company (&quot;Readee&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
            By creating an account or using the Service, you agree to these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">1. Who can use Readee</h2>
          <p>The Service is intended for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Parents and legal guardians creating accounts on behalf of children under 13.</li>
            <li>Children 13 and older with parent or guardian consent.</li>
            <li>Educators and school staff using Readee through a school or district account.</li>
            <li>Students under 13 accessing Readee through a school account where school consent applies under COPPA&apos;s school exception.</li>
          </ul>
          <p>
            If you create an account for a child under 13, you represent that you are the
            child&apos;s parent or legal guardian (consumer flow), or that the school has
            authority to consent under FERPA / COPPA&apos;s school exception (district flow).
            See our <a href="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</a> for how we collect and use data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">2. Account types and subscriptions</h2>
          <p>Readee offers several access tiers:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Free</strong> — diagnostic + 1 lesson per grade.</li>
            <li><strong>Readee+</strong> ($9.99/mo or $79.99/yr) — full lesson library + parent analytics.</li>
            <li><strong>Teacher Solo</strong> ($19/mo or $180/yr) — individual educator AI tools.</li>
            <li><strong>Classroom / School / District</strong> — site-licensed pricing for institutional customers.</li>
          </ul>
          <p>
            Pricing on <a href="/upgrade" className="text-indigo-600 hover:underline">/upgrade</a>{" "}
            may change with notice; active subscriptions retain the price you signed up at for the remainder of the term.
          </p>
          <p>
            <strong>Free trials</strong> convert to a paid subscription at the end of the trial period unless you cancel before the trial ends.
          </p>
          <p>
            <strong>Cancellation.</strong> Consumer subscriptions (Readee+, Teacher Solo) can be cancelled at any time from your account settings. Paid features remain active through the end of the current billing period; you revert to the free tier afterward. Refunds are not issued for partial billing periods. District and school subscriptions cancel at the end of the contracted term unless renewal terms specify otherwise.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">3. Account security</h2>
          <p>
            You are responsible for keeping your password secure and for all activity under your account. Provide accurate information at signup, do not share credentials, and notify us at{" "}
            <a href="mailto:hello@readee.app" className="text-indigo-600 hover:underline">hello@readee.app</a>{" "}
            if you suspect unauthorized access. Accounts that are shared or used in violation of these Terms may be suspended.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Service for any unlawful purpose.</li>
            <li>Generate, distribute, or store content that is illegal, defamatory, harassing, sexually explicit, or that infringes another party&apos;s rights.</li>
            <li>Reverse-engineer, scrape, or systematically extract Service content for redistribution.</li>
            <li>Resell or sublicense the Service without a separate written agreement with Readee.</li>
            <li>Use the Service to compete with Readee, including training a competing AI model on Readee output.</li>
            <li>Attempt to circumvent rate limits, paywalls, or content filters.</li>
            <li>Impersonate another person or misrepresent your affiliation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">5. AI-generated content</h2>
          <p>
            Readee&apos;s authoring features use artificial intelligence to generate text, images, and audio in response to prompts (custom quizzes, Readee.ai parent content, daily questions, running records, writing rubric, translation, suggested practice, and others as they ship). By using these features:
          </p>
          <h3 className="text-base font-bold text-zinc-900 mt-4">5.1 Your prompts are your responsibility.</h3>
          <p>
            You retain ownership of the prompts you submit and warrant that they do not infringe any third-party right and do not include personal information of any minor other than the child whose account is used.
          </p>
          <h3 className="text-base font-bold text-zinc-900 mt-4">5.2 You are responsible for output you publish.</h3>
          <p>
            AI-generated output is provided &quot;as-is&quot;. You are responsible for reviewing AI-generated content before assigning it to students or distributing it to parents. You will not knowingly publish AI output that infringes copyright, trademark, publicity, or privacy rights.
          </p>
          <h3 className="text-base font-bold text-zinc-900 mt-4">5.3 Output ownership.</h3>
          <p>
            Subject to these Terms, Readee grants you a non-exclusive, royalty-free, worldwide license to use AI-generated output for educational purposes within your classroom, school, or family. The U.S. Copyright Office&apos;s current position is that AI-generated content without significant human authorship is not eligible for copyright; nothing in these Terms expands that legal status.
          </p>
          <h3 className="text-base font-bold text-zinc-900 mt-4">5.4 Indemnification by user.</h3>
          <p>
            You agree to indemnify and hold Readee harmless from any third-party claim arising from prompts you submitted or AI output you published, distributed, or sold. This does not apply to claims caused by Readee&apos;s own negligence or willful misconduct in operating the AI features.
          </p>
          <h3 className="text-base font-bold text-zinc-900 mt-4">5.5 Hosted content; takedown.</h3>
          <p>
            Readee hosts AI-generated content as a convenience. We comply with the Digital Millennium Copyright Act (see{" "}
            <a href="/copyright" className="text-indigo-600 hover:underline">/copyright</a>) and remove infringing content within a reasonable time after a valid notice. Repeat offenders may have their account suspended or terminated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">6. Children&apos;s data and privacy</h2>
          <p>
            Readee complies with COPPA, FERPA (in school contexts), CCPA, and similar state laws. See our{" "}
            <a href="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</a>.
          </p>
          <p>
            <strong>Schools as agents.</strong> When Readee is purchased by a school or district, the school is treated as an authorized agent of the parent for COPPA purposes and warrants authority under FERPA&apos;s &quot;school official&quot; exception (34 CFR 99.31).
          </p>
          <p>
            <strong>No targeted ads.</strong> We do not serve targeted advertising to children. We do not sell student personal information.
          </p>
          <p>
            <strong>Subprocessors.</strong> We use Supabase (database, auth, storage), Vercel (hosting), Google Gemini / Vertex AI (text + image + audio generation), Anthropic API, OpenAI API, Stripe (payments), Sentry (errors), and PostHog (analytics). Districts sign a Data Processing Addendum that governs the specific data flows for their seats.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">7. Intellectual property</h2>
          <p>
            <strong>Readee&apos;s IP.</strong> The Service, original content authored by Readee, illustrations, branding, the Readee bunny mascot, and the trademarks &quot;Readee&quot; and associated logos are owned by Readee Learning LLC. You may not reproduce or distribute Readee-owned content outside the Service without written permission.
          </p>
          <p>
            <strong>Your content.</strong> Content you author or upload (custom quizzes you build, classroom rosters, your students&apos; work, your prompts) belongs to you. You grant Readee a non-exclusive license to host, display, and process that content to operate the Service. On account deletion, your authored content is deleted from active servers within 30 days; backups expire on their normal cycle.
          </p>
          <p>
            <strong>Feedback.</strong> If you send Readee suggestions or feedback, you grant us a perpetual, royalty-free license to use it without obligation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">8. DMCA / copyright complaints</h2>
          <p>
            See <a href="/copyright" className="text-indigo-600 hover:underline">/copyright</a> for our designated DMCA agent and takedown procedure. Repeat infringers will lose access to AI generation features after two valid takedowns and may have their account terminated after three.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">9. Disclaimers and limitation of liability</h2>
          <p>
            <strong>As-is.</strong> The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          <p>
            <strong>No outcome warranty.</strong> Readee is a tool to support reading practice. We do not guarantee specific educational outcomes, test score improvements, or learning gains.
          </p>
          <p>
            <strong>Cap on liability.</strong> To the maximum extent permitted by law, Readee&apos;s total liability for any claim arising from the Service is limited to the greater of (a) the fees you paid Readee in the twelve months preceding the claim or (b) one hundred U.S. dollars ($100). Readee is not liable for indirect, incidental, special, consequential, or punitive damages.
          </p>
          <p>
            <strong>Exceptions.</strong> Nothing in this section limits liability where prohibited by law, including for gross negligence, willful misconduct, or violations of consumer protection statutes you cannot waive.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">10. Termination</h2>
          <p>
            We may suspend or terminate access for material breach of these Terms, repeated DMCA takedowns, suspected fraud, or unsafe conduct toward children. We provide notice where reasonably possible. You may terminate at any time by deleting your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">11. Dispute resolution</h2>
          <p>
            <strong>Informal first.</strong> Before filing a formal dispute, contact us at{" "}
            <a href="mailto:hello@readee.app" className="text-indigo-600 hover:underline">hello@readee.app</a>{" "}
            and try to resolve in good faith for 30 days.
          </p>
          <p>
            <strong>Governing law and venue.</strong> These Terms are governed by the laws of the State of New Jersey. Any unresolved dispute will be brought in the state or federal courts in Somerset County, New Jersey, and each party consents to personal jurisdiction there.
          </p>
          <p>
            <strong>No class actions for consumer accounts.</strong> For consumer (Readee+) accounts, you agree to bring any claim on an individual basis, not as a class member, plaintiff, or representative. School and district customers proceed under their separately negotiated Master Services Agreement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">12. Changes to these Terms</h2>
          <p>
            We may update these Terms. Material changes will be announced via email or in-product notice at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">13. Miscellaneous</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Severability.</strong> If any provision is unenforceable, the rest remains in effect.</li>
            <li><strong>No waiver.</strong> Failure to enforce any provision is not a waiver.</li>
            <li><strong>Force majeure.</strong> Neither party is liable for delays caused by events beyond reasonable control.</li>
            <li><strong>Entire agreement.</strong> These Terms, together with the Privacy Policy, the Copyright/DMCA page, and any signed Master Services Agreement or DPA, constitute the entire agreement between you and Readee.</li>
            <li><strong>Assignment.</strong> You may not assign these Terms. Readee may assign them in connection with a merger, acquisition, or sale.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">14. Contact</h2>
          <p className="not-prose">
            Readee Learning LLC<br />
            81 Culver Street<br />
            Somerset, NJ 08873<br />
            <a href="mailto:hello@readee.app" className="text-indigo-600 hover:underline">hello@readee.app</a>
          </p>
        </section>
      </div>
    </div>
  );
}
