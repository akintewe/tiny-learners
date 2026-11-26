import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { KeyGrid } from '../components/KeyGrid';
import { Card, SpeakDot } from '../components/ui';
import { BigStar } from '../components/art';
import { NUMBER_WORDS } from '../data';
import { colors, font, numberColors } from '../theme';
import { speak } from '../speak';

type Props = { onBack: () => void };

const KEYS = Array.from({ length: 21 }, (_, i) => String(i));

// Stars shrink as the count grows so up to 20 still fit in two rows.
function starSize(n: number) {
  if (n <= 6) return 42;
  if (n <= 10) return 28;
  return 24;
}

export function Numbers({ onBack }: Props) {
  const [n, setN] = useState(5);

  const tap = (i: number) => {
    setN(i);
    Haptics.selectionAsync().catch(() => {});
    speak(NUMBER_WORDS[i]);
  };

  const size = starSize(n);

  return (
    <Screen title="Numbers" onBack={onBack}>
      <Card style={s.preview}>
        <View style={s.corner}>
          <SpeakDot onPress={() => speak(NUMBER_WORDS[n])} color={colors.grass} />
        </View>
        <Text style={[s.big, n > 9 && { fontSize: 108, lineHeight: 112 }]}>{n}</Text>
        <View style={[s.stars, { gap: size > 30 ? 8 : 4 }]}>
          {Array.from({ length: n }, (_, i) => (
            <BigStar key={i} size={size} />
          ))}
        </View>
        <Text style={s.word}>{NUMBER_WORDS[n]}</Text>
      </Card>
      <KeyGrid
        keys={KEYS}
        palette={numberColors}
        selected={n}
        onPick={tap}
        label={(k) => `Number ${k}`}
        fontSize={30}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  preview: { height: 262, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 20 },
  corner: { position: 'absolute', top: 12, right: 12 },
  big: { fontFamily: font.bold, fontSize: 132, lineHeight: 136, color: colors.ink, includeFontPadding: false },
  stars: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 290 },
  word: { fontFamily: font.bold, fontSize: 30, color: colors.ink },
});
