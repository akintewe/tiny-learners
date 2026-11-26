import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Avatar, DEFAULTS, load, Saved, save, Wearing } from './storage';
import { nextUnlock, today } from './learning';
import { setSoundEnabled } from './speak';
import { setAppActive, setMusicEnabled, setSfxEnabled } from './sound';
import { LEVEL_BONUS, LEVELS_PER_GAME } from './levels';
import type { WearItem } from './assets/wear';

type Settings = Pick<Saved, 'voice' | 'sfx' | 'music' | 'limit'>;

type Store = Saved & {
  ready: boolean;
  minutesToday: number;
  limitReached: boolean;
  /** Set right after a level is finished, so the map can walk the avatar to the next stop. */
  justFinished: { game: string; level: number } | null;
  addStar: (n?: number) => void;
  resetStars: () => void;
  resetProgress: () => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  record: (key: string, firstTry: boolean) => void;
  extendToday: (minutes: number) => void;
  finishLevel: (game: string, level: number) => void;
  clearJustFinished: () => void;
  setAvatar: (a: Avatar) => void;
  buy: (item: WearItem) => boolean;
  wear: (item: WearItem | null, slot: keyof Wearing) => void;
};

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

/** For components that may also render outside the provider. */
export function useOptionalStore() {
  return useContext(Ctx);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Saved>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [justFinished, setJustFinished] = useState<Store['justFinished']>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    load().then((d) => {
      setData(d);
      setReady(true);
    });
  }, []);

  const minutesToday = data.usage.day === today() ? data.usage.minutes : 0;
  const limitReached = data.limit > 0 && minutesToday >= data.limit;

  // keep the audio modules in step with settings; music rests while the app is asleep
  useEffect(() => {
    if (!ready) return;
    setSoundEnabled(data.voice);
    setSfxEnabled(data.sfx);
    setMusicEnabled(data.music && !limitReached);
  }, [ready, data.voice, data.sfx, data.music, limitReached]);

  // save shortly after any change
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(data), 400);
  }, [ready, data]);

  // count minutes of active play for the daily limit; pause music in the background
  useEffect(() => {
    let active = AppState.currentState === 'active';
    const sub = AppState.addEventListener('change', (st) => {
      active = st === 'active';
      setAppActive(active);
    });
    const tick = setInterval(() => {
      if (!active) return;
      setData((d) => {
        const day = today();
        const minutes = d.usage.day === day ? d.usage.minutes + 1 : 1;
        return { ...d, usage: { day, minutes } };
      });
    }, 60_000);
    return () => {
      sub.remove();
      clearInterval(tick);
    };
  }, []);

  const addStar = useCallback((n = 1) => {
    setData((d) => ({ ...d, stars: d.stars + n, earned: d.earned + n }));
  }, []);

  const record = useCallback((key: string, firstTry: boolean) => {
    setData((d) => {
      const s = d.skills[key] ?? { streak: 0, seen: 0, misses: 0 };
      const next = {
        streak: firstTry ? s.streak + 1 : 0,
        seen: s.seen + 1,
        misses: firstTry ? Math.max(0, s.misses - 1) : s.misses + 1,
      };
      const skills = { ...d.skills, [key]: next };
      return { ...d, skills, unlocked: key.startsWith('L:') ? nextUnlock(d.unlocked, skills) : d.unlocked };
    });
  }, []);

  const finishLevel = useCallback((game: string, level: number) => {
    setData((d) => {
      const done = d.levels[game] ?? 0;
      // replaying an old level still pays the bonus but does not move the map
      const levels = level >= done ? { ...d.levels, [game]: Math.min(LEVELS_PER_GAME, level + 1) } : d.levels;
      return { ...d, levels, stars: d.stars + LEVEL_BONUS, earned: d.earned + LEVEL_BONUS };
    });
    setJustFinished({ game, level });
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...data,
      ready,
      minutesToday,
      limitReached,
      justFinished,
      addStar,
      record,
      finishLevel,
      clearJustFinished: () => setJustFinished(null),
      resetStars: () => setData((d) => ({ ...d, stars: 0 })),
      resetProgress: () => setData((d) => ({ ...d, skills: {}, unlocked: DEFAULTS.unlocked, levels: {} })),
      setSetting: (k, v) => setData((d) => ({ ...d, [k]: v })),
      extendToday: (minutes) =>
        setData((d) => ({ ...d, usage: { day: today(), minutes: Math.max(0, d.limit - minutes) } })),
      setAvatar: (a) => setData((d) => ({ ...d, avatar: a })),
      buy: (item) => {
        if (data.owned.includes(item.id) || data.stars < item.price) return false;
        setData((d) => ({
          ...d,
          stars: d.stars - item.price,
          owned: [...d.owned, item.id],
          wearing: { ...d.wearing, [item.slot]: item.id },
        }));
        return true;
      },
      wear: (item, slot) => setData((d) => ({ ...d, wearing: { ...d.wearing, [slot]: item?.id } })),
    }),
    [data, ready, minutesToday, limitReached, justFinished, addStar, record, finishLevel],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
