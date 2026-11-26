import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { Sticker } from '../components/ui';
import { StarIcon } from '../components/art';
import { CARTOONS, LEVEL_BONUS, LEVELS_PER_GAME, worldOf } from '../levels';
import { colors, font, hard, outline } from '../theme';
import { sfx } from '../sound';
import { speak } from '../speak';

/** The reward after a level: a cartoon plays, then back to the map to walk to the next stop. */
export function LevelComplete({ level, onMap }: { level: number; onMap: () => void }) {
  const { width } = useWindowDimensions();
  const [pop] = useState(() => new Animated.Value(0));
  const next = level + 1;
  const newWorld = next < LEVELS_PER_GAME && worldOf(next) !== worldOf(level);

  useEffect(() => {
    sfx('levelup');
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
    speak(
      newWorld
        ? `Level ${level + 1} done! You found a new land, ${worldOf(next).name}!`
        : `Hooray! Level ${level + 1} done! Here are ${LEVEL_BONUS} stars!`,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartoon = CARTOONS[level % CARTOONS.length];
  const size = Math.min(width - 40, 360);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: worldOf(level).sky }]}>
      <Animated.Text style={[s.title, { transform: [{ scale: pop }] }]} accessibilityRole="header">
        Level {level + 1} done!
      </Animated.Text>
      <View style={[s.stage, outline, hard(6), { width: size, height: size }]}>
        <LottieView source={cartoon} autoPlay loop style={{ width: size - 20, height: size - 20 }} />
      </View>
      <Animated.View style={[s.pill, outline, hard(4), { transform: [{ scale: pop }] }]}>
        <StarIcon size={30} />
        <Text style={s.pillText}>+{LEVEL_BONUS} stars</Text>
      </Animated.View>
      {newWorld ? <Text style={s.world}>Next: {worldOf(next).name}!</Text> : <View style={{ height: 30 }} />}
      <Sticker color={colors.grass} r={38} style={s.btn} onPress={onMap} accessibilityLabel="Back to the map">
        <Text style={s.btnText}>To the map</Text>
      </Sticker>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontFamily: font.bold, fontSize: 44, color: colors.ink, textAlign: 'center' },
  stage: { backgroundColor: '#fff', borderRadius: 40, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: colors.sun,
  },
  pillText: { fontFamily: font.bold, fontSize: 26, color: colors.ink },
  world: { fontFamily: font.bold, fontSize: 22, color: colors.ink },
  btn: { alignSelf: 'stretch', height: 76 },
  btnText: { fontFamily: font.bold, fontSize: 30, color: colors.ink },
});
