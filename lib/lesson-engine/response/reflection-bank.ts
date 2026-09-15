import {G1U5_STORY} from "./g1-unit5-checkpoint-rubrics";
import {BEACON_TEXT} from "./beacon-rubrics";
import {COVE_LESSON} from "./cove-rubrics";
import {OLLIE_STORY} from "./ollie-rubrics";
import { WREN_STORY } from "./wren-rubrics";
import {TICKET_LESSON} from "./ticket-rubrics";
import {POSTCARD_LESSON} from "./postcard-rubrics";
import {RAINY_LESSON} from "./rainy-rubrics";
import {HELPER_BOOK} from "./helper-rubrics";
import {GIRAFFE_BOOK} from "./giraffe-rubrics";
import {KEEPSAKE_STORY} from "./keepsake-rubrics";
/** Server evaluator reference, not an exact-match whitelist or a record of children.
 * Human-authored story is the context. Examples/coaching are educator-review drafts.
 * Keep this module out of client imports. Subjective responses never measure mastery.
 */
const HOUSES_REFLECTION_BANK = {
  'houses-feelings-v1': {
    standard: 'SL.K.6',
    source: 'The wolf blows down the straw and stick houses. The pigs escape to the brick house. The wolf cannot blow it down. The pigs are safe.',
    prompt: 'How did this story make you feel?',
    examples: {
      happy: ['happy', 'It made me smile', 'I liked it', 'glad the pigs were okay'],
      sad: ['sad', 'I felt bad for the pigs', 'I did not like their houses falling down'],
      worried: ['worried', 'a little scared', 'nervous about the wolf', 'afraid'],
      excited: ['excited', 'I wanted to know what happened next'],
      other: ['relieved', 'calm', 'angry at the wolf', 'surprised', 'bored', 'not happy', 'happy and scared', 'I did not feel anything'],
    },
    criterion: 'Accept any intelligible personal feeling, preference, mixed feeling, or absence of strong feeling about the story. Short answers and imperfect grammar are fine. The examples are illustrative, NEVER a closed vocabulary. No emotion is wrong and the story ending does not require happiness. An unqualified feeling word is a personal answer in this conversational context. A statement ONLY about a character feeling (The pigs felt safe) is incomplete for THIS prompt; invite the child to tell their own feeling. A feeling plus a reason is already elaborated. Set elaborated true only when they supply a reason, not merely a feeling phrase. Return feeling happy/sad/worried/excited only if a single compatible emotion is clear; use other for mixed, negated, different, or neutral reactions. Never pick happy for not happy. If the child states a feeling but mentions an inaccurate story detail, accept their feeling; do not score their comprehension here. I do not know is uncertainty, not a wrong feeling. Clearly unrelated non-feeling speech is incomplete. Do not infer unstated emotions.',
  },
  'houses-feelings-why-v1': {
    standard: 'SL.K.6',
    source: 'The wolf blows down the straw and stick houses. The pigs escape to the brick house. The wolf cannot blow it down. The pigs are safe.',
    prompt: 'What in the story made you feel that way?',
    examples: ['because the pigs got away', 'the wolf was mean', 'their houses broke', 'they were safe', 'I like pigs', 'it reminded me of my home', 'I did not like the wolf', 'the ending'],
    criterion: 'This is an optional invitation to add a personal reason, NOT a right/wrong story-detail test. Accept a brief story event, character, preference, association, or explanation connected to the story. Developmentally imperfect grammar and incomplete sentences are fine. Do not require because or repeat the feeling. A feeling word alone repeats the first answer without adding a reason: needs-help/incomplete. I do not know or I do not want to say means unclear, with no penalty. Do not grade whether the emotion is justified. No inference from private child history. Return accepted/explanation for a relevant reason. Never invent child-facing feedback.',
  },
} as const;

