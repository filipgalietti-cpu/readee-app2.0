"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LessonHeader } from "@/app/components/ui/LessonHeader";
import { ItemRenderer, ContentItem } from "@/app/components/practice/ItemRenderer";
import { Button } from "@/app/components/ui/Button";
import { Icon } from "@/app/components/ui/Icon";

interface LessonData {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; answer: string }>>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLessonData = useCallback(async () => {
    try {
      // Fetch lesson info
      const lessonsResponse = await fetch("/api/content/lessons");
      const lessonsData = await lessonsResponse.json();
      const currentLesson = lessonsData.lessons?.find((l: any) => l.id === lessonId);
      
      if (currentLesson) {
        setLesson(currentLesson);
      }

      // Fetch items for this lesson
      const itemsResponse = await fetch(`/api/content/items?lessonId=${lessonId}`);
      const itemsData = await itemsResponse.json();
      
      // Format items
      const formattedItems = (itemsData.items || []).map((item: any) => ({
        id: item.id,
        itemType: item.item_type,
        prompt: item.prompt,
        correctAnswer: item.correct_answer,
        options: item.options || [],
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const handleAnswer = async (correct: boolean, userAnswer: string) => {
    const newAnswers = [...answers, { correct, answer: userAnswer }];
    setAnswers(newAnswers);

    // Record this answer
    const currentItem = items[currentIndex];
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          itemId: currentItem.id,
          correct,
          response: userAnswer,
        }),
      });
    } catch (error) {
      console.error("Failed to record progress:", error);
    }

    // Move to next item or complete
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeLesson(newAnswers);
    }
  };

  const completeLesson = async (allAnswers: Array<{ correct: boolean; answer: string }>) => {
    const correctCount = allAnswers.filter((a) => a.correct).length;
    const score = Math.round((correctCount / allAnswers.length) * 100);

    try {
      await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          score,
          completed: true,
        }),
      });
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    }

    setIsComplete(true);
  };

  const handleExit = () => {
    router.push("/path");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="book" className="mx-auto mb-4 text-blue-500 animate-pulse" size={48} />
          <p className="text-zinc-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 mb-4">No items found for this lesson.</p>
          <Button onClick={handleExit}>Back to Path</Button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const correctCount = answers.filter((a) => a.correct).length;
    const score = Math.round((correctCount / answers.length) * 100);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <Icon name="trophy" className="mx-auto text-yellow-500" size={80} />
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Great Job!</h1>
          <p className="text-xl text-zinc-700 mb-2">You completed the lesson</p>
          <p className="text-5xl font-bold text-blue-600 mb-6">{score}%</p>
          <p className="text-zinc-600 mb-8">
            You got {correctCount} out of {answers.length} correct!
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleExit} variant="primary" size="lg">
              Continue Learning
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-zinc-50">
      <LessonHeader
        title={lesson.title}
        description={lesson.description}
        currentItem={currentIndex + 1}
        totalItems={items.length}
        onExit={handleExit}
      />

      <div className="container-page py-12">
        <ItemRenderer item={currentItem} onAnswer={handleAnswer} showFeedback={true} />
      </div>
    </div>
  );
}
