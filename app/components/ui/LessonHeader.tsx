import React from "react";
import { ProgressBar } from "./ProgressBar";

interface LessonHeaderProps {
  title: string;
  description?: string;
  currentItem: number;
  totalItems: number;
  onExit?: () => void;
}

export function LessonHeader({
  title,
  description,
  currentItem,
  totalItems,
  onExit,
}: LessonHeaderProps) {
  return (
    <div className="bg-white border-b border-zinc-200 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
            {description && <p className="text-sm text-zinc-600 mt-1">{description}</p>}
          </div>
          {onExit && (
            <button
              onClick={onExit}
              className="text-zinc-600 hover:text-zinc-900 transition"
              aria-label="Exit lesson"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <ProgressBar current={currentItem} total={totalItems} showLabel={false} />
      </div>
    </div>
  );
}
