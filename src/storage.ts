import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'tiny-learners:v2';
const OLD_KEY = 'tiny-learners:v1';

/** One skill (a letter, a number, a shape). `streak` counts first-try right answers in a row. */
export type Skill = { streak: number; seen: number; misses: number };

export type Avatar = 'boy' | 'girl';
export type Wearing = { hat?: string; glasses?: string; shirt?: string };

export type Saved = {
  stars: number;
  earned: number; // lifetime stars
  voice: boolean;
  sfx: boolean;
  music: boolean;
  limit: number; // daily minutes, 0 = no limit
  usage: { day: string; minutes: number };
  skills: Record<string, Skill>;
  unlocked: number; // how many letters of PHONICS_ORDER are in play
  levels: Record<string, number>; // levels finished, per game
  avatar: Avatar | null;
  owned: string[]; // shop item ids
  wearing: Wearing;
};

export const DEFAULTS: Saved = {
  stars: 0,
  earned: 0,
  voice: true,
  sfx: true,
  music: true,
  limit: 0,
  usage: { day: '', minutes: 0 },
  skills: {},
  unlocked: 6,
  levels: {},
  avatar: null,
  owned: [],
  wearing: {},
};

export async function load(): Promise<Saved> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    const old = await AsyncStorage.getItem(OLD_KEY);
    if (old) {
      const o = JSON.parse(old) as { stars?: number; sound?: boolean };
      return { ...DEFAULTS, stars: o.stars ?? 0, earned: o.stars ?? 0, voice: o.sound ?? true };
    }
  } catch {}
  return DEFAULTS;
}

export async function save(s: Saved) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}
