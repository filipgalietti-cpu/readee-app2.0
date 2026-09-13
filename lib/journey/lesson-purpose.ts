/** Short parent-facing descriptions of practice, not claims about assessment mastery. */
const FOUNDATIONS: Record<string, string> = {
  'RF.K.1a': 'Follow words across a page.',
  'RF.K.1b': 'Connect spoken words to print.',
  'RF.K.1c': 'Notice spaces between words.',
  'RF.K.1d': 'Recognize and name letters.',
  'RF.K.2a': 'Hear and make words that rhyme.',
  'RF.K.2b': 'Hear the syllables in words.',
  'RF.K.2c': 'Blend word beginnings and endings.',
  'RF.K.2d': 'Hear each sound in a short word.',
  'RF.K.2e': 'Change a sound to make a new word.',
  'RF.K.3a': 'Connect consonants to their sounds.',
  'RF.K.3b': 'Connect vowels to their sounds.',
  'RF.K.3c': 'Recognize frequently used words.',
  'RF.K.3d': 'Spot sounds that change a word.',
  'RF.1.1a': 'Notice how a sentence is written.',
  'RF.1.2b': 'Blend sounds into spoken words.',
  'RF.1.2c': 'Hear each sound in a short word.',
  'RF.1.2d': 'Break spoken words into sounds.',
  'RF.1.3a': 'Read letters that make one sound.',
  'RF.1.3b': 'Sound out one-syllable words.',
  'RF.1.3c': 'Read long-vowel spelling patterns.',
  'RF.1.3d': 'Find vowel sounds in syllables.',
  'RF.1.3e': 'Break longer words into syllables.',
  'RF.1.3f': 'Read words with added endings.',
  'RF.1.3g': 'Practice words with unusual spellings.',
  'RF.2.3a': 'Read short and long vowel sounds.',
  'RF.2.3b': 'Read common vowel teams.',
  'RF.2.3c': 'Read two-syllable, long-vowel words.',
  'RF.2.3d': 'Read words with prefixes and suffixes.',
  'RF.2.3e': 'Practice tricky spelling patterns.',
  'RF.2.3f': 'Practice words with unusual spellings.',
  'RF.3.3a': 'Explore prefixes and suffixes.',
  'RF.3.3b': 'Read words with Latin suffixes.',
  'RF.3.3c': 'Break longer words into syllables.',
  'RF.3.3d': 'Practice words with unusual spellings.',
  'RF.4.3a': 'Use sounds and word parts to decode.',
};
const TEXT_SKILLS: Record<string, string> = {
  'RL.1': 'Use story details to answer questions.',
  'RL.2': 'Retell and make sense of a story.',
  'RL.3': 'Explore characters and story events.',
  'RL.4': 'Explore what words mean in a story.',
  'RL.5': 'Explore different kinds of writing.',
  'RL.6': 'Explore who tells or creates a story.',
  'RL.7': 'Connect pictures and story details.',
  'RL.9': 'Compare stories and their characters.',
  'RL.10': 'Read and understand a range of stories.',
  'RI.1': 'Use facts to answer questions.',
  'RI.2': 'Find the topic and important details.',
  'RI.3': 'Connect ideas in factual texts.',
  'RI.4': 'Explore words in factual texts.',
  'RI.5': 'Use features that organize a text.',
  'RI.6': 'Explore how information is presented.',
  'RI.7': 'Connect images and information.',
  'RI.8': 'Find reasons that support an idea.',
  'RI.9': 'Compare information across texts.',
  'RI.10': 'Read and understand factual texts.',
  'L.1': 'Build clear words and sentences.',
  'L.2': 'Practice spelling and punctuation.',
  'L.3': 'Explore how language conveys meaning.',
  'L.4': 'Work out unfamiliar word meanings.',
  'L.5': 'Explore connections between words.',
  'L.6': 'Build vocabulary for reading and talking.',
};
export function lessonPurpose(id: string): string {
  if (FOUNDATIONS[id]) return FOUNDATIONS[id];
  const [domain, , skill] = id.split('.');
  if (domain === 'RF') {
    if (skill?.endsWith('b') && skill.startsWith('4')) return 'Read aloud with accuracy and expression.';
    if (skill?.endsWith('c') && skill.startsWith('4')) return 'Reread and check that words make sense.';
    return skill?.startsWith('4') ? 'Read connected text for meaning.' : 'Use spelling patterns to read words.';
  }
  return TEXT_SKILLS[`${domain}.${skill?.match(/^\d+/)?.[0]}`] ?? 'Practice reading and understanding text.';
}
