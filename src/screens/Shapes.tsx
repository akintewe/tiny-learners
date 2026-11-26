import React from 'react';
import { MakeRound, Quiz } from '../components/Quiz';
import { GAMES } from '../levels';
import type { LevelProps } from './types';
import { QuestionIcon, Shape } from '../components/art';
import { COLOR_NAMES, ColorName, pick, SHAPES, ShapeName, shuffle } from '../data';
import { pickWeighted } from '../learning';
import { colors } from '../theme';

const COLORS = Object.keys(COLOR_NAMES) as ColorName[];

const makeRound: MakeRound = (skills, _unlocked, prevKey) => {
  const askColor = Math.random() < 0.5;
  if (askColor) {
    const target = pickWeighted(COLORS, (c) => `C:${c}`, skills, prevKey);
    const shape = pick(SHAPES);
    const others = shuffle(COLORS.filter((c) => c !== target)).slice(0, 2);
    return {
      key: `C:${target}`,
      say: `Find the ${target} one.`,
      question: `Find the ${target} one!`,
      art: <QuestionIcon size={120} />,
      options: shuffle([target, ...others]),
      answer: target,
      renderOption: (opt) => <Shape shape={shape} color={opt} size={80} />,
      optionHeight: 130,
      explain: `This one is ${target}.`,
    };
  }
  const target = pickWeighted(SHAPES, (sh) => `S:${sh}`, skills, prevKey);
  const others = shuffle(SHAPES.filter((x) => x !== target)).slice(0, 2);
  const color = pick(COLORS);
  return {
    key: `S:${target}`,
    say: `Find the ${target}.`,
    question: `Find the ${target}!`,
    art: <QuestionIcon size={120} />,
    options: shuffle([target, ...others]),
    answer: target,
    renderOption: (opt) => <Shape shape={opt as ShapeName} color={color} size={80} />,
    optionHeight: 130,
    explain: `This is the ${target}.`,
  };
};

export function Shapes({ level, onBack, onFinish }: LevelProps) {
  return <Quiz
      level={level}
      rounds={GAMES.shapes.rounds}
      onFinish={onFinish} title="Shapes" makeRound={makeRound} optionColors={[colors.card]} onBack={onBack} />;
}
