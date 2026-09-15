import {kUnit1Oral} from './k-unit-1-oral';
import type {LessonDef} from '@/lib/lesson-engine/types';
import {sceneSpeech,collectSpeech} from '@/lib/lesson-engine/delivery/content';
import {spokenSentences} from '@/lib/lesson-engine/delivery/sentences';
import {kUnit1Probes} from './k-unit-1';
import {kUnit1Participation} from './k-unit-1-participation';
export const gardenMediaInventory:LessonDef={id:'k-unit-1-checkpoint-media',title:'The Story Garden — checkpoint media',grade:'Kindergarten',standard:'K-U1',archetype:'story-elements',objective:'Eight Unit 1 areas, including the approved Book Explorer scope. New supported transfer candidates awaiting educator review.',concepts:[],scenes:[...kUnit1Probes,...kUnit1Participation,...kUnit1Oral].flatMap(p=>p.tasks.map(t=>({...t.scene,id:t.id})))};
export const gardenWelcome='Welcome to the Story Garden! Listen for word sounds, explore stories, and look closely at letters and pictures. You can listen again and take your time. We will save your answers and look at them together at the end. Tap Let’s begin when you are ready.';
export const gardenDone='You explored the Story Garden! You listened, looked closely, and shared your ideas. Your carrots are ready!';
export const gardenPerfect='Every checked answer right on your first try! You earned three extra carrots.';
export const gardenLearned=['You explored sounds, letters, and print.','You found details in words and pictures.'];
export const gardenResponseFixtures={name:'M.',position:'Under the bench.',ask:'Will the boat sink?',feeling:'I felt happy.',why:'Because the boat floated.'};
const extras=['On the bench.','The letter is M.','Answer saved. Let’s try the next one.',gardenWelcome,gardenDone,gardenPerfect,...gardenLearned,...Object.values(gardenResponseFixtures),'Let’s learn this together.','Let’s try the next question.','We’ll try this again another time. Let’s keep going.','Listen to the story again.','You finished this question.'];
export const gardenTimingTexts=[...new Set([...gardenMediaInventory.scenes.flatMap(s=>[...sceneSpeech(s),...spokenSentences(s.context??'')]),...extras])];
export const gardenSpeech=collectSpeech([gardenMediaInventory],gardenTimingTexts);

// Bounded pronunciation alternatives for flagged clips; originals remain on disk.
const gardenClearVoice='Warm, clear, natural Autonoe reading-teacher voice. Read only the supplied words exactly once, at a natural pace. Keep every word and a clear beginning. No introduction, explanation, added words or stretched sounds. ';
export const gardenSpeechStyles:Record<string,string>={
 'A story.':gardenClearVoice+'Say exactly uh STORY. The first word is the indefinite article A, never The. This is a short answer label, not a title or an exclamation.',
 'In a pocket.':gardenClearVoice+'Begin with In, as in inside.',
 'Tess put it in a puddle.':gardenClearVoice+'The name Tess starts with the same sound as ten, not a K sound.',
 'Leon.':gardenClearVoice+'Leon is a person’s name, pronounced LEE-on. Say the name only.',
 'You named m.':gardenClearVoice+'The final printed m is the English letter name em, not him or a humming sound.',
 'M.':gardenClearVoice+'Say the English alphabet letter name em. It rhymes with them. Do not hum or say the letter sound.',
 'Its author is Eva.':gardenClearVoice+'The name Eva is pronounced EE-vuh.',
};