export const REFLECTION_BANK = {
  'g1u5-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:G1U5_STORY,criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Sol felt happy')},
  'g1u5-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:G1U5_STORY,examples:['Because Ada helped her friend','I drop my things too','I did not like dropping the notebook']},
  'beacon-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:BEACON_TEXT,examples:{happy:['happy'],sad:['sad'],worried:['worried'],excited:['excited'],other:['curious','bored','nothing','calm']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The keeper felt happy')},
  'beacon-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:BEACON_TEXT,examples:['I want to see a lighthouse','I liked the boats','I did not like reading so much']},
  'cove-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:COVE_LESSON,examples:{happy:['happy'],sad:['sad'],worried:['worried'],excited:['excited'],other:['curious','bored','nothing','calm']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The otters felt happy')},
  'cove-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:COVE_LESSON,examples:['I want to see a sea otter','I liked the pups','the tools were interesting','I did not like reading so much']},
  'ollie-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:OLLIE_STORY,examples:{happy:['happy'],sad:['sad'],worried:['worried'],excited:['excited'],other:['bored','nothing','calm','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Ollie felt happy')},
  'ollie-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:OLLIE_STORY,examples:['Fern helped Ollie','I am scared of the dark too','I like the moon','I wanted more story','I liked the sounds in the poem']},
  'wren-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:WREN_STORY,examples:{happy:['happy'],sad:['sad'],worried:['worried about the frog'],excited:['excited'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Wren felt happy')},
  'wren-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:WREN_STORY,examples:['the frog jumped out','I like frogs','I was worried about the frog','it reminded me of Grandpa','I wanted another ending']},
 'ticket-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:TICKET_LESSON,prompt:'How did this lesson make you feel?',examples:{happy:['happy','I liked reading the word tickets'],sad:['sad'],worried:['worried'],excited:['excited'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replaceAll('story','lesson').replace('The pigs felt safe','The child felt happy')},
 'ticket-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:TICKET_LESSON,prompt:'What in the lesson made you feel that way?',examples:['I liked reading the word tickets','I liked catching the tickets','the spelling was tricky'],criterion:HOUSES_REFLECTION_BANK['houses-feelings-why-v1'].criterion.replaceAll('story','lesson')},
 'postcard-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:POSTCARD_LESSON,prompt:'How did this lesson make you feel?',examples:{happy:['happy','I liked fixing the letters'],sad:['sad'],worried:['worried'],excited:['excited'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replaceAll('story','lesson').replace('The pigs felt safe','The child felt happy')},
 'postcard-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:POSTCARD_LESSON,prompt:'What in the lesson made you feel that way?',examples:['I liked fixing the letters','I liked the stamps','the spelling was tricky'],criterion:HOUSES_REFLECTION_BANK['houses-feelings-why-v1'].criterion.replaceAll('story','lesson')},
 'rainy-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:RAINY_LESSON,prompt:'How did this lesson make you feel?',examples:{happy:['happy','I liked making sentences'],sad:['sad'],worried:['worried'],excited:['excited'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replaceAll('story','lesson').replace('The pigs felt safe','The child felt happy')},
 'rainy-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:RAINY_LESSON,prompt:'What in the lesson made you feel that way?',examples:['I liked joining the paper shapes','I like rain','the words were tricky'],criterion:HOUSES_REFLECTION_BANK['houses-feelings-why-v1'].criterion.replaceAll('story','lesson')},
'helper-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:HELPER_BOOK,prompt:'How did this book make you feel?',examples:{happy:['happy','I liked the dogs'],sad:['sad'],worried:['worried about lost people'],excited:['excited'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replaceAll('story','book').replace('The pigs felt safe','The dog felt happy')},
'helper-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:HELPER_BOOK,prompt:'What in the book made you feel that way?',examples:['the dogs helped people','I like dogs','they could find people','I liked the blue ball'],criterion:HOUSES_REFLECTION_BANK['houses-feelings-why-v1'].criterion.replaceAll('story','book')},
'giraffe-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:GIRAFFE_BOOK,prompt:'How did this book make you feel?',examples:{happy:['happy','I liked the calf'],sad:['sad'],worried:['worried about the lion'],excited:['excited'],other:['curious','interested','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replaceAll('story','book').replace('The pigs felt safe','The giraffe felt scared')},
'giraffe-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:GIRAFFE_BOOK,prompt:'What in the book made you feel that way?',examples:['because of the calf','I wanted to know about the tongue','the lion was behind it','I like animals','the patterns were different'],criterion:HOUSES_REFLECTION_BANK['houses-feelings-why-v1'].criterion.replaceAll('story','book')},

