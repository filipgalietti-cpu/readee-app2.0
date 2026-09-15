import {isGardenExamOral} from '../response/garden-exam-oral';
import {highlightErrors} from "./highlight";
import { printPageErrors, printPagePositions } from "./print-page";
import { isResponseRubricId } from "../response/rubrics";
import type { LessonDef } from "../types";
import { referencePageErrors } from "./reference-page";
/** Fail closed on unsupported presentation features instead of silently dropping instruction. */
export function validateCoachedLesson(lesson: LessonDef): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const s of lesson.scenes) {
    const at = `${lesson.id}/${s.id}`;
    if (ids.has(s.id)) errors.push(`${at}: duplicate scene id`);
    ids.add(s.id);
    if (!s.prompt.trim() || !s.narration?.script.trim())
      errors.push(`${at}: prompt and spoken instruction required`);
    if (s.narration && !s.narration.script.toLowerCase().includes(s.prompt.toLowerCase()))
      errors.push(`${at}: spoken instruction must include displayed prompt`);
    const i = s.interaction;
    if (s.referencePage) {
      errors.push(...referencePageErrors(s.referencePage).map(error => `${at}: ${error}`));
      if (s.context || s.image || s.visual || s.diagram || s.fx)
        errors.push(`${at}: reference page must be the single visible source`);
      if ((i?.type === "speak" && i.mode === "read") || (i?.type === "choose" && i.printPage))
        errors.push(`${at}: narrated reference page cannot precede an independent print-reading task`);
    }
    if (!i) {
      if (s.gate === "interaction") errors.push(`${at}: blocked gate without interaction`);
      continue;
    }
    if (!["choose", "sort", "sequence", "transform", "speak", "read-along", "match", "highlight"].includes(i.type))
      errors.push(`${at}: interaction needs coached adapter before publication`);
    if (i.type === "highlight") errors.push(...highlightErrors(i).map(error=>`${at}: ${error}`));
    if (i.type === "read-along") {
      if (s.evidence !== "demonstration")
        errors.push(`${at}: listening is participation, not reading evidence`);
      if (
        i.pages &&
        (i.pages.length === 0 ||
          i.pages.some((p) => !p.text.trim()) ||
          i.pages.map((p) => p.text).join(" ") !== i.text)
      )
        errors.push(`${at}: story pages must preserve the authored passage`);
    }
    if (i.type === "match" && (i.pairs.length < 2 || new Set(i.pairs.map(p => p.left)).size !== i.pairs.length || new Set(i.pairs.map(p => p.right)).size !== i.pairs.length || i.pairs.some(p => !p.left.trim() || !p.right.trim()))) errors.push(`${at}: invalid matching pairs`);
    if (i.type === "match" && i.replayHelpLabels?.some(label => !i.pairs.some(p => p.left === label || p.right === label))) errors.push(`${at}: replay help label must name a matching card`);
    if (i.type === "choose") {
      const optionIds = i.options.map((o) => o.id);
      if (i.collectAll && (!i.printPage || i.collectAll.ids.length < 2 || new Set(i.collectAll.ids).size !== i.collectAll.ids.length || !i.collectAll.ids.every(id => optionIds.includes(id)) || !i.collectAll.progressScript.trim() || !i.collectAll.ids.includes(i.correctId)))
        errors.push(`${at}: collectAll needs distinct printed positions and voiced progress`);
      if(i.printPage) {
        errors.push(...printPageErrors(i.printPage).map(error=>`${at}: ${error}`));
        const expected=printPagePositions(i.printPage);
        if(expected.length!==i.options.length||expected.some((p,n)=>p.id!==i.options[n]?.id||p.label!==i.options[n]?.label))
          errors.push(`${at}: print options must match actual page positions in reading order`);
        if(i.mode==="reflection")errors.push(`${at}: print-position questions cannot be subjective reflections`);
      }
      if(i.printRepair) {
        const target=i.printPage && printPagePositions(i.printPage).find(p=>p.id===i.printRepair!.positionId && p.kind==="word");
        if(!target || i.correctId!==target.id || i.acceptedIds || i.success ||
          target.label===i.printRepair.replacement || target.label.toLowerCase()!==i.printRepair.replacement.toLowerCase())
          errors.push(`${at}: print repair must change only the case of the single correct page position, without a competing success reveal`);
      }
      if (i.mode === "reflection" && (s.evidence !== "practice" || !optionIds.every(id => i.acceptedIds?.includes(id))))
        errors.push(`${at}: reflection must accept every choice and remain unassessed practice`);
      if (new Set(optionIds).size !== optionIds.length) errors.push(`${at}: duplicate option ids`);
      if (!(i.acceptedIds ?? [i.correctId]).every((id) => optionIds.includes(id)))
        errors.push(`${at}: answer missing from options`);
      if (i.options.length < 2) errors.push(`${at}: insufficient options`);
      if (s.evidence === "assessed" && i.options.length < 3)
        errors.push(`${at}: pilot exit item requires three diagnostic options`);
    }
    if (
      i.type === "sequence" &&
      (i.order.length !== i.items.length ||
        new Set(i.order).size !== i.order.length ||
        i.order.some((id) => !i.items.some((item) => item.id === id)))
    )
      errors.push(`${at}: impossible sequence`);
    if (
      i.type === "sort" &&
      (!i.items.length || i.items.some((item) => !i.buckets.includes(item.bucket)))
    )
      errors.push(`${at}: invalid sort key`);
    if (i.type === "transform" && i.states?.some(state => state.visual && Object.keys(state.visual).length) && !s.visual)
      errors.push(`${at}: state visual updates require an initial scene visual renderer`);
    if (
      i.type === "transform" &&
      (i.control !== "toggle" ||
        !i.states?.length ||
        new Set(i.states.map((s) => s.id)).size !== i.states.length ||
        s.evidence !== "demonstration")
    )
      errors.push(`${at}: coached transform must be an unscored controlled demonstration`);
    if(i.type === "speak" && i.captureMode && (i.mode !== "respond" || i.reflection))
      errors.push(`${at}: single-utterance capture is only for a short response, not reading or reflection`);
    if(i.type === "speak" && i.rhymeSeries && (i.mode !== "respond" || i.reflection || !Number.isInteger(i.rhymeSeries.count) || i.rhymeSeries.count<2 || i.rhymeSeries.count>5 || i.rhymeSeries.nextPrompts.length!==i.rhymeSeries.count-1 || i.rhymeSeries.nextPrompts.some(text=>!text.trim()) || !i.rhymeSeries.duplicateScript.trim() || !i.rhymeSeries.completeScript.trim() || !i.rhymeSeries.target.trim()))
      errors.push(`${at}: rhyme collection needs 2–5 words, complete voiced prompts, and a supported response`);
    if (i.type === "speak" && i.reflection && (!isResponseRubricId(i.reflection.followUp.rubricId) || !i.reflection.followUp.prompt.trim() || !i.reflection.followUp.invitation.trim()))
      errors.push(`${at}: reflection follow-up requires a known rubric and voiced prompt`);
    if (i.type === "speak" && ((i.mode !== "read" && !(i.mode === "respond" && isResponseRubricId(i.rubricId) && (s.evidence === "practice" || (s.evidence === "assessed" && isGardenExamOral(i.rubricId!))) && !!i.unclearScript)) || !i.text.trim()))
      errors.push(`${at}: open-ended speech requires a validated rubric`);
    if (
      s.evidence !== "demonstration" &&
      (!s.feedback?.correct || !s.feedback?.hint || !s.feedback?.incorrect)
    )
      errors.push(`${at}: authored feedback required`);
  }
  return errors;
}
