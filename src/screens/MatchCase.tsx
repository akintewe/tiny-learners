import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { MakeRound, Quiz } from '../components/Quiz';
import { GAMES } from '../levels';
import type { LevelProps } from './types';
import { shuffle } from '../data';
import { activeLetters, letterKey, pickWeighted } from '../learning';
import { colors, font } from '../theme';

const OPTION_COLORS = [colors.sky, colors.berry, colors.sun];

// Letters that kids mix up are shown together on purpose, once they are in play.
const LOOKALIKES: Record<string, string[]> = { B: ['D', 'P'], D: ['B', 'P'], P: ['Q', 'B'], Q: ['P', 'G'], N: ['M', 'U'], M: ['N', 'W'] };

const makeRound: MakeRound = (skills, unlocked, prevKey) => {
  const pool = activeLetters(unlocked);
  const target = pickWeighted(pool, (l) => letterKey(l.letter), skills, prevKey);
  const tricky = (LOOKALIKES[target.letter] ?? []).filter((x) => pool.some((l) => l.letter === x));
  const rest = shuffle(pool.map((l) => l.letter).filter((x) => x !== target.letter && !tricky.includes(x)));
  const others = [...tricky, ...rest].slice(0, 2);
  const options = shuffle([target.letter, ...others]).map((x) => x.toLowerCase());
  return {
    key: letterKey(target.letter),
    say: `Find the little ${target.letter}.`,
    question: 'Find the little one!',
    art: <Text style={s.big}>{target.letter}</Text>,
    options,
    answer: target.letter.toLowerCase(),
    explain: `Big ${target.letter} and little ${target.letter} go together.`,
  };
};

export function MatchCase({ level, onBack, onFinish }: LevelProps) {
  return <Quiz
      level={level}
      rounds={GAMES.match.rounds}
      onFinish={onFinish} title="Match it!" makeRound={makeRound} optionColors={OPTION_COLORS} onBack={onBack} />;
}

const s = StyleSheet.create({
  big: { fontFamily: font.bold, fontSize: 160, lineHeight: 170, color: colors.ink, includeFontPadding: false },
});
