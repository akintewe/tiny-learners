import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MakeRound, Quiz } from '../components/Quiz';
import { GAMES } from '../levels';
import type { LevelProps } from './types';
import { COUNT_NAMES, COUNT_THINGS, Countable, Pip } from '../components/art';
import { NUMBER_WORDS, pick } from '../data';
import { colors } from '../theme';

function Group({ n, thing }: { n: number; thing: (typeof COUNT_THINGS)[number] }) {
  return (
    <View style={s.group}>
      {Array.from({ length: n }, (_, i) => (
        <Countable key={i} thing={thing} size={n > 6 ? 34 : n > 4 ? 40 : 48} color={colors.sky} />
      ))}
    </View>
  );
}

const makeRound: MakeRound = (_skills, _unlocked, _prev, level) => {
  // early levels have an easy gap; later levels get closer
  const gap = level < 4 ? 3 : level < 8 ? 2 : 1;
  const a = 1 + Math.floor(Math.random() * (8 - gap));
  const b = Math.min(8, a + gap + Math.floor(Math.random() * 2));
  const [left0, right0] = Math.random() < 0.5 ? [a, b] : [b, a];
  const thing = pick(COUNT_THINGS);
  const left = `left-${left0}`;
  const right = `right-${right0}`;
  const more = left0 > right0 ? left : right;
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return {
    key: `M:${big - small <= 2 ? 'close' : 'far'}`,
    say: 'Which side has more?',
    question: 'Which side has more?',
    art: <Pip size={90} />,
    options: [left, right],
    answer: more,
    renderOption: (opt) => <Group n={Number(opt.split('-')[1])} thing={thing} />,
    optionHeight: 230,
    explain: `${NUMBER_WORDS[big]} is more than ${NUMBER_WORDS[small]}. That side has more ${COUNT_NAMES[thing]}.`,
  };
};

export function MoreLess({ level, onBack, onFinish }: LevelProps) {
  return <Quiz
      level={level}
      rounds={GAMES.more.rounds}
      onFinish={onFinish} title="Which is more?" makeRound={makeRound} optionColors={[colors.card]} onBack={onBack} />;
}

const s = StyleSheet.create({
  group: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 6, padding: 10 },
});
