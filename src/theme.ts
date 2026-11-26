import type { TextStyle, ViewStyle } from 'react-native';

// "Sticker book" look. Source of truth: the Tiny Learners design canvas (see CLAUDE.md).
export const colors = {
  ink: '#2B2B3A',
  cream: '#FFF6DD',
  card: '#FFFFFF',
  sun: '#FFC93C',
  sky: '#6CC3F0',
  grass: '#7ED58B',
  berry: '#FF7A93',
  grape: '#B196FF',
  tangerine: '#FF9F45',
  // soft tints used for backgrounds and decoration
  sunSoft: '#FFE29A',
  grassSoft: '#D5F0D9',
  grapeDeep: '#7B5CE0',
  apple: '#FF6B6B',
};

export const tileColors = [
  colors.sky,
  colors.grass,
  colors.berry,
  colors.grape,
  colors.tangerine,
  colors.sun,
];

export const numberColors = [
  colors.grass,
  colors.sky,
  colors.tangerine,
  colors.berry,
  colors.grape,
  colors.sun,
];

// Fredoka is loaded per weight, so pick the family instead of using fontWeight.
export const font = {
  medium: 'Fredoka_500Medium',
  semibold: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
};

export const radius = { key: 20, button: 28, card: 32 };

export const BORDER = 3;

/** Hard drop shadow with no blur, like a sticker lifted off the page. */
export function hard(y: number): ViewStyle {
  return { boxShadow: `0px ${y}px 0px ${colors.ink}` };
}

export const outline: ViewStyle = { borderWidth: BORDER, borderColor: colors.ink };

export const text = {
  title: { fontFamily: font.bold, fontSize: 30, color: colors.ink } as TextStyle,
  body: { fontFamily: font.semibold, fontSize: 22, color: colors.ink } as TextStyle,
  label: { fontFamily: font.medium, fontSize: 16, color: colors.ink } as TextStyle,
};
