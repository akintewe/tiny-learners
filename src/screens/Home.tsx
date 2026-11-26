import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, outline, radius, text } from '../theme';
import { speak } from '../speak';
import { Balloon, BobbingPip, LockIcon, MagnifierIcon, PencilIcon, Shape, SpeakerIcon, StarIcon } from '../components/art';
import { playMusic } from '../sound';
import { StarBadge, Sticker } from '../components/ui';

export type Route =
  | 'home'
  | 'letters'
  | 'numbers'
  | 'findLetter'
  | 'countQuiz'
  | 'trace'
  | 'match'
  | 'firstSound'
  | 'more'
  | 'shapes'
  | 'balloons'
  | 'shop'
  | 'parent';

type Props = { go: (r: Route) => void };

function Dots({ n = 3, size = 24 }: { n?: number; size?: number }) {
  return (
    <View style={[s.art, s.dots]}>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[s.dot, { width: size, height: size, borderRadius: size / 2 }]} />
      ))}
    </View>
  );
}

type Tile = { route: Route; label: string; color: string; say: string; art: () => React.ReactNode };

// art is a function so the styles below exist by the time it runs
const TILES: Tile[] = [
  { route: 'letters', label: 'Letters', color: colors.sky, say: 'Letters', art: () => <Text style={[s.glyph, { fontSize: 72 }]}>Aa</Text> },
  { route: 'numbers', label: 'Numbers', color: colors.grass, say: 'Numbers', art: () => <Text style={[s.glyph, { fontSize: 58 }]}>123</Text> },
  { route: 'trace', label: 'Trace it!', color: colors.grape, say: 'Trace it', art: () => <PencilIcon size={80} /> },
  { route: 'firstSound', label: 'First sound', color: colors.sun, say: 'First sound', art: () => (
    <View style={s.soundArt}>
      <SpeakerIcon size={40} />
      <Text style={[s.glyph, { fontSize: 60 }]}>b</Text>
    </View>
  ) },
  { route: 'findLetter', label: 'Find it!', color: colors.berry, say: 'Find the letter', art: () => <MagnifierIcon size={80} /> },
  { route: 'match', label: 'Match it!', color: colors.tangerine, say: 'Match big and little letters', art: () => <Text style={[s.glyph, { fontSize: 64 }]}>Bb</Text> },
  { route: 'countQuiz', label: 'Count it!', color: colors.tangerine, say: 'Count it', art: () => <Dots /> },
  { route: 'balloons', label: 'Pop!', color: colors.sky, say: 'Pop the balloons', art: () => <Balloon size={56} color={colors.berry} label="1" /> },
  { route: 'more', label: 'Which is more?', color: colors.grass, say: 'Which is more?', art: () => (
    <View style={s.moreArt}>
      <Dots n={2} size={18} />
      <Dots n={4} size={18} />
    </View>
  ) },
  { route: 'shapes', label: 'Shapes', color: colors.berry, say: 'Shapes and colors', art: () => (
    <View style={s.shapesArt}>
      <Shape shape="triangle" color="yellow" size={44} />
      <Shape shape="circle" color="blue" size={44} />
    </View>
  ) },
];

export function Home({ go }: Props) {
  useEffect(() => {
    playMusic('home');
    speak('Hi! What shall we learn today?');
  }, []);

  const rows: Tile[][] = [];
  for (let i = 0; i < TILES.length; i += 2) rows.push(TILES.slice(i, i + 2));

  return (
    <SafeAreaView style={s.root}>
      <View style={[s.blob, s.blobSun]} />
      <View style={[s.blob, s.blobGrass]} />

      <View style={s.header}>
        <Text style={[text.title, { letterSpacing: -0.5 }]} accessibilityRole="header">
          Tiny Learners
        </Text>
        <StarBadge />
      </View>

      <View style={s.says}>
        <BobbingPip size={84} />
        <View style={[s.bubble, outline]}>
          <Text style={[text.body, { lineHeight: 26 }]}>Hi! What shall we learn today?</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
        {rows.map((row, ri) => (
          <View key={ri} style={s.gridRow}>
            {row.map((t) => (
              <Sticker
                key={t.route}
                color={t.color}
                r={radius.card}
                style={s.tile}
                accessibilityLabel={t.label}
                onPress={() => {
                  speak(t.say);
                  go(t.route);
                }}
              >
                <View style={s.art}>{t.art()}</View>
                <Text style={s.label} numberOfLines={1} adjustsFontSizeToFit>
                  {t.label}
                </Text>
              </Sticker>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={s.bottom}>
        <Sticker color={colors.sun} r={28} lift={4} style={s.dress} onPress={() => go('shop')} accessibilityLabel="Shop">
          <View style={s.row}>
            <StarIcon size={30} fill="#fff" stroke={8} />
            <Text style={s.dressText}>Shop</Text>
          </View>
        </Sticker>
        <Sticker lift={0} r={24} style={s.parent} onPress={() => go('parent')} accessibilityLabel="For grown ups">
          <View style={s.row}>
            <LockIcon />
            <Text style={s.parentText}>Grown ups</Text>
          </View>
        </Sticker>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', borderRadius: 999 },
  blobSun: { top: -70, right: -60, width: 220, height: 220, backgroundColor: colors.sunSoft },
  blobGrass: { bottom: -90, left: -70, width: 240, height: 240, backgroundColor: colors.grassSoft },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  says: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bubble: { flex: 1, backgroundColor: colors.card, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16 },
  scroll: { flex: 1, marginHorizontal: -20 },
  grid: { gap: 16, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 14 },
  gridRow: { flexDirection: 'row', gap: 16 },
  tile: { flex: 1, height: 150, gap: 8, paddingHorizontal: 8 },
  glyph: { fontFamily: font.bold, color: colors.ink, includeFontPadding: false },
  art: { height: 84, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { backgroundColor: '#fff', borderWidth: 3, borderColor: colors.ink },
  soundArt: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moreArt: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  shapesArt: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: font.bold, fontSize: 24, color: colors.ink },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dress: { height: 60, paddingHorizontal: 16 },
  dressText: { fontFamily: font.bold, fontSize: 20, color: colors.ink },
  parent: { height: 56, paddingHorizontal: 18 },
  parentText: { fontFamily: font.semibold, fontSize: 16, color: colors.ink },
});
