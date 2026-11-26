import React from 'react';
import { Text } from 'react-native';
import type { LetterItem } from '../data';
import { colors } from '../theme';
import { Apple, Ball } from './art';

// Drawn art for each word. Letters without a drawing yet fall back to their emoji
// until the full A to Z SVG set lands (CLAUDE.md, next step 2).
const DRAWN: Record<string, (size: number) => React.ReactNode> = {
  Apple: (size) => <Apple size={size} />,
  Ball: (size) => <Ball size={size} color={colors.sky} />,
};

export function ItemArt({ item, size }: { item: LetterItem; size: number }) {
  const draw = DRAWN[item.word];
  if (draw) return <>{draw(size)}</>;
  return (
    <Text style={{ fontSize: size * 0.78, lineHeight: size, textAlign: 'center' }} accessibilityLabel={item.word}>
      {item.emoji}
    </Text>
  );
}
