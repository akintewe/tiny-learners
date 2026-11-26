import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, text } from '../theme';
import { HomeButton, StarBadge } from './ui';

type Props = {
  title?: string;
  /** Hide the star badge (grown-up screens). */
  noStars?: boolean;
  onBack: () => void;
  bg?: string;
  /** Drawn behind the content, for decoration like confetti. */
  backdrop?: React.ReactNode;
  children: React.ReactNode;
};

export function Screen({ title, noStars, onBack, bg = colors.cream, backdrop, children }: Props) {
  return (
    <SafeAreaView style={[s.root, { backgroundColor: bg }]} edges={['top', 'bottom', 'left', 'right']}>
      {backdrop}
      <View style={s.top}>
        <HomeButton onPress={onBack} />
        {title ? (
          <Text style={text.title} accessibilityRole="header">
            {title}
          </Text>
        ) : null}
        {noStars ? <View style={s.spacer} /> : <StarBadge />}
      </View>
      <View style={s.body}>{children}</View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, overflow: 'hidden' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  spacer: { width: 56 },
  body: { flex: 1, gap: 16 },
});
