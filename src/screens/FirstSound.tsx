import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MakeRound, Quiz } from '../components/Quiz';
import { GAMES } from '../levels';
import type { LevelProps } from './types';
import { ItemArt } from '../components/ItemArt';
import { SpeakerIcon } from '../components/art';
import { FIRST_SOUND_LETTERS, letterItem, shuffle } from '../data';
import { activeLetters, letterKey, pickWeighted } from '../learning';
import { colors, font, outline } from '../theme';

const makeRound: MakeRound = (skills, unlocked, prevKey) => {
  const active = activeLetters(unlocked).filter((l) => l.letter !== 'X');
  const pool = active.length >= 3 ? active : FIRST_SOUND_LETTERS;
  const target = pickWeighted(pool, (l) => letterKey(l.letter), skills, prevKey);
  const others = shuffle(FIRST_SOUND_LETTERS.filter((l) => l.letter !== target.letter)).slice(0, 2);
  return {
    key: letterKey(target.letter),
    say: `Which one starts with ${target.sound}? ${target.sound}.`,
    question: `Which one starts with ${target.letter.toLowerCase()}?`,
    art: (
      <View style={s.art}>
        <View style={[s.dot, outline]}>
          <SpeakerIcon size={40} />
        </View>
        <Text style={s.letter}>{target.letter.toLowerCase()}</Text>
      </View>
    ),
    options: shuffle([target, ...others]).map((l) => l.letter),
    answer: target.letter,
    renderOption: (opt) => <ItemArt item={letterItem(opt)} size={84} />,
    optionHeight: 130,
    explain: `${target.word} starts with ${target.sound}. ${target.letter} says ${target.sound}.`,
  };
};

export function FirstSound({ level, onBack, onFinish }: LevelProps) {
  return <Quiz
      level={level}
      rounds={GAMES.firstSound.rounds}
      onFinish={onFinish} title="First sound" makeRound={makeRound} optionColors={[colors.card]} onBack={onBack} />;
}

const s = StyleSheet.create({
  art: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  dot: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: font.bold, fontSize: 130, lineHeight: 140, color: colors.ink, includeFontPadding: false },
});
