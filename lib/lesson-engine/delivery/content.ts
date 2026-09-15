import {highlightWords,highlightTargetIndices} from "./highlight";
import type { LessonDef, SceneDef } from "../types";
import type { QuizDef } from "../quiz";
import { repairedPrintPage, printPageText } from "./print-page";
import { referencePageSpeech } from "./reference-page";
/** Adapt the existing quiz contract. Content remains authored in the quiz pool. */
export function quizScenes(quiz: QuizDef): SceneDef[] {
  if (quiz.adaptive)
    throw new Error("The coached fixed-order adapter cannot replace the adaptive quiz picker.");
  return quiz.questions.slice(0, quiz.askCount).map((q) => ({
    id: q.id,
    purpose: "challenge",
    skill: quiz.standard,
    evidence: "assessed",
    prompt: q.prompt,
    narration: q.narration,
    interaction: q.interaction,
    gate: "interaction",
    feedback: {
      correct: q.explain?.script ?? "",
      hint: q.hint?.script ?? "",
      incorrect:
        q.interaction.type === "choose"
          ? (q.interaction.coachWrong ?? q.explain?.script ?? "")
          : (q.hint?.script ?? ""),
    },
  }));
}
/** Every instructional string is inventoried from the same source as rendering. */
export function sceneSpeech(scene: SceneDef): string[] {
  const i = scene.interaction;
  return [
    scene.prompt,
    scene.context,
    ...referencePageSpeech(scene.referencePage),
    scene.narration?.script,
    scene.feedback?.correct,
    scene.feedback?.hint,
    scene.feedback?.incorrect,
    ...Object.values(scene.feedback?.byChoice ?? {}),
    ...(i?.type === "transform"
      ? (i.states?.flatMap((s) => [
          s.label,
          s.text,
          s.script,
          s.context,
          s.before,
          s.actionLabel,
        ]) ?? [])
      : []),
    ...(i?.type === "choose"
      ? [
          // Native pages replay connected text; only accepted multi-answer labels
          // are spoken separately (for example Space). Do not buy unused word clips.
          ...(i.printPage ? i.options.filter(o => i.acceptedIds?.includes(o.id)) : i.options).map((o) => o.spoken ?? o.label),
          i.success?.sentence,
          i.collectAll?.progressScript,
          ...(i.printPage ? [i.printPage.lines.flat().join(" ")] : []),
          ...(i.printPage && i.printRepair ? [printPageText(repairedPrintPage(i.printPage,i.printRepair))] : []),
        ]
      : []),
    ...(i?.type === "highlight" ? [i.text,i.result,i.success?.sentence,...highlightTargetIndices(i).map(index=>highlightWords(i,new Set([index]))[index])] : []),
    ...(i?.type === "match"
      ? [...i.pairs.flatMap((p) => [i.spoken?.[p.left] ?? p.left, i.spoken?.[p.right] ?? p.right]), i.success?.sentence]
      : []),
    ...(i?.type === "sequence"
      ? [
          i.result,
          ...(i.resultParts?.map((p) => p.text) ?? []),
          ...i.items.map((o) => o.spoken ?? o.label),
        ]
      : []),
    ...(i?.type === "sort"
      ? [...i.buckets, ...i.items.flatMap((o) => [o.spoken ?? o.label, o.explanation])]
      : []),
    ...(i?.type === "speak"
      ? [
          i.unclearScript,
          i.unavailableScript,
          ...(i.rhymeSeries?.nextPrompts ?? []),
          i.rhymeSeries?.duplicateScript,
          i.rhymeSeries?.targetRepeatScript,
          i.rhymeSeries?.completeScript,
          i.confirmationScript,
          ...Object.values(i.confirmationReadbacks ?? {}),
          i.success?.sentence,
          ...Object.values(i.responseReveals ?? {}).map((r) => r.sentence),
          ...(i.reflection
            ? [
                ...Object.values(i.reflection.acknowledgments ?? {}),
                i.reflection.followUp.prompt,
                i.reflection.followUp.invitation,
                i.reflection.followUp.thanks,
                i.reflection.followUp.hint,
              ]
            : []),
        ]
      : []),
    ...(i?.type === "speak" || i?.type === "read-along" ? [i.text] : []),
    ...(i?.type === "read-along" ? (i.pages?.map((p) => p.text) ?? []) : []),
  ].filter((s): s is string => !!s);
}
export function collectSpeech(lessons: LessonDef[], extra: string[] = []) {
  return [...new Set([...lessons.flatMap((l) => l.scenes.flatMap(sceneSpeech)), ...extra])];
}
