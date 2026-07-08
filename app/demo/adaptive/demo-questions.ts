// Auto-curated real questions from the catalog for the adaptive demo.
// A difficulty ladder for one skill (word meaning): easy(1st) → on(2nd) → hard(4th).

export interface DemoQuestion { prompt: string; choices: string[]; correct: string; level: "easy" | "on" | "hard"; }

export const DEMO_LADDER: DemoQuestion[] = [
  { level: "easy", prompt: "Read the sentence: \"The dog was soggy after playing outside in the rain.\" What does the word soggy mean?", choices: ["wet", "fast", "hungry", "tall"], correct: "wet" },
  { level: "easy", prompt: "Read the sentence: \"The little ant looked so tiny next to the big rock.\" What does the word tiny mean?", choices: ["very small", "very loud", "very old", "very fast"], correct: "very small" },
  { level: "easy", prompt: "Read the sentence: \"Maya felt gloomy when her best friend moved far away.\" What does the word gloomy mean?", choices: ["sad", "sleepy", "hungry", "silly"], correct: "sad" },
  { level: "easy", prompt: "Read the sentence: \"The soup was so scorching that Ben blew on it to cool it down.\" What does the word scorching mean?", choices: ["very hot", "very cold", "very sweet", "very small"], correct: "very hot" },
  { level: "on", prompt: "Read the sentence: 'The bag was so light that I could lift it with one finger.' What does the word light mean in this sentence?", choices: ["not heavy", "brightness from the sun", "a color you can see", "to turn on a lamp"], correct: "not heavy" },
  { level: "on", prompt: "The prefix un- means 'not.' What does the word unhappy mean?", choices: ["not happy", "very happy", "happy again", "full of happy"], correct: "not happy" },
  { level: "on", prompt: "Read the sentence: 'The soup was so scalding that Mia had to wait for it to cool before eating.' What does scalding most likely mean?", choices: ["very hot", "very cold", "very sweet", "very old"], correct: "very hot" },
  { level: "on", prompt: "A compound word is made of two smaller words put together. What does the compound word sailboat most likely mean?", choices: ["a boat that moves using a sail", "a boat that is broken", "a kind of fish", "a place where people swim"], correct: "a boat that moves using a sail" },
  { level: "hard", prompt: "Which sentence uses the most precise language?", choices: ["The rocket accelerated through the atmosphere at tremendous speed.", "Something moved quickly up there.", "It went really, really fast.", "The thing went fast."], correct: "The rocket accelerated through the atmosphere at tremendous speed." },
  { level: "hard", prompt: "In social studies, the word **democracy** means —", choices: ["A military government", "A system where citizens have the power to make decisions through voting", "A type of economy", "Rule by one king"], correct: "A system where citizens have the power to make decisions through voting" },
  { level: "hard", prompt: "The academic phrase **in contrast** signals that the author is about to —", choices: ["Give an example", "Summarize", "Show a difference", "Conclude"], correct: "Show a difference" },
];
