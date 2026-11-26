import type { Skill } from './storage';
import { LETTERS, LetterItem, PHONICS_ORDER } from './data';

/** Known = answered right on the first try twice in a row. */
export function isKnown(s?: Skill) {
  return !!s && s.streak >= 2;
}

export const letterKey = (l: string) => `L:${l}`;
export const numberKey = (n: number) => `N:${n}`;

/**
 * Weighted random pick that favours things the child has not learned yet,
 * especially ones they keep missing. Known items still come back now and then.
 */
export function pickWeighted<T>(
  items: readonly T[],
  keyOf: (t: T) => string,
  skills: Record<string, Skill>,
  avoid?: string,
): T {
  const pool = items.length > 1 && avoid ? items.filter((t) => keyOf(t) !== avoid) : items;
  const weights = pool.map((t) => {
    const s = skills[keyOf(t)];
    if (!s) return 3;
    if (isKnown(s)) return 1;
    return 4 + Math.min(s.misses, 3);
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

/** Letters in play, in phonics order. */
export function activeLetters(unlocked: number): LetterItem[] {
  return PHONICS_ORDER.slice(0, Math.max(3, unlocked)).map((ch) => LETTERS.find((l) => l.letter === ch)!);
}

/** Unlock 4 more letters once all but one of the current set are known. */
export function nextUnlock(unlocked: number, skills: Record<string, Skill>) {
  if (unlocked >= PHONICS_ORDER.length) return unlocked;
  const set = PHONICS_ORDER.slice(0, unlocked);
  const known = set.filter((l) => isKnown(skills[letterKey(l)])).length;
  return known >= set.length - 1 ? Math.min(PHONICS_ORDER.length, unlocked + 4) : unlocked;
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
