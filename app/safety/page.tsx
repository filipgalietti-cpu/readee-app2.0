import type { Metadata } from "next";
import BackButton from "@/app/_components/BackButton";

export const metadata: Metadata = {
  title: "Safety Policy",
  description:
    "The specific measures Readee takes to keep children safe when they create and share their own stories.",
};

export default function SafetyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
        Safety Policy
      </h1>
      <p className="text-sm text-zinc-400 mb-8">Last updated: August 2026</p>

      <div className="prose prose-zinc max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Introduction</h2>
          <p className="text-zinc-600 leading-relaxed">
            Readee lets children create their own stories with Luna, our reading
            assistant, and share them with other children. This Safety Policy
            explains the specific measures we take to keep children safe when
            they create and share content. A certified reading teacher helped
            design these rules, and no child-created story is ever shown to
            another child before it is reviewed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Every Story Is Reviewed Before It Is Published
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-3">
            Every story a child creates passes three checks, in order, before
            another child can see it:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600">
            <li>
              <strong>Idea screening:</strong> Before any story is written, an
              automated safety check reviews the child&apos;s prompt. Ideas that
              are unkind, violent, scary, hateful, sexual, or about sensitive
              real-world topics are blocked and are never turned into a story.
            </li>
            <li>
              <strong>Content screening:</strong> The finished story and its
              illustration are automatically checked for age-appropriate,
              family-friendly content, and scanned to make sure no names,
              locations, or personal details are included.
            </li>
            <li>
              <strong>Human review:</strong> No child-created story is published
              automatically. A member of the Readee team reviews and approves
              every story before it becomes visible to other children. Anything
              that does not meet our bar is never made public.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            No Contact Between Children
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Readee is not a social network. Children cannot message, comment on,
            follow, or contact one another in any way. Publishing is
            one-directional: a child shares a story to a read-only library. There
            are no chats, direct messages, friend requests, or public profiles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Minimal Personal Information
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            A published story displays only a first name and a cartoon avatar. We
            never display last names, photographs, ages, locations, or any
            information that could be used to identify or locate a child in the
            real world.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Parental Control
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Every child account belongs to a parent or guardian. Parents can
            review everything their child has created and can request removal of
            any published story at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Reporting and Takedown
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Every published story includes a way to report it. Reported content
            is flagged for the Readee team for review and can be removed
            promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            COPPA and Data Minimization
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            Readee serves children under 13 and complies with the
            Children&apos;s Online Privacy Protection Act (COPPA). We require a
            parent or guardian account before any child can create content, we
            collect as little information as possible, and when content is
            uncertain, we keep it private. For details on how we handle data, see
            our{" "}
            <a
              href="/privacy-policy"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-zinc-900 mb-3">Contact Us</h2>
          <p className="text-zinc-600 leading-relaxed">
            If you have questions or concerns about safety, please contact us at{" "}
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
