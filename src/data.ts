export type LetterItem = {
  letter: string;
  word: string;
  emoji: string;
  /** How device speech should say the letter's sound. Replace with recorded clips in phonics.ts. */
  sound: string;
};

// Words start with the letter's most common (short) sound, so they teach phonics correctly.
export const LETTERS: LetterItem[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎', sound: 'ah' },
  { letter: 'B', word: 'Ball', emoji: '⚽', sound: 'buh' },
  { letter: 'C', word: 'Cat', emoji: '🐱', sound: 'kuh' },
  { letter: 'D', word: 'Dog', emoji: '🐶', sound: 'duh' },
  { letter: 'E', word: 'Egg', emoji: '🥚', sound: 'eh' },
  { letter: 'F', word: 'Fish', emoji: '🐟', sound: 'fff' },
  { letter: 'G', word: 'Goat', emoji: '🐐', sound: 'guh' },
  { letter: 'H', word: 'Hat', emoji: '🎩', sound: 'huh' },
  { letter: 'I', word: 'Insect', emoji: '🐜', sound: 'ih' },
  { letter: 'J', word: 'Juice', emoji: '🧃', sound: 'juh' },
  { letter: 'K', word: 'Kite', emoji: '🪁', sound: 'kuh' },
  { letter: 'L', word: 'Lion', emoji: '🦁', sound: 'lll' },
  { letter: 'M', word: 'Moon', emoji: '🌙', sound: 'mmm' },
  { letter: 'N', word: 'Nest', emoji: '🪺', sound: 'nnn' },
  { letter: 'O', word: 'Octopus', emoji: '🐙', sound: 'aw' },
  { letter: 'P', word: 'Pig', emoji: '🐷', sound: 'puh' },
  { letter: 'Q', word: 'Queen', emoji: '👸', sound: 'kwuh' },
  { letter: 'R', word: 'Rabbit', emoji: '🐰', sound: 'rrr' },
  { letter: 'S', word: 'Sun', emoji: '☀️', sound: 'sss' },
  { letter: 'T', word: 'Tree', emoji: '🌳', sound: 'tuh' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', sound: 'uh' },
  { letter: 'V', word: 'Van', emoji: '🚐', sound: 'vvv' },
  { letter: 'W', word: 'Watch', emoji: '⌚', sound: 'wuh' },
  { letter: 'X', word: 'Fox', emoji: '🦊', sound: 'ks' },
  { letter: 'Y', word: 'Yo-yo', emoji: '🪀', sound: 'yuh' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', sound: 'zzz' },
];

// X is taught by its ending sound (fox), so it is left out of "first sound" games.
export const FIRST_SOUND_LETTERS = LETTERS.filter((l) => l.letter !== 'X');

export function letterItem(letter: string): LetterItem {
  return LETTERS.find((l) => l.letter === letter) ?? LETTERS[0];
}

export function introLine(l: LetterItem) {
  return l.letter === 'X'
    ? 'X says ks, like in fox.'
    : `${l.letter} says ${l.sound}, ${l.sound}. ${l.letter} is for ${l.word}.`;
}

/**
 * Phonics teaching order (the common "s a t p i n" start). New letters unlock in this order,
 * a few at a time, as the child learns the earlier ones.
 */
export const PHONICS_ORDER = 'SATPINMDGOCKERHUBFLJVWXYZQ'.split('');

export const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
];

export type ShapeName = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'rectangle';
export const SHAPES: ShapeName[] = ['circle', 'square', 'triangle', 'star', 'heart', 'rectangle'];

// Named colors for the colors game. These are true to their names, unlike the UI palette.
export const COLOR_NAMES = {
  red: '#F0524F',
  blue: '#3E8EE8',
  yellow: '#FFD23C',
  green: '#4FBF5F',
  purple: '#9B6BFF',
  orange: '#FF9135',
} as const;
export type ColorName = keyof typeof COLOR_NAMES;

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
