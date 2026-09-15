/** Supported spoken examples, not pronunciation or independent print decoding.
 * Unknown words and pronunciation variants remain uncertain, never incorrect.
 * Counts belong to the authored rubric; this parser owns no vocabulary.
 */
export function checkSyllableExample(text:string,task:{target:number;counts:Record<string,number>;reveals?:Record<string,string>}) {
 const normalized=text.trim().toLowerCase().replace(/[.!?,;:]+/g,' ').replace(/\s+/g,' ').trim();
 const correction=/^not [a-z]+ i mean ([a-z]+)$/.exec(normalized);
 const offered=correction?.[1]??/^(?:(?:my word is|the word is|i choose|i picked|i say|how about) )?([a-z]+)$/.exec(normalized)?.[1];
 const count=offered&&Object.prototype.hasOwnProperty.call(task.counts,offered)?task.counts[offered]:undefined;
 if(count===undefined)return {verdict:'unclear',reason:'unclear'} as const;
 return count===task.target?{verdict:'accepted',reason:'fact-detail',...(task.reveals?{evidenceKey:offered&&Object.hasOwn(task.reveals,offered)?task.reveals[offered]:'other'}:{})} as const:{verdict:'needs-help',reason:'contradiction'} as const;
}
