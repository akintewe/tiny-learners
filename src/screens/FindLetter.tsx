import React from 'react';
import { MakeRound, Quiz } from '../components/Quiz';
import { GAMES } from '../levels';
import type { LevelProps } from './types';
import { ItemArt } from '../components/ItemArt';
import { shuffle } from '../data';
import { activeLetters, letterKey, pickWeighted } from '../learning';
import { colors } from '../theme';

const OPTION_COLORS = [colors.grape, colors.grass, colors.tangerine];

const makeRound: MakeRound = (skills, unlocked, prevKey) => {
  const pool = activeLetters(unlocked);
  const target = pickWeighted(pool, (l) => letterKey(l.letter), skills, prevKey);
  const others = shuffle(pool.filter((l) => l.letter !== target.letter)).slice(0, 2);
  const word = target.letter === 'X' ? 'Fox end with' : `${target.word} start with`;
  return {
    key: letterKey(target.letter),
    say: `Which letter does ${word}?`,
    question: `Which letter does ${word}?`,
    art: <ItemArt item={target} size={170} />,
    options: shuffle([target, ...others]).map((l) => l.letter),
    answer: target.letter,
    explain:
      target.letter === 'X'
        ? 'It is X. Fox ends with ks.'
        : `It is ${target.letter}. ${target.word} starts with ${target.sound}.`,
  };
};

export function FindLetter({ level, onBack, onFinish }: LevelProps) {
  return <Quiz
      level={level}
      rounds={GAMES.findLetter.rounds}
      onFinish={onFinish} title="Find it!" makeRound={makeRound} optionColors={OPTION_COLORS} onBack={onBack} />;
}
