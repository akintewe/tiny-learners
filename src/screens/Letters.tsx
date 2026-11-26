import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { KeyGrid } from '../components/KeyGrid';
import { ItemArt } from '../components/ItemArt';
import { Card, SpeakDot } from '../components/ui';
import { introLine, LETTERS } from '../data';
import { colors, font, tileColors } from '../theme';
import { speak } from '../speak';

type Props = { onBack: () => void };

const KEYS = LETTERS.map((l) => l.letter);

export function Letters({ onBack }: Props) {
  const [idx, setIdx] = useState(0);
  const item = LETTERS[idx];

  const say = (i: number) => {
    speak(introLine(LETTERS[i]));
  };

  const tap = (i: number) => {
    setIdx(i);
    Haptics.selectionAsync().catch(() => {});
    say(i);
  };

  return (
    <Screen title="Letters" onBack={onBack}>
      <Card style={s.preview}>
        <View style={s.corner}>
          <SpeakDot onPress={() => say(idx)} color={colors.sky} />
        </View>
        <View style={s.row}>
          <Text style={s.big}>
            {item.letter}
            <Text style={s.small}>{item.letter.toLowerCase()}</Text>
          </Text>
          <ItemArt item={item} size={112} />
        </View>
        <Text style={s.word} numberOfLines={1} adjustsFontSizeToFit>
          {item.letter === 'X' ? 'X is in Fox' : `${item.letter} is for ${item.word}`}
        </Text>
      </Card>
      <KeyGrid keys={KEYS} palette={tileColors} selected={idx} onPick={tap} label={(k) => `Letter ${k}`} />
    </Screen>
  );
}

const s = StyleSheet.create({
  preview: { height: 262, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16 },
  corner: { position: 'absolute', top: 12, right: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  big: { fontFamily: font.bold, fontSize: 150, lineHeight: 160, color: colors.ink, includeFontPadding: false },
  small: { fontSize: 90, color: colors.grapeDeep },
  word: { fontFamily: font.bold, fontSize: 34, color: colors.ink },
});