'g1u4-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"Nell put apples in a basket. Her brother carried it to the porch. Nell walked beside him.",examples:{happy:['happy','glad they helped'],sad:['sad'],worried:['worried the apples would fall'],excited:['excited'],other:['curious','bored','calm','I felt nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Nell felt happy')},
'g1u4-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"Nell put apples in a basket. Her brother carried it to the porch. Nell walked beside him.",examples:['because her brother helped','the basket of apples','I like apples','I help my family','I felt bored by the walk']},
'g1u3-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"A gust blew Eve\u2019s drawing off the table. Owen caught it by the path. He gave it back to Eve. She thanked him.",examples:{happy:['happy','glad she got it back'],sad:['sad it blew away'],worried:['worried the drawing would be lost'],excited:['excited'],other:['curious','bored','relieved','I felt nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Eve felt happy')},
'g1u3-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"A gust blew Eve\u2019s drawing off the table. Owen caught it by the path. He gave it back to Eve. She thanked him.",examples:['because Owen helped','her drawing blew away','she got it back','I like to draw','I lose things too']},

'troupe-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"The child explored the Little Stage: a pretend gentle ball toss and forceful hurl, tap and pound, little giggles and loud howling laughter, a damp cloth and dripping water, and small sips. No real hitting or hurling was required.",examples:{happy:['happy','I liked the moving ball'],sad:['sad'],worried:['worried'],excited:['excited to try the stage'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The crowd felt happy')},
'troupe-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"The child explored the Little Stage: a pretend gentle ball toss and forceful hurl, tap and pound, little giggles and loud howling laughter, a damp cloth and dripping water, and small sips. No real hitting or hurling was required.",examples:['because I liked moving the ball','the drops were interesting','the chase was fun','I wanted more time','it reminded me of a show']},

'maple-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"The child explored Maple Street: a music room with a drum that can be noisy while playing or quiet while resting, a cozy reading nook, a bakery with bread just made, and real-life word examples.",examples:{happy:['happy','I liked the drum'],sad:['sad'],worried:['worried'],excited:['excited to explore'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The child felt cozy')},
'maple-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"The child explored Maple Street: a music room with a drum that can be noisy while playing or quiet while resting, a cozy reading nook, a bakery with bread just made, and real-life word examples.",examples:['because I like music','I liked the bakery','the windows were fun','I wanted more time','it reminded me of home']},

'museum-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"The child explored a Museum of Small Wonders, defined a duck, tiger, apple and familiar objects using group plus useful detail, solved animal and spoon riddles, and built discovery labels.",examples:{happy:['happy','I liked the duck'],sad:['sad'],worried:['worried'],excited:['excited to solve clues'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The duck felt happy')},
'museum-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"The child explored a Museum of Small Wonders, defined a duck, tiger, apple and familiar objects using group plus useful detail, solved animal and spoon riddles, and built discovery labels.",examples:['because I like ducks','I solved the riddle','I liked the tiger','I wanted to see more objects','it reminded me of my dog']},

'coral-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"The child explored Coral Cove, comparing words and pictures in an octopus book: a coral hiding place, a striped fish, eight arms and a shell, ink and a nearby crab, and an octopus on a rock.",examples:{happy:['happy','I liked the fish'],sad:['sad'],worried:['worried'],excited:['excited to see the octopus'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The octopus felt happy')},
'coral-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"The child explored Coral Cove, comparing words and pictures in an octopus book: a coral hiding place, a striped fish, eight arms and a shell, ink and a nearby crab, and an octopus on a rock.",examples:['because I like the fish','I learned about octopuses','I was worried about the ink','I wanted to swim there','it reminded me of the beach']},

