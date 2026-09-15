/** Closed vocabulary for isolated alphabet names, independent of the answer key.
 * Azure's sentence confidence is not a calibrated letter-name accuracy score.
 * This judges the recognized name, never pronunciation or whole-alphabet mastery.
 */
const aliases: Record<string, string> = {
 ay:'a',bee:'b',be:'b',see:'c',sea:'c',dee:'d',ee:'e',ef:'f',gee:'g',aitch:'h',
 eye:'i',jay:'j',kay:'k',el:'l',em:'m',emm:'m',en:'n',oh:'o',pee:'p',cue:'q',queue:'q',
 ar:'r',are:'r',ess:'s',es:'s',tee:'t',you:'u',vee:'v','double u':'w',ex:'x',why:'y',zee:'z',zed:'z',
};
export function isolatedLetterName(text: unknown): string | null {
 if(typeof text!=='string'||text.length>32)return null;
 const name=text.trim().toLowerCase().replace(/[.!?]+$/,'');
 return /^[a-z]$/.test(name)?name:aliases[name]??null;
}
export function isLetterNamingRubric(id:string){
 return ['k1-exam-letter-m-v1','lantern-name-b-v1','lantern-name-m-v1','lantern-name-s-v1'].includes(id);
}
export function usableIsolatedLetterName(text:unknown,confidence:unknown){
 return typeof confidence==='number'&&Number.isFinite(confidence)&&confidence>0&&confidence<=1&&isolatedLetterName(text)!==null;
}
