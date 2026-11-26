import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../theme';
import { Sticker } from './ui';

type Props = {
  keys: string[];
  palette: string[];
  selected: number | null;
  onPick: (i: number) => void;
  label: (key: string) => string;
  fontSize?: number;
  columns?: number;
};

const GAP = 10;

/** A grid of square sticker keys. The picked key turns ink with its color as the text. */
export function KeyGrid({ keys, palette, selected, onPick, label, fontSize = 32, columns = 5 }: Props) {
  const [width, setWidth] = useState(0);
  const size = width ? Math.floor((width - GAP * (columns - 1)) / columns) : 0;

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      showsVerticalScrollIndicator={false}
    >
      {size > 0 && (
        <View style={s.grid}>
          {keys.map((k, i) => {
            const c = palette[i % palette.length];
            const on = selected === i;
            return (
              <Sticker
                key={k}
                color={c}
                r={radius.key}
                lift={4}
                selected={on}
                style={{ width: size, height: size }}
                onPress={() => onPick(i)}
                accessibilityLabel={label(k)}
              >
                <Text style={[s.key, { fontSize, color: on ? c : colors.ink }]}>{k}</Text>
              </Sticker>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  key: { fontFamily: font.bold, includeFontPadding: false },
});
