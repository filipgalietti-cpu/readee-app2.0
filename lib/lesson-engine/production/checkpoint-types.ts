import type {RecordedUnit} from '@/lib/lesson-engine/delivery/recorded-speech';
import type { SceneDef } from '@/lib/lesson-engine/types';
import type { AdaptiveItem } from '@/lib/lesson-engine/production/adaptive';

/** A reserved probe can contain a reading and its meaning question. They share
 * exposure and are selected together; they are not independent new passages. */
export type CheckpointProbe = AdaptiveItem & {
  sourceLesson: string;
  sourceFile: string;
  sourceStandardUrl: string;
  sourceStatus: 'new-transfer-awaiting-educator';
  exposureKey: string;
  /** Additional atomic stimuli in a comparison or compound packet. */
  relatedExposureKeys?: string[];
  stimulusTexts: string[];
  scope: string;
  support: string;
  tasks: { id: string; dimension: 'sound-print' | 'reading-accuracy' | 'meaning' | 'conventions' | 'participation'; scene: SceneDef }[];
};

/** Content/configuration for one checkpoint. The renderer owns no curriculum words. */
export type CheckpointDefinition = {
  id: string;
  exam?: { autoAdvance?: boolean; acknowledgement?: string };
  title: string;
  assetRoot: string;
  scoredStandards: readonly string[];
  probes: CheckpointProbe[];
  participation: CheckpointProbe[];
  /** Additional objective questions appended after the coverage pass and included in exam scoring. */
  scoredClosing?: CheckpointProbe[];
  defaultParticipation: string | null;
  welcome: string;
  completion: string;
  perfectCompletion: string;
  learned: string[];
  coverAlt: string;
  ambience: {file: string; label: string; volume: number; duckVolume: number};
  background: string;
  questionTopic: string;
  recordedSpeech?: {units:Record<string,RecordedUnit>;texts:readonly string[]};
};
