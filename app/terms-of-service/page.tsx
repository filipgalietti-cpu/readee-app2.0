import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Readee",
  description: "Terms and conditions for using Readee.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-zinc-400 mb-8">Last updated: February 2026</p>

      <div className="prose prose-zinc max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Agreement to Terms
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            By accessing or using Readee (&quot;the Service&quot;), you agree to
            be bound by these Terms of Service. If you do not agree to these
            terms, please do not use the Service. If you are creating an account
            on behalf of a child, you represent that you are the child&apos;s
            parent or legal guardian.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Account Responsibility
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            You are responsible for maintaining the security of your account
            credentials and for all activity that occurs under your account. You
            must provide accurate information when creating your account and keep
            it up to date. You must notify us immediately if you believe your
            account has been compromised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Acceptable Use
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-3">
            You agree to use Readee only for its intended purpose — supporting
            children&apos;s reading education. You may not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600">
            <li>Use the Service for any unlawful purpose</li>
            <li>
              Attempt to gain unauthorized access to the Service or its systems
            </li>
            <li>
              Interfere with or disrupt the Service or other users&apos;
              experience
            </li>
            <li>
              Copy, reproduce, or distribute Readee content without permission
            </li>
            <li>
              Create accounts using false or misleading information
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Subscription Terms
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-3">
            Readee offers a free tier and a paid subscription (Readee+):
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600">
            <li>
              <strong>Free plan:</strong> Includes the diagnostic reading
              assessment, the first 2 lessons per level, 1 child profile, and
              basic progress tracking. No payment required.
            </li>
            <li>
              <strong>Readee+ ($9.99/month or $99/year):</strong> Includes the
              full lesson library, unlimited assessments, up to 5 child profiles,
              detailed parent reports, and additional features as they become
              available.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Cancellation Policy
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            You may cancel your Readee+ subscription at any time. Upon
            cancellation, you will retain access to paid features through the end
            of your current billing period. After that, your account will revert
            to the free plan. No refunds are provided for partial billing
            periods.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Intellectual Property
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            All content on Readee — including lessons, assessments, stories,
            illustrations, and software — is owned by Readee or its licensors
            and is protected by copyright and other intellectual property laws.
            You may not reproduce, distribute, modify, or create derivative
            works from our content without express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Limitation of Liability
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            The Service is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, either express or
            implied. Readee does not guarantee that the Service will be
            uninterrupted, error-free, or that it will meet your specific
            requirements. To the maximum extent permitted by law, Readee shall
            not be liable for any indirect, incidental, special, consequential,
            or punitive damages arising out of your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Changes to These Terms
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            We may update these Terms of Service from time to time. We will
            notify you of material changes by email or through a notice on our
            website. Your continued use of the Service after changes take effect
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Contact Us</h2>
          <p className="text-zinc-600 leading-relaxed">
            If you have questions about these Terms of Service, please contact us
            at{" "}
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
