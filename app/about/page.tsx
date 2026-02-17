export default function About() {
  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      {/* Hero */}
      <div className="text-center py-16 space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center text-4xl">
          📖
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
          About Readee
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Every child deserves to become a confident reader. Readee uses the
          Science of Reading — the most researched, proven approach to teaching
          kids how to read — to build a personalized learning path that actually
          works.
        </p>
      </div>

      {/* Our Approach */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Our Approach
          </h2>
          <p className="text-zinc-500 mt-1 text-sm font-medium">
            Grounded in the Science of Reading
          </p>
        </div>

        <p className="text-zinc-700 leading-relaxed">
          The Science of Reading isn&apos;t a trend — it&apos;s decades of
          research showing how children actually learn to read. Instead of
          guessing at words from pictures, kids build real skills step by step.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: "🔤",
              title: "Systematic Phonics",
              desc: "Learning the sounds letters make and how to blend them into words — the foundation of reading.",
            },
            {
              icon: "👂",
              title: "Phonemic Awareness",
              desc: "Hearing and playing with the individual sounds in words, like rhyming and segmenting.",
            },
            {
              icon: "📖",
              title: "Fluency",
              desc: "Reading smoothly and with expression so kids can focus on understanding, not just decoding.",
            },
            {
              icon: "💬",
              title: "Vocabulary",
              desc: "Building a rich word bank so new words in stories feel familiar and meaningful.",
            },
            {
              icon: "🧠",
              title: "Comprehension",
              desc: "Understanding what they read — finding main ideas, making connections, and thinking critically.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{item.icon}</span>
                <h3 className="font-semibold text-zinc-900 text-sm">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm text-zinc-500 leading-relaxed">
          Each Readee lesson weaves these pillars together so your child builds
          every skill they need — not just one at a time.
        </p>
      </section>

      {/* How It Works */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          How It Works
        </h2>

        <div className="space-y-5">
          {[
            {
              step: 1,
              title: "Quick Reading Assessment",
              desc: "A fun 10-question quiz finds your child's exact reading level — from Emerging Reader to Independent Reader. No pressure, just a starting point.",
            },
            {
              step: 2,
              title: "Personalized Lesson Path",
              desc: "Your child gets 5 lessons matched to their level. Each lesson has three parts: Learn new skills, Practice with questions, and Read a short story with comprehension checks.",
            },
            {
              step: 3,
              title: "Track Progress and Celebrate",
              desc: "Watch your child earn XP, complete lessons, and grow as a reader. You'll see exactly what they've learned and what's next.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who It's For */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Who It&apos;s For
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: "🎒",
              title: "Pre-K through 3rd Grade",
              desc: "Designed for the years when reading skills are built — ages 4 to 9.",
            },
            {
              icon: "💪",
              title: "Kids Who Struggle with Reading",
              desc: "Structured, systematic lessons that meet them where they are and build confidence.",
            },
            {
              icon: "📚",
              title: "Kids Who Need Extra Practice",
              desc: "A supplement to school that reinforces skills with engaging, bite-sized lessons.",
            },
            {
              icon: "🏠",
              title: "Homeschool Families",
              desc: "A complete reading curriculum your child can follow independently with your guidance.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-zinc-900 text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Ready to get started?
        </h2>
        <p className="text-zinc-500">
          Sign up for free and see where your child&apos;s reading journey
          begins.
        </p>
        <a
          href="/signup"
          className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
        >
          Get Started Free
        </a>
      </div>
    </div>
  );
}
