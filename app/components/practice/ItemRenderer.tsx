"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export type ItemType = "phoneme-tap" | "word-build" | "multiple-choice" | "comprehension";

export interface ContentItem {
  id: string;
  itemType: ItemType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

interface ItemRendererProps {
  item: ContentItem;
  onAnswer: (correct: boolean, userAnswer: string) => void;
  showFeedback?: boolean;
}

export function ItemRenderer({ item, onAnswer, showFeedback = true }: ItemRendererProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = (answer: string) => {
    const correct = answer.toLowerCase().trim() === item.correctAnswer.toLowerCase().trim();
    setSelectedAnswer(answer);
    setHasSubmitted(true);
    setIsCorrect(correct);
    
    if (showFeedback) {
      // Show feedback for 1.5 seconds before calling onAnswer
      setTimeout(() => {
        onAnswer(correct, answer);
        // Reset for next item
        setSelectedAnswer(null);
        setHasSubmitted(false);
        setIsCorrect(null);
      }, 1500);
    } else {
      onAnswer(correct, answer);
    }
  };

  const renderPhonemeTap = () => (
    <div className="text-center">
      <p className="text-lg mb-6">{item.prompt}</p>
      <div className="flex justify-center gap-4">
        {item.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleSubmit(option)}
            disabled={hasSubmitted}
            className="w-20 h-20 rounded-full bg-blue-500 text-white text-2xl font-bold hover:bg-blue-600 active:scale-95 transition disabled:opacity-50"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderWordBuild = () => (
    <div className="text-center">
      <p className="text-lg mb-6">{item.prompt}</p>
      <div className="flex justify-center gap-3 flex-wrap">
        {item.options?.map((option) => (
          <Button
            key={option}
            onClick={() => handleSubmit(option)}
            disabled={hasSubmitted}
            size="lg"
            className="min-w-[80px]"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderMultipleChoice = () => (
    <div>
      <p className="text-lg mb-6 text-center">{item.prompt}</p>
      <div className="grid gap-3 max-w-md mx-auto">
        {item.options?.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmit(option)}
            disabled={hasSubmitted}
            className={`p-4 rounded-xl border-2 text-left transition ${
              hasSubmitted && option === selectedAnswer
                ? isCorrect
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
                : "border-zinc-200 hover:border-zinc-400"
            } disabled:cursor-not-allowed`}
          >
            <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderComprehension = () => renderMultipleChoice();

  const renderContent = () => {
    switch (item.itemType) {
      case "phoneme-tap":
        return renderPhonemeTap();
      case "word-build":
        return renderWordBuild();
      case "multiple-choice":
        return renderMultipleChoice();
      case "comprehension":
        return renderComprehension();
      default:
        return <p>Unknown item type</p>;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      {renderContent()}
      
      {/* Feedback overlay */}
      {hasSubmitted && showFeedback && (
        <div className="mt-6 text-center">
          {isCorrect ? (
            <div className="text-green-600 font-semibold text-lg">
              ✓ Correct! Great job!
            </div>
          ) : (
            <div className="text-red-600 font-semibold text-lg">
              ✗ Not quite. The answer is: {item.correctAnswer}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
