import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MakeRound, Quiz } from '../components/Quiz';
import { GAMES } from '../levels';
import type { LevelProps } from './types';
import { COUNT_NAMES, COUNT_THINGS, CountThing, Countable } from '../components/art';
import { NUMBER_WORDS, pick, shuffle } from '../data';
import { numberKey, pickWeighted } from '../learning';
import { colors } from '../theme';


const OPTION_COLORS = [colors.grass, colors.sky, colors.berry];
const BALL_COLORS = [colors.sky, colors.berry, colors.sun, colors.grass, colors.grape, colors.tangerine];

function Group({ n, thing }: { n: number; thing: CountThing }) {
  // three per row keeps groups easy to count; shrink a little for big numbers
  const size = n <= 6 ? 84 : 68;
  return (
    <View style={[s.group, { width: size * 3 + 14 * 2 }]}>
      {Array.from({ length: n }, (_, i) => (
        <Countable key={i} thing={thing} size={size} color={BALL_COLORS[i % BALL_COLORS.length]} />
      ))}
    </View>
  );
}

const NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const makeRound: MakeRound = (skills, _unlocked, prevKey, level) => {
  // bigger numbers come in as the levels go up
  const max = Math.min(9, 3 + level);
  const n = pickWeighted(NUMS.slice(0, max), numberKey, skills, prevKey);
  const thing = pick(COUNT_THINGS);
  const pool = Array.from({ length: Math.max(max, 4) }, (_, i) => i + 1).filter((x) => x !== n);
  const options = shuffle([n, ...shuffle(pool).slice(0, 2)]).map(String);
  return {
    key: numberKey(n),
    say: 'How many can you count?',
    question: 'How many can you count?',
    art: <Group n={n} thing={thing} />,
    options,
    answer: String(n),
    explain: `Let us count. There are ${NUMBER_WORDS[n]} ${n === 1 ? COUNT_NAMES[thing].slice(0, -1) : COUNT_NAMES[thing]}.`,
  };
};

export function CountQuiz({ level, onBack, onFinish }: LevelProps) {
  return (
    <Quiz
      level={level}
      rounds={GAMES.countQuiz.rounds}
      onFinish={onFinish}
      title="Count it!"
      makeRound={makeRound}
      optionColors={OPTION_COLORS}
      onBack={onBack}
    />
  );
}

const s = StyleSheet.create({
  group: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
});
