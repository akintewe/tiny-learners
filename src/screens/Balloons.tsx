import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { PipSays } from '../components/ui';
import { Balloon } from '../components/art';
import { Celebrate } from '../components/Quiz';
import { NUMBER_WORDS, shuffle } from '../data';
import { colors } from '../theme';
import { speak } from '../speak';
import { sfx } from '../sound';
import { useStore } from '../store';
import type { LevelProps } from './types';

const COLORS = [colors.berry, colors.sky, colors.sun, colors.grass, colors.grape, colors.tangerine];

type Spot = { n: number; x: number; y: number; color: string; delay: number };

function layout(count: number, w: number, h: number): { spots: Spot[]; size: number } {
  const cols = 3;
  const rows = Math.ceil(count / cols) + (count > 6 ? 0 : 1);
  const cw = w / cols;
  const ch = h / rows;
  const size = Math.min(cw * 0.8, (ch / 1.35) * 0.9);
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, count);
  const spots = cells.map((c, i) => {
    const col = c % cols;
    const row = Math.floor(c / cols);
    const spareX = cw - size;
    const spareY = ch - size * 1.35;
    return {
      n: i + 1,
      x: col * cw + Math.random() * spareX,
      y: row * ch + Math.random() * Math.max(0, spareY),
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 900,
    };
  });
  return { spots, size };
}

function Floaty({ spot, size, popped, wobble, onPress }: {
  spot: Spot;
  size: number;
  popped: boolean;
  wobble: number;
  onPress: () => void;
}) {
  const [y] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));
  const [shake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(spot.delay),
        Animated.timing(y, { toValue: -8, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y, spot.delay]);

  useEffect(() => {
    if (popped) Animated.timing(scale, { toValue: 0, duration: 160, useNativeDriver: true }).start();
  }, [popped, scale]);

  useEffect(() => {
    if (!wobble) return;
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  }, [wobble, shake]);

  const rotate = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });

  return (
    <Animated.View
      pointerEvents={popped ? 'none' : 'auto'}
      style={[s.spot, { left: spot.x, top: spot.y, transform: [{ translateY: y }, { scale }, { rotate }] }]}
    >
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Balloon ${spot.n}`}>
        <Balloon size={size} color={spot.color} label={String(spot.n)} />
      </Pressable>
    </Animated.View>
  );
}

export function Balloons({ level, onBack, onFinish }: LevelProps) {
  const { addStar } = useStore();
  // more balloons as the levels go up
  const [count] = useState(level < 3 ? 5 : level < 7 ? 7 : 10);
  const [area, setArea] = useState<{ w: number; h: number } | null>(null);
  const [next, setNext] = useState(1);
  const [misses, setMisses] = useState(0);
  const [wobbles, setWobbles] = useState<Record<number, number>>({});
  const [won, setWon] = useState(false);

  const { spots, size } = useMemo(
    () => (area ? layout(count, area.w, area.h) : { spots: [], size: 0 }),
    [area, count],
  );

  useEffect(() => {
    speak(`Pop the balloons in order. Start with ${NUMBER_WORDS[1]}!`);
  }, []);

  const tap = (n: number) => {
    if (n === next) {
      sfx('pop');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      speak(NUMBER_WORDS[n]);
      if (n === count) {
        if (misses === 0) addStar();
        setTimeout(() => setWon(true), 500);
      }
      setNext(n + 1);
    } else {
      sfx('wrong');
      setMisses((m) => m + 1);
      setWobbles((w) => ({ ...w, [n]: (w[n] ?? 0) + 1 }));
      speak(`That is ${NUMBER_WORDS[n]}. Find ${NUMBER_WORDS[next]}.`);
    }
  };

  if (won) return <Celebrate earned={misses === 0} onNext={onFinish} onBack={onBack} />;

  return (
    <Screen title="Pop!" onBack={onBack}>
      <PipSays size={56}>Find {next > count ? count : next}!</PipSays>
      <View style={s.sky} onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {spots.map((sp) => (
          <Floaty
            key={sp.n}
            spot={sp}
            size={size}
            popped={sp.n < next}
            wobble={wobbles[sp.n] ?? 0}
            onPress={() => tap(sp.n)}
          />
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  sky: { flex: 1 },
  spot: { position: 'absolute' },
});
