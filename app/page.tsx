import Link from "next/link";
import { Button } from "./components/ui/Button";
import { Icon } from "./components/ui/Icon";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card";

export default function Home() {
  const { profile } = useProfile();
  const accentColor = profile?.favoriteColorHex || '#10b981';

  return (
<div className="space-y-16 py-8">
  {/* Hero section */}
  <section className="text-center py-16">
    <h1 className="text-5xl font-bold text-zinc-900 mb-4">Welcome to Readee</h1>
    <p className="text-xl text-zinc-600 mb-8 max-w-2xl mx-auto">
      A comprehensive early reading platform with structured lessons, practice items, and decodable stories
    </p>
    <div className="flex gap-4 justify-center">
      <Link href="/path">
        <Button size="lg" className="gap-2">
          <Icon name="path" size={20} />
          Start Learning
        </Button>
      </Link>
      <Link href="/library">
        <Button size="lg" variant="outline" className="gap-2">
          <Icon name="book" size={20} />
          Browse Library
        </Button>
      </Link>
    </div>
  </section>

  {/* Features */}
  <section className="grid md:grid-cols-3 gap-6">
    <Card>
      <CardHeader>
        <div className="mb-4">
          <Icon name="path" className="text-zinc-700" size={40} />
        </div>
        <CardTitle>Learning Path</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-600">
          Follow a structured curriculum through units and lessons, building reading skills step by step
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="mb-4">
          <Icon name="lightning" className="text-zinc-700" size={40} />
        </div>
        <CardTitle>Practice Engine</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-600">
          Interactive practice with phoneme taps, word building, multiple choice, and comprehension questions
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="mb-4">
          <Icon name="book" className="text-zinc-700" size={40} />
        </div>
        <CardTitle>Story Library</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-600">
          Read decodable stories with word-by-word highlighting and audio support
        </p>
      </CardContent>
    </Card>
  </section>

  {/* How it works */}
  <section className="bg-zinc-50 rounded-2xl p-8">
    <h2 className="text-3xl font-bold text-zinc-900 mb-8 text-center">How It Works</h2>

    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold">
          1
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Start Your Journey</h3>
          <p className="text-zinc-600">
            Begin with the first unit on the learning path and complete lessons at your own pace
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold">
          2
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Practice & Learn</h3>
          <p className="text-zinc-600">
            Each lesson includes 5–8 practice items with immediate feedback and spaced repetition
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold">
          3
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Read Stories</h3>
          <p className="text-zinc-600">
            Unlock decodable stories as you progress and practice reading with word highlighting
          </p>
        </div>
      </div>
    </div>
  </section>
</div>
    </div>
  </section>

  {/* CTA */}
  <section className="text-center py-8">
    <h2 className="text-3xl font-bold text-zinc-900 mb-4">
      Ready to Begin?
    </h2>
    <p className="text-zinc-600 mb-6">
      Start your reading journey today
    </p>
    <Link href="/path">
      <Button size="lg" className="gap-2">
        <Icon name="star" size={20} />
        Go to Learning Path
      </Button>
    </Link>
  </section>
</div>
  );
}
