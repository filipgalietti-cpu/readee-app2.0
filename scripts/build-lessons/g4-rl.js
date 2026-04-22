#!/usr/bin/env node
/** G4 Literature: 9 lessons */
const build = require("./_lib");
const IMG = "Bright 2D cartoon illustration, bold clean outlines, vibrant saturated colors. No text, no words, no letters.";
const L = (id,title,slides,mcqIds)=>build({standardId:id,grade:"4th Grade",domain:"Literature",title,slides,mcqIds});

L("RL.4.1","Finding Story Details",[
  {type:"intro",heading:"Details Are Evidence",imagePrompt:`A cheerful cartoon detective kid examining a glowing line in a book with a magnifying glass. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth grade readers use specific details from the text as evidence.",displayText:"Details = evidence",displayDelay:2800},
  ]},
  {type:"teach",heading:"Quote the Text",imagePrompt:`A cheerful cartoon kid pointing to a sentence in a book with quote marks around it. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"When you make a claim, quote the exact words from the text.",displayText:"Quote the words",displayDelay:2500},
  ]},
  {type:"example",heading:"Make Inferences",imagePrompt:`A cheerful cartoon kid with a thought bubble showing a tiny inference puzzle solved. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Sometimes the answer is not stated directly. We infer it from the details.",displayText:"Infer = put clues together",displayDelay:2800},
  ]},
  {type:"tip",heading:"Always Cite",imagePrompt:`A cheerful cartoon highlighter character with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A details trick",displayDelay:1500},
    {sub:"b",tts:"When you answer, say: the text says... and quote a line!",displayText:"The text says...",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to find story details!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.1-Q1","RL.4.1-Q2","RL.4.1-Q3","RL.4.1-Q4","RL.4.1-Q5"]);

L("RL.4.2","Discovering Themes",[
  {type:"intro",heading:"What Is the Big Lesson?",imagePrompt:`A cheerful cartoon book glowing with a heart at the center. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A theme is the big idea or life lesson the story shares.",displayText:"Theme = big lesson",displayDelay:2800},
    {sub:"b",tts:"Themes are not stated. You discover them.",displayText:"Discover them",displayDelay:2500},
  ]},
  {type:"teach",heading:"Look at Choices and Endings",imagePrompt:`A cheerful cartoon book with a fork in the path inside. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"What did the character learn? What changed at the end?",displayText:"Learned + changed",displayDelay:2500},
  ]},
  {type:"example",heading:"Common Themes",imagePrompt:`A cheerful cartoon group of theme labels: friendship, bravery, kindness. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Friendship matters. Bravery wins. Be kind. Never give up. Big themes!",displayText:"Friendship, bravery, kindness",displayDelay:3000},
  ]},
  {type:"tip",heading:"In Your Own Words",imagePrompt:`A cheerful cartoon kid writing in a journal. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A theme trick",displayDelay:1500},
    {sub:"b",tts:"Say the theme in one short sentence. If you can do that, you found it!",displayText:"One sentence theme",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to discover themes!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.2-Q1","RL.4.2-Q2","RL.4.2-Q3","RL.4.2-Q4","RL.4.2-Q5"]);

L("RL.4.3","Deep Character Detail",[
  {type:"intro",heading:"Look Deep",imagePrompt:`A cheerful cartoon kid looking at a character with a magnifying glass over its heart. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth grade readers go deep into characters.",displayText:"Go deep",displayDelay:2200},
    {sub:"b",tts:"They look at thoughts, words, and actions.",displayText:"Thoughts + words + actions",displayDelay:2500},
  ]},
  {type:"teach",heading:"Show Versus Tell",imagePrompt:`A cheerful cartoon kid acting brave next to a label that says brave. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Authors show traits through action, not just labels.",displayText:"Show through action",displayDelay:2500},
    {sub:"b",tts:"He helped the lost child means kind, even without saying kind.",displayText:"Action = trait",displayDelay:2800},
  ]},
  {type:"example",heading:"Watch the Change",imagePrompt:`A cheerful cartoon kid changing from shy to confident over time. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Many characters change through the story. Notice the growth!",displayText:"Notice growth",displayDelay:2500},
  ]},
  {type:"tip",heading:"Cite Specific Lines",imagePrompt:`A cheerful cartoon highlighter character. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A character trick",displayDelay:1500},
    {sub:"b",tts:"Back up traits with a line. He is generous because he gave away his lunch.",displayText:"Trait + because + line",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to describe characters deeply!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.3-Q1","RL.4.3-Q2","RL.4.3-Q3","RL.4.3-Q4","RL.4.3-Q5"]);

L("RL.4.4","Word Meanings in Stories",[
  {type:"intro",heading:"Meaning Beyond the Word",imagePrompt:`A cheerful cartoon word transforming into a tiny picture. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Authors use words for more than just their basic meaning.",displayText:"More than basic",displayDelay:2500},
    {sub:"b",tts:"Mythological references, allusions, and figurative language all show up.",displayText:"Big literary tools",displayDelay:2800},
  ]},
  {type:"teach",heading:"Allusions",imagePrompt:`A cheerful cartoon book with a tiny ancient figure peeking out. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"An allusion is a quick reference to a story or myth everyone knows.",displayText:"Allusion = reference",displayDelay:2800},
    {sub:"b",tts:"Calling someone a Hercules means they are super strong!",displayText:"Hercules = strong",displayDelay:2500},
  ]},
  {type:"teach",heading:"Figurative Meanings",imagePrompt:`A cheerful cartoon kite floating up with a tiny dream cloud. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Words like soared, drowning, or melting often mean something figurative.",displayText:"Figurative",displayDelay:2500},
  ]},
  {type:"tip",heading:"Look It Up",imagePrompt:`A cheerful cartoon dictionary with sparkles. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A meaning trick",displayDelay:1500},
    {sub:"b",tts:"If a word seems too big or strange, look it up. Or use context to guess.",displayText:"Look up + context",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to unlock story word meanings!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.4-Q1","RL.4.4-Q2","RL.4.4-Q3","RL.4.4-Q4","RL.4.4-Q5"]);

L("RL.4.5","Poems, Drama, and Prose",[
  {type:"intro",heading:"Three Story Forms",imagePrompt:`A cheerful cartoon poem scroll, theater mask, and open book in a row. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Stories come in three big forms: poems, drama, and prose.",displayText:"Poems / drama / prose",displayDelay:2800},
  ]},
  {type:"teach",heading:"Poems",imagePrompt:`A cheerful cartoon scroll with poetic lines and tiny musical notes. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Poems have lines, stanzas, and often rhythm or rhyme.",displayText:"Lines + stanzas + rhythm",displayDelay:2800},
  ]},
  {type:"teach",heading:"Drama and Prose",imagePrompt:`A cheerful cartoon stage with two characters acting and a storybook nearby. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Drama is meant to be acted out. It uses scenes and dialogue.",displayText:"Drama = scenes + dialogue",displayDelay:2800},
    {sub:"b",tts:"Prose is regular sentences and paragraphs.",displayText:"Prose = paragraphs",displayDelay:2500},
  ]},
  {type:"tip",heading:"Use the Right Words",imagePrompt:`A cheerful cartoon kid pointing at a labeled diagram. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A form trick",displayDelay:1500},
    {sub:"b",tts:"Use the right words for each form: stanza, scene, paragraph.",displayText:"Stanza / scene / paragraph",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to know poems, drama, and prose!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.5-Q1","RL.4.5-Q2","RL.4.5-Q3","RL.4.5-Q4","RL.4.5-Q5"]);

L("RL.4.6","Different Storytelling Voices",[
  {type:"intro",heading:"Whose Voice?",imagePrompt:`A cheerful cartoon kid wearing a director's headset directing different narrators. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Stories can be told in different voices.",displayText:"Different voices",displayDelay:2200},
    {sub:"b",tts:"First person uses I. Third person uses he, she, they.",displayText:"I vs he/she/they",displayDelay:2500},
  ]},
  {type:"teach",heading:"First Person",imagePrompt:`A cheerful cartoon kid pointing to themselves with a thought bubble. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"First person makes you feel close to the character.",displayText:"Close = first person",displayDelay:2500},
  ]},
  {type:"teach",heading:"Third Person",imagePrompt:`A cheerful cartoon narrator in a director's chair watching characters. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Third person feels more like watching from outside.",displayText:"Outside = third person",displayDelay:2500},
  ]},
  {type:"tip",heading:"Notice the Pronouns",imagePrompt:`A cheerful cartoon highlighter circling pronouns. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A voice trick",displayDelay:1500},
    {sub:"b",tts:"Look at the pronouns in the first sentence. They tell you the voice.",displayText:"Pronouns = voice",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to spot storytelling voices!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.6-Q1","RL.4.6-Q2","RL.4.6-Q3","RL.4.6-Q4","RL.4.6-Q5"]);

L("RL.4.7","Stories Across Mediums",[
  {type:"intro",heading:"Same Story, Different Form",imagePrompt:`A cheerful cartoon book and a movie reel side by side. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A story can be a book, a movie, a play, or even a song.",displayText:"Book / movie / play / song",displayDelay:2800},
    {sub:"b",tts:"Each medium tells the story differently.",displayText:"Each is different",displayDelay:2500},
  ]},
  {type:"teach",heading:"Book vs Movie",imagePrompt:`A cheerful cartoon kid with one eye on a book and one eye on a movie screen. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"A movie shows you visuals and sounds directly. A book lets you imagine them.",displayText:"Movie shows / book imagines",displayDelay:2800},
  ]},
  {type:"example",heading:"What Got Cut?",imagePrompt:`A cheerful cartoon film reel with a few frames missing. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Movies often cut parts of the book to fit the time.",displayText:"Cuts to fit time",displayDelay:2500},
    {sub:"b",tts:"Sometimes they add scenes too!",displayText:"Sometimes add scenes",displayDelay:2500},
  ]},
  {type:"tip",heading:"Compare and Contrast",imagePrompt:`A cheerful cartoon Venn diagram with one circle a book and one a movie. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A medium trick",displayDelay:1500},
    {sub:"b",tts:"Make a list of what is same and what is different between book and movie.",displayText:"Same vs different",displayDelay:2500},
    {sub:"c",tts:"Now you are ready to compare stories across mediums!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.7-Q1","RL.4.7-Q2","RL.4.7-Q3","RL.4.7-Q4","RL.4.7-Q5"]);

L("RL.4.9","Same Theme, Different Cultures",[
  {type:"intro",heading:"Themes Travel",imagePrompt:`A cheerful cartoon globe with story books from different cultures around it. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Big ideas like courage, family, and home appear in stories all over the world.",displayText:"Themes are universal",displayDelay:3000},
  ]},
  {type:"teach",heading:"Trickster Tales",imagePrompt:`A cheerful cartoon trickster fox with a sly smile. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Many cultures have trickster characters who teach lessons through cleverness.",displayText:"Tricksters = lessons",displayDelay:2800},
  ]},
  {type:"teach",heading:"Hero Journeys",imagePrompt:`A cheerful cartoon kid hero character at the start of a path with a backpack. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Hero stories show up everywhere. Greek myths, African folktales, Japanese legends.",displayText:"Heroes everywhere",displayDelay:2800},
  ]},
  {type:"tip",heading:"Notice the Shared Heart",imagePrompt:`A cheerful cartoon two books with a glowing heart between them. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A culture trick",displayDelay:1500},
    {sub:"b",tts:"When reading a story from another culture, ask: what big lesson does it share with stories I know?",displayText:"Shared lesson?",displayDelay:2800},
    {sub:"c",tts:"Now you are ready to compare themes across cultures!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.9-Q1","RL.4.9-Q2","RL.4.9-Q3","RL.4.9-Q4","RL.4.9-Q5"]);

L("RL.4.10","Reading Big Stories",[
  {type:"intro",heading:"Bigger Books, Bigger Adventures",imagePrompt:`A cheerful cartoon kid carrying a tall stack of books with a confident smile. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Fourth graders take on longer, more complex stories.",displayText:"Longer + more complex",displayDelay:2500},
    {sub:"b",tts:"Chapter books, novels, and longer poems!",displayText:"Chapter books + novels",displayDelay:2500},
  ]},
  {type:"teach",heading:"Pace Yourself",imagePrompt:`A cheerful cartoon kid with a bookmark inside a thick book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Long books need a steady pace. A chapter or two a day works great.",displayText:"Steady pace",displayDelay:2500},
  ]},
  {type:"teach",heading:"Take Notes",imagePrompt:`A cheerful cartoon kid jotting in a notebook with sticky notes on a book. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Take quick notes about characters and big events.",displayText:"Notes help",displayDelay:2500},
  ]},
  {type:"tip",heading:"Read Daily",imagePrompt:`A cheerful cartoon clock with a book inside. Clean pastel background. ${IMG}`,steps:[
    {sub:"a",tts:"Here is a helpful trick.",displayText:"A daily trick",displayDelay:1500},
    {sub:"b",tts:"Daily reading turns hard books into easy adventures over time!",displayText:"Daily = easier",displayDelay:2800},
    {sub:"c",tts:"Now you are ready for big stories!",displayText:"You got it!",displayDelay:1500},
  ]},
],["RL.4.10-Q1","RL.4.10-Q2","RL.4.10-Q3","RL.4.10-Q4","RL.4.10-Q5"]);