'field-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"The child explored Our Little Bug Book: ant nests, butterflies and bees sipping nectar, and features that locate pages and explain words.",examples:{happy:['happy','I liked the bugs'],sad:['sad'],worried:['worried'],excited:['excited to see the bee'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The butterfly felt happy')},
'field-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"The child explored Our Little Bug Book: ant nests, butterflies and bees sipping nectar, and features that locate pages and explain words.",examples:['because I like bugs','I learned about bees','I am scared of spiders','I wanted to learn more','it reminded me of my garden']},

'keepsake-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:KEEPSAKE_STORY,examples:{happy:['happy','I liked Zara’s story'],sad:['sad'],worried:['worried for Leo'],excited:['excited'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Leo felt scared')},
'keepsake-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:KEEPSAKE_STORY,examples:['because Leo felt scared','Zara was excited','I felt like Leo','I liked hearing both stories','I wanted another ending']},
'stage-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"Rosa ran to the pond. She saw a duck. \"I can see it!\" said Rosa. \"It is by the reeds,\" said Ben. They watched the duck together.",examples:{happy:['happy','I liked the duck'],sad:['sad'],worried:['worried'],excited:['excited to see the duck'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Rosa felt happy')},
'stage-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"Rosa ran to the pond. She saw a duck. \"I can see it!\" said Rosa. \"It is by the reeds,\" said Ben. They watched the duck together.",examples:['because they watched the duck together','I like ducks','they were together','I wanted to see more','it reminded me of the park']},

'willow-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"Lily the frog found a gold coin. \"I will buy a big red hat,\" she said. She hopped to the hat shop.",examples:{happy:['happy','I liked the red hat'],sad:['sad'],worried:['worried she might lose the coin'],excited:['excited'],other:['curious','bored','nothing','happy and worried']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Lily felt happy')},
'willow-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"Lily the frog found a gold coin. \"I will buy a big red hat,\" she said. She hopped to the hat shop.",examples:['because I liked the red hat','Lily found a coin','I like frogs','I wondered what would happen next','it reminded me of shopping']},

'g1u2-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"Zuri could not find her mittens. Pax saw them under the bench. He gave them to Zuri. She put them on and smiled.",examples:{happy:['happy','glad she got them back'],sad:['sad she lost her mittens'],worried:['worried she would be cold'],excited:['excited'],other:['curious','bored','relieved','I felt nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Zuri felt happy')},
'g1u2-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"Zuri could not find her mittens. Pax saw them under the bench. He gave them to Zuri. She put them on and smiled.",examples:['because Pax helped','Zuri could not find her mittens','she got them back','I lose things too','I like helping']},

