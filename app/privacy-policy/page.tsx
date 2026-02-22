import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Readee",
  description: "How Readee collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-zinc-400 mb-8">Last updated: February 2026</p>

      <div className="prose prose-zinc max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Introduction
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Readee (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
            committed to protecting the privacy of our users, especially the
            children who use our platform. This Privacy Policy explains what
            information we collect, how we use it, and your rights regarding your
            data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Information We Collect
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-3">
            When you create an account and use Readee, we collect the following
            information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600">
            <li>
              <strong>Parent account information:</strong> Name and email address
            </li>
            <li>
              <strong>Child profile information:</strong> Child&apos;s first name
              and grade level
            </li>
            <li>
              <strong>Reading assessment results:</strong> Scores and responses
              from diagnostic reading quizzes
            </li>
            <li>
              <strong>Lesson progress:</strong> Completed lessons, carrots earned, and
              reading level progression
            </li>
            <li>
              <strong>Usage data:</strong> How you interact with the platform to
              help us improve the experience
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600">
            <li>
              <strong>To provide the service:</strong> Personalize lesson paths,
              track progress, and deliver reading assessments
            </li>
            <li>
              <strong>To improve the product:</strong> Analyze usage patterns to
              make Readee better for all families
            </li>
            <li>
              <strong>To communicate with you:</strong> Send account-related
              emails such as signup confirmations and progress updates
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Data Sharing
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            We do not sell your personal data to third parties. We use the
            following services to operate Readee:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 mt-3">
            <li>
              <strong>Supabase:</strong> Database and authentication services for
              secure data storage
            </li>
            <li>
              <strong>Resend:</strong> Transactional email delivery for account
              communications
            </li>
          </ul>
          <p className="text-zinc-600 leading-relaxed mt-3">
            These services process data only as necessary to provide their
            functions and are bound by their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            COPPA Compliance
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-3">
            Readee serves children under 13 and complies with the
            Children&apos;s Online Privacy Protection Act (COPPA):
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600">
            <li>
              A parent or guardian account is required before any child profile
              can be created
            </li>
            <li>
              We do not collect personal information directly from children
              without a parent account
            </li>
            <li>
              Child profiles use only a first name — no email, full name, or
              other identifying information is collected from children
            </li>
            <li>
              Parents can review, update, or delete their child&apos;s
              information at any time through the Settings page
            </li>
            <li>
              Parental consent is obtained through the account creation process
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Data Security
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            We take reasonable measures to protect your information, including
            encrypted data transmission (HTTPS), secure authentication, and
            access controls on our database. However, no method of electronic
            storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Your Rights</h2>
          <p className="text-zinc-600 leading-relaxed">
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us. You can also delete your
            account through the Settings page in the app.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Changes to This Policy
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of any material changes by email or through a notice on our
            website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Contact Us</h2>
          <p className="text-zinc-600 leading-relaxed">
            If you have questions about this Privacy Policy or your data, please
            contact us at{" "}
            <a
              href="mailto:hello@readee.app"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              hello@readee.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
