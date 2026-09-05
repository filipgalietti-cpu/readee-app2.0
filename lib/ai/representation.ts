/**
 * One shared representation rule for every generator that writes people into
 * a passage: the daily, lessons, stories, personalized books.
 *
 * The reason is instructional before it is anything else. Children engage more
 * with text they can see themselves in, which is why "mirrors and windows" is
 * ordinary literacy practice rather than a position. A catalog where every
 * character defaults to the same background gives most of our readers only
 * windows.
 *
 * The whole trick is the second paragraph. A passage ABOUT identity is a
 * different (and worse) thing than a passage where a child happens to be named
 * Amara. The first announces itself and reads as a lesson; the second is just
 * a good story that more children recognise themselves in. If a reader can
 * tell we made a choice, we made it wrong.
 *
 * Keep this as ONE string so the rule can never drift between surfaces.
 */
export const REPRESENTATION_RULE = `REPRESENTATION (applies whenever the passage has people in it)
Draw names from a wide pool instead of defaulting to Anglo ones. Jamal, Mohammed, Kiera, Epitacio, Juan, Matteo, Olga, Priya, Amara, Wei, Sofia, Tunde, Nadia, Diego, Yusuf and Ingrid all belong in rotation alongside the familiar ones. Vary who holds which role across passages: the engineer, the scientist, the coach, the farmer and the expert are as often women as men, and come from as many backgrounds as the children reading them.

Carry every bit of this in incidental detail, never as the subject. A child repairing a bike whose mom is the engineer is a passage about repairing a bike. Do not write a passage about identity, difference, diversity or inclusion. Do not remark on any character's background, do not describe skin or heritage, and never explain the choice to the reader. If a name or a role is doing anything louder than sitting quietly inside the story, rewrite it.

THIS APPLIES TO INVENTED CHARACTERS ONLY. Real people and real historical events are reported exactly as they were, with no substitution of any kind. Never restyle a real person, never vary who was present at a real event, and never invent a participant. Accuracy is not in tension with the rule above: the way to widen a history passage is to choose a different true subject, never to alter a true one.`;
