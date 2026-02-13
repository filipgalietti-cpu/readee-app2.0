import { Card, SectionHeader } from "@/app/_components";

export default function About() {
  return (
<div className="max-w-4xl mx-auto space-y-8 pb-12">
  <div className="text-center py-8">
    <div className="text-6xl mb-4">📚</div>
    <h1 className="text-4xl font-bold text-zinc-900 mb-4">About Readee</h1>
    <p className="text-lg text-zinc-600">
      Making reading fun and engaging for early learners
    </p>
  </div>

  <Card className="p-8">
    <SectionHeader title="Our Mission" />
    <div className="space-y-4 text-zinc-700">
      <p className="text-lg leading-relaxed">
        Readee is your child&apos;s personal reading companion, designed to help young readers
        (K-3) discover the joy of reading through interactive stories and engaging activities.
      </p>
    </div>
  </Card>
</div>
          </p>
          <p className="text-lg leading-relaxed">
            Inspired by successful learning platforms, we make reading practice feel like play. 
            Children earn rewards, build streaks, and unlock new stories as they progress through 
            their reading journey.
          </p>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="font-bold text-zinc-900 mb-2">Personalized</h3>
          <p className="text-sm text-zinc-600">
            Stories tailored to your child's interests and reading level
          </p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-5xl mb-3">🎮</div>
          <h3 className="font-bold text-zinc-900 mb-2">Engaging</h3>
          <p className="text-sm text-zinc-600">
            Fun rewards and progress tracking keep kids motivated
          </p>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-5xl mb-3">📈</div>
          <h3 className="font-bold text-zinc-900 mb-2">Progress Tracking</h3>
          <p className="text-sm text-zinc-600">
            Monitor reading time, streaks, and skill development
          </p>
        </Card>
      </div>

      <Card className="p-8 bg-emerald-50 border-emerald-200">
        <SectionHeader title="How It Works" />
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">Set Up Your Profile</h4>
              <p className="text-sm text-zinc-700">
                Choose your favorite color and interests to personalize your experience
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">Pick a Story</h4>
              <p className="text-sm text-zinc-700">
                Browse our library and choose stories that match your interests
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">Read and Earn</h4>
              <p className="text-sm text-zinc-700">
                Complete stories to earn XP, build your streak, and unlock achievements
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
