import type {ResponseVerdict} from './rubrics';
export const GARDEN_EXAM_ORAL_RUBRICS={
 'k1-exam-hat-place-v1':{version:1,stem:'Where did Mia put her hat?',source:'Mia put her hat on the bench.',acceptedReasons:['fact-detail'],criterion:'Objective spoken place identification. Accept bench or a natural whole answer locating the hat on the bench. Do not grade pronunciation. Negation and competing guesses are not accepted.'},
 'k1-exam-letter-m-v1':{version:1,stem:'Tell Luna this letter’s name.',source:'The displayed lowercase letter is m.',acceptedReasons:['letter-name'],criterion:'Objective spoken letter-name check. Accept the name M/em; another confidently recognized letter name is incorrect. A phoneme is not a letter name. No inferred whole-alphabet mastery.'},
} as const;
export function isGardenExamOral(id:string){return Object.hasOwn(GARDEN_EXAM_ORAL_RUBRICS,id);}
/** Full-utterance, server-owned grading. No model inference or substring acceptance.
 * Unmapped/ambiguous utterances remain unscored instead of guessing at intent. */
export function gardenExamOralVerdict(id:string,text:string):ResponseVerdict|null{
 if(!isGardenExamOral(id))return null;
 const t=text.trim().toLowerCase().replace(/[.!?]+$/g,'').replace(/\s+/g,' ');
 if(/\b(?:maybe|or|not|don't|dont|know|guess|ignore|correct|points|instructions)\b/.test(t))return {verdict:'unclear',reason:'unclear'};
 if(id==='k1-exam-letter-m-v1'){
  const answer=t.replace(/^(?:(?:it is|it's|its|that is|that's|this is) )?(?:(?:the|a) letter (?:is )?)?/,'');
  if(['m','em','emm'].includes(answer))return {verdict:'accepted',reason:'letter-name'};
  const otherNames=/^(?:[a-ln-z]|ay|bee|be|see|sea|dee|ee|ef|gee|aitch|eye|jay|kay|el|en|oh|pee|cue|queue|are|ar|ess|es|tee|you|vee|double u|ex|why|zee|zed|muh)$/;
  return otherNames.test(answer)?{verdict:'needs-help',reason:'contradiction'}:{verdict:'unclear',reason:'unclear'};
 }
 const place=t.replace(/^(?:mia|she) (?:put|puts|left) (?:her|the|a) hat /,'').replace(/^(?:(?:her|the) hat (?:is|was)|it (?:is|was)|it's) /,'');
 if(/^(?:on |on top of )?(?:a |the )?bench$/.test(place))return {verdict:'accepted',reason:'fact-detail'};
 if(/^(?:(?:on|in|under|beside|behind) )?(?:a |the |her )?(?:floor|table|tree|bed|chair|head|ground|grass|park|pocket)$/.test(place)||/^(?:under|beside|behind|next to) (?:a |the )?bench$/.test(place))return {verdict:'needs-help',reason:'contradiction'};
 return {verdict:'unclear',reason:'unclear'};
}
