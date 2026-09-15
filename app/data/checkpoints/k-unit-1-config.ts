import {kUnit1Oral} from './k-unit-1-oral';
import type {CheckpointDefinition} from '@/lib/lesson-engine/production/checkpoint-types';
import {kUnit1Probes,kUnit1ScoredStandards} from './k-unit-1';
import {gardenWelcome,gardenDone,gardenPerfect,gardenLearned} from './k-unit-1-media';
export const kUnit1Checkpoint:CheckpointDefinition={id:'k-unit-1-checkpoint-v2',exam:{autoAdvance:true},title:'The Story Garden',assetRoot:'/lesson-studio/k-unit-1-checkpoint',scoredStandards:kUnit1ScoredStandards,probes:kUnit1Probes,participation:[],scoredClosing:kUnit1Oral,defaultParticipation:null,welcome:gardenWelcome,completion:gardenDone,perfectCompletion:gardenPerfect,learned:gardenLearned,coverAlt:'A painted garden reading nook with a small story tent and books beside a shallow puddle.',ambience:{file:'garden.mp3',label:'Garden birds',volume:.3,duckVolume:.06},background:'#f1eddf',questionTopic:'story'};
