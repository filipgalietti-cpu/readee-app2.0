import type { SceneDef } from "../types";
import { referencePageSpeech } from "./reference-page";
/** Opt-in narration uses the exact displayed choice order and existing clips.
 * Printed-page/name recognition tasks must not receive answer-revealing narration.
 */
export function sceneNarrationTexts(scene: SceneDef): string[] {
  const parts = [...(scene.referencePage?.autoRead === false ? [] : referencePageSpeech(scene.referencePage)), scene.narration?.script ?? scene.prompt];
  const interaction = scene.interaction;
  if (
    interaction?.type === "choose" &&
    interaction.autoReadChoices &&
    !interaction.printPage &&
    !interaction.replayIsHelp
  )
    parts.push(...interaction.options.map((option) => option.spoken ?? option.label));
  return parts;
}
export function narrateScene(scene: SceneDef, say: (text: string, after?: () => void, choiceId?: string) => void) {
  const parts = sceneNarrationTexts(scene);
  const firstChoice = (scene.referencePage?.autoRead === false ? 0 : referencePageSpeech(scene.referencePage).length) + 1;
  // useLessonVoice owns interruption, stale-ended protection and failure handling.
  const play = (index: number) => {
    if (index < parts.length) say(parts[index], () => play(index + 1),
      index >= firstChoice && scene.interaction?.type === "choose"
        ? scene.interaction.options[index - firstChoice]?.id : undefined);
  };
  play(0);
}