'g1u1-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"Vic had no cup at camp. Eli had two cups. Eli gave one to Vic. They both had a drink.",examples:{happy:['happy','glad they shared'],sad:['sad Vic had no cup'],worried:['worried he could not drink'],excited:['excited'],other:['curious','bored','relieved','I felt nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Vic felt happy')},
'g1u1-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"Vic had no cup at camp. Eli had two cups. Eli gave one to Vic. They both had a drink.",examples:['because Eli shared','Vic had no cup','they both had a drink','I like sharing','I forgot my cup once']},
'finn-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"Finn got a red bike with shiny wheels. He tried to ride it, but he fell in the grass. Finn got up and tried again and again. Each day, Finn rode a bit more. One week later, he rode all the way down the lane. Finn grinned and said, \"I did it!\"",examples:{happy:['happy','glad he learned'],sad:['sad when Finn fell'],worried:['worried about falling'],excited:['excited'],other:['curious','bored','relieved','I felt nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Finn felt happy')},
'finn-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"Finn got a red bike with shiny wheels. He tried to ride it, but he fell in the grass. Finn got up and tried again and again. Each day, Finn rode a bit more. One week later, he rode all the way down the lane. Finn grinned and said, \"I did it!\"",examples:['because he learned to ride','I was worried when he fell','I like bikes','he kept trying','I fell off a bike too']},

 'farm-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],standard:'SL.1.4',source:"Jen has a small red hen named Dot. Dot naps in a big box by the shed. One morning, the box was empty! Jen ran to the shed. Dot sat on three white eggs! Dot hid there to keep her eggs safe.",
 examples:{happy:['happy','glad Jen found Dot'],sad:['sad'],worried:['worried when the box was empty'],excited:['excited'],other:['curious','bored','not happy','relieved','I felt nothing']},
 criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Dot felt safe')},
 'farm-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],standard:'SL.1.4',source:"Jen has a small red hen named Dot. Dot naps in a big box by the shed. One morning, the box was empty! Jen ran to the shed. Dot sat on three white eggs! Dot hid there to keep her eggs safe.",
 examples:['because Jen found Dot','I like hens','I wondered where Dot went','the box was empty','she kept the eggs safe']},

  'k2-feeling-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-v1'],
    source:'Nell made a paper pinwheel. The pinwheel did not spin inside. Nell took it outside. A breeze made it spin.',
    examples:{happy:['happy','I liked the pinwheel'],sad:['sad'],worried:['worried it would not work'],excited:['excited'],other:['curious','bored','not happy','happy and worried','I felt nothing']},
    criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Nell felt happy'),
  },
  'k2-feeling-why-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],
    source:'Nell made a paper pinwheel. The pinwheel did not spin inside. Nell took it outside. A breeze made it spin.',
    examples:['because it finally spun','I like pinwheels','I wanted to try it','I thought it would not work','I like windy days'],
  },
  'k1-feeling-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-v1'],
    source:'Tess folded a paper boat. She put it in a puddle. The boat floated to a leaf.',
    examples:{happy:['happy','I liked the boat'],sad:['sad'],worried:['worried it might sink'],excited:['excited'],other:['curious','bored','not happy','happy and worried','I felt nothing']},
    criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Tess felt happy'),
  },
  'k1-feeling-why-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],
    source:'Tess folded a paper boat. She put it in a puddle. The boat floated to a leaf.',
    examples:['because the boat floated','I like making boats','I wondered where it would go','I thought it might sink','I like puddles'],
  },
  'k4-feeling-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-v1'],
    source:'A sea otter has thick fur. Its fur helps it stay warm in cold water.',
    prompt:'How did these facts make you feel?',
    examples:{happy:['happy','glad it can stay warm'],sad:['sad'],worried:['worried about cold water'],excited:['excited'],other:['curious','bored','not happy','happy and worried','I felt nothing']},
    criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replaceAll('story','text').replace('The pigs felt safe','The otter felt warm'),
  },
  'k4-feeling-why-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],
    source:'A sea otter has thick fur. Its fur helps it stay warm in cold water.',
    prompt:'What made you feel that way?',
    examples:['I like otters','its fur keeps it warm','cold water sounds chilly','I wondered about its fur','I wanted to learn more'],
    criterion:HOUSES_REFLECTION_BANK['houses-feelings-why-v1'].criterion.replaceAll('story','text'),
  },
  'k3-feeling-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-v1'],
    source: 'A lamb lost its bell. A friend found the bell and brought it back.',
    examples: { happy:['happy','glad it got the bell back'], sad:['sad','sad when it lost the bell'], worried:['worried','I thought it was gone'], excited:['excited','I liked the finding part'], other:['relieved','bored','not happy','happy and worried','I did not feel anything'] },
    criterion: HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe', 'The lamb felt happy'),
  },
  'k3-feeling-why-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],
    source: 'A lamb lost its bell. A friend found the bell and brought it back.',
    examples:['the friend helped','it lost the bell','I like lambs','the bell came back','it was a short story'],
  },

  'rain-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:"Drip, drop! Rain taps all day. The clouds are big and gray. Splash! I dash from pool to pool. The drops feel wet and cool. Then home I run to Dad. A sweet snack makes me glad. I sit on my soft rug. I feel warm and dry and snug.",examples:{happy:['happy','I like puddles'],sad:['sad'],worried:['worried'],excited:['excited'],other:['calm','bored','happy and sad','nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','The speaker felt glad')},
  'rain-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:"Drip, drop! Rain taps all day. The clouds are big and gray. Splash! I dash from pool to pool. The drops feel wet and cool. Then home I run to Dad. A sweet snack makes me glad. I sit on my soft rug. I feel warm and dry and snug.",examples:['I like splashing','the rain sounded nice','I wanted the snack','I do not like rain','it reminded me of home']},
  'windy-feeling-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:"One windy day, Meg and Jax went to the park. Meg ran fast up the hill with her new kite. The wind took the kite into a tall tree. Meg sat down and cried. But Jax did not give up. He found a long stick and set the kite free. Meg jumped up and gave him a big hug.",examples:{happy:['happy','I liked Jax helping'],sad:['sad'],worried:['worried'],excited:['excited','I wanted to fly the kite'],other:['bored','calm','not happy','happy and sad','I felt nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Meg felt happy')},
  'windy-feeling-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:"One windy day, Meg and Jax went to the park. Meg ran fast up the hill with her new kite. The wind took the kite into a tall tree. Meg sat down and cried. But Jax did not give up. He found a long stick and set the kite free. Meg jumped up and gave him a big hug.",examples:['Jax helped Meg','I like kites','the kite got stuck','it reminded me of a friend','I wanted a different story']},
  'party-feelings-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-v1'],source:"Pip is a fox. Pip saw a note. The note said, Come play! It was from Dot. Dot is a bird. Pip ran to the nest in the big tree. Dot and Pip played a game. It was so fun! What a fun day! Pip and Dot are pals.",examples:{happy:['happy','I liked the friends'],sad:['sad'],worried:['worried'],excited:['excited','I wanted to play'],other:['bored','calm','not happy','happy and sad','I felt nothing']},criterion:HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe','Pip felt happy')},
  'party-feelings-why-v1': {...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],source:"Pip is a fox. Pip saw a note. The note said, Come play! It was from Dot. Dot is a bird. Pip ran to the nest in the big tree. Dot and Pip played a game. It was so fun! What a fun day! Pip and Dot are pals.",examples:['they played together','I like birds','I wanted an invitation','it reminded me of a friend','I wanted a different story']},
  'hill-feelings-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-v1'],
    source: 'The cat sat. A dog ran to the cat. The dog sat. The dog is a pal.',
    examples: { happy:['happy','I liked the pals'], sad:['sad'], worried:['worried'], excited:['excited'], other:['calm','bored','not happy','I felt nothing','happy and sad'] },
    criterion: HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe', 'The dog felt happy'),
  },
  'hill-feelings-why-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],
    source: 'The cat sat. A dog ran to the cat. The dog sat. The dog is a pal.',
    examples:['they became pals','I like cats','the dog had a friend','it was quiet','it reminded me of my dog','not much happened'],
  },

  ...HOUSES_REFLECTION_BANK,
  'red-ball-feelings-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-v1'],
    source: "Max the dog lost his red ball. His friend Pip the bird helped him look. They looked all around the yard. And they found the ball under the big tree!",
    examples: {
      happy: ['happy', 'glad they found the ball', 'I liked it'],
      sad: ['sad', 'I felt bad when Max lost his ball'],
      worried: ['worried', 'I thought they would not find it'],
      excited: ['excited', 'I wanted to help them look'],
      other: ['relieved', 'bored', 'not happy', 'happy and worried', 'I did not feel anything'],
    },
    criterion: HOUSES_REFLECTION_BANK['houses-feelings-v1'].criterion.replace('The pigs felt safe', 'Max felt happy'),
  },
  'red-ball-feelings-why-v1': {
    ...HOUSES_REFLECTION_BANK['houses-feelings-why-v1'],
    source: "Max the dog lost his red ball. His friend Pip the bird helped him look. They looked all around the yard. And they found the ball under the big tree!",
    examples: ['they found the ball', 'Pip helped his friend', 'I like dogs', 'I lost my toy once', 'Max could not find his ball'],
  },
} as const;
