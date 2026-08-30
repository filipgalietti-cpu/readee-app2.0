import type { QuizDef, QuizQuestion } from "@/lib/lesson-engine/quiz";
import { factFinderBasicsQuiz } from "./fact-finder-basics-quiz";
import { whatsItAboutQuiz } from "./whats-it-about-quiz";
import { howTheyConnectQuiz } from "./how-they-connect-quiz";
import { scienceWordWonderQuiz } from "./science-word-wonder-quiz";
import { partsOfABookQuiz } from "./parts-of-a-book-quiz";
import { factBookMakersQuiz } from "./fact-book-makers-quiz";
import { diagramDetectivesQuiz } from "./diagram-detectives-quiz";
import { authorReasonsQuiz } from "./author-reasons-quiz";
import { twoBooksOneTopicQuiz } from "./two-books-one-topic-quiz";
import { factReadingPartyQuiz } from "./fact-reading-party-quiz";

/**
 * UNIT 4 EXAM — 12 hand-chosen questions from the Fact Finders quizzes
 * (every RI.K standard represented, mixed formats, speak closer, easy → hard).
 * ADAPTIVE OFF: fixed order, a measure not practice.
 * Selection is Filip+Jennifer's veto surface: swap any pick by id.
 */
function pick(quiz: QuizDef, id: string): QuizQuestion {
  const q = quiz.questions.find((x) => x.id === id);
  if (!q) throw new Error(`unit-4-exam: ${quiz.id} has no question ${id}`);
  return q;
}

export const unit4Exam: QuizDef = {
  id: "unit-4-exam",
  lessonId: "unit-4",
  title: "Unit 4 Exam",
  standard: "K-U4",
  askCount: 12,
  adaptive: false, // fixed order — this is a measure
  questions: [
    // warm openers
    pick(factFinderBasicsQuiz, "c-1"),                       // RI.K.1 key detail
    pick(whatsItAboutQuiz, "c-1-identify-main-topic"),       // RI.K.2 main topic
    pick(howTheyConnectQuiz, "c-puddles-appear-choose"),     // RI.K.3 connection
    pick(scienceWordWonderQuiz, "c-1-migrate-meaning"),      // RI.K.4 word meaning
    // middle: book anatomy + makers + pictures
    pick(partsOfABookQuiz, "c-q1"),                          // RI.K.5 book parts
    pick(factBookMakersQuiz, "c-identify-photo"),            // RI.K.6 photo vs drawing
    pick(diagramDetectivesQuiz, "c-1-ladybug-fly-part"),     // RI.K.7 words↔picture
    pick(authorReasonsQuiz, "c-2-sleep-cold-why"),           // RI.K.8 author's reason
    // applied: sorts (multi-item)
    pick(twoBooksOneTopicQuiz, "c-3"),                       // RI.K.9 both/only-one
    pick(authorReasonsQuiz, "c-5-match-point-reason"),       // RI.K.8 applied sort
    // stretch + production close
    pick(scienceWordWonderQuiz, "h-2-doze-transfer"),        // RI.K.4 next-grade transfer
    pick(factReadingPartyQuiz, "c-read-sentence"),           // RI.K.10 read aloud (speak)
  ],
};
