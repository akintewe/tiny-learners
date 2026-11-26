import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { Avatar } from '../components/Avatar';
import { Candy } from '../components/Candy';
import { LockIcon, StarIcon } from '../components/art';
import { HomeButton, StarBadge, Sticker } from '../components/ui';
import { GameId, GAMES, LEVELS_PER_GAME, LEVELS_PER_WORLD, WORLDS, worldOf } from '../levels';
import { colors, font, hard, outline } from '../theme';
import { playMusic, sfx } from '../sound';
import { speak } from '../speak';
import { useStore } from '../store';

const GAP = 150; // vertical distance between stops
const TOP = 230; // room above the last stop for the finish cake
const BOTTOM = 190;
const NODE = 76;
const KID = 112;

type Props = { game: GameId; onPlay: (level: number) => void; onBack: () => void; onShop: () => void };

export function LevelMap({ game, onPlay, onBack, onShop }: Props) {
  const { width, height: screenH } = useWindowDimensions();
  const store = useStore();
  const done = store.levels[game] ?? 0;
  const current = Math.min(done, LEVELS_PER_GAME - 1);
  const allDone = done >= LEVELS_PER_GAME;
  const height = TOP + (LEVELS_PER_GAME - 1) * GAP + BOTTOM;
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);

  // stops wind left and right up the map, level 1 at the bottom
  const stops = useMemo(
    () =>
      Array.from({ length: LEVELS_PER_GAME }, (_, i) => ({
        x: width / 2 + Math.sin(i * 1.15) * width * 0.27,
        y: height - BOTTOM - i * GAP,
      })),
    [width, height],
  );

  const path = useMemo(() => {
    let d = `M ${stops[0].x} ${stops[0].y + 120}`;
    d += ` L ${stops[0].x} ${stops[0].y}`;
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1];
      const b = stops[i];
      const my = (a.y + b.y) / 2;
      d += ` C ${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
    }
    return d;
  }, [stops]);

  // the kid walks from the old stop to the new one right after a level
  const walk = store.justFinished?.game === game ? store.justFinished.level : null;
  const startAt = walk !== null && walk < current ? walk : current;
  const [pos] = useState(() => new Animated.ValueXY({ x: stops[startAt].x, y: stops[startAt].y }));
  const [hop] = useState(() => new Animated.Value(0));

  useEffect(() => {
    playMusic(worldOf(current).music);
  }, [current]);

  useEffect(() => {
    const target = stops[current];
    if (startAt !== current) {
      sfx('stroke');
      Animated.parallel([
        Animated.timing(pos, { toValue: target, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.sequence(
          [0, 1, 2].flatMap(() => [
            Animated.timing(hop, { toValue: -26, duration: 210, useNativeDriver: false }),
            Animated.timing(hop, { toValue: 0, duration: 210, useNativeDriver: false }),
          ]),
        ),
      ]).start(() => {
        sfx('star');
        if (worldOf(current) !== worldOf(startAt)) speak(`Welcome to ${worldOf(current).name}!`);
        else speak(`Level ${current + 1}!`);
      });
    } else {
      pos.setValue(target);
      speak(allDone ? 'You finished every level! Play any level again.' : `Level ${current + 1}. Tap the glowing stop to play!`);
    }
    store.clearJustFinished();
    // run once per arrival on the map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the stop to play now gently pulses
  const [pulse] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const bands = WORLDS.map((w, wi) => {
    const first = wi * LEVELS_PER_WORLD;
    const last = Math.min(LEVELS_PER_GAME - 1, first + LEVELS_PER_WORLD - 1);
    const bottom = wi === 0 ? height : stops[first].y + GAP / 2;
    const top = wi === WORLDS.length - 1 ? 0 : stops[last].y - GAP / 2;
    return { w, top, bottom, first };
  });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: worldOf(current).sky }]} edges={['top', 'bottom']}>
      <View style={s.header}>
        <HomeButton onPress={onBack} />
        <Text style={s.title} numberOfLines={1}>
          {GAMES[game].title}
        </Text>
        <StarBadge />
      </View>

      <ScrollView
        ref={scroll}
        style={s.flex}
        contentContainerStyle={{ height }}
        showsVerticalScrollIndicator={false}
        onLayout={() => scroll.current?.scrollTo({ y: Math.max(0, stops[startAt].y - screenH * 0.55), animated: false })}
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {bands.map((b) => (
            <Rect key={b.w.name} x={0} y={b.top} width={width} height={b.bottom - b.top} fill={b.w.sky} />
          ))}
          <Path d={path} stroke={colors.ink} strokeWidth={30} fill="none" strokeLinecap="round" />
          <Path d={path} stroke="#FFFFFF" strokeWidth={24} fill="none" strokeLinecap="round" />
          <Path d={path} stroke="#FF8FC0" strokeWidth={24} fill="none" strokeDasharray="16 16" />
        </Svg>

        {/* candy along both sides of the path */}
        {stops.map((p, i) => {
          const w = worldOf(i);
          const left = p.x > width / 2;
          const a = w.deco[i % w.deco.length];
          const b = w.deco[(i + 3) % w.deco.length];
          return (
            <React.Fragment key={`deco${i}`}>
              <View style={[s.abs, { left: left ? 14 : width - 84, top: p.y - 64 }]} pointerEvents="none">
                <Candy name={a} size={70} />
              </View>
              <View style={[s.abs, { left: left ? 70 : width - 140, top: p.y + 30 }]} pointerEvents="none">
                <Candy name={b} size={48} />
              </View>
            </React.Fragment>
          );
        })}

        {/* world signs */}
        {bands.map((b, wi) => (
          <View key={`sign${wi}`} style={[s.sign, outline, hard(4), { top: stops[b.first].y + 54, left: width / 2 - 110, backgroundColor: b.w.node }]}>
            <Text style={s.signText}>{b.w.name}</Text>
          </View>
        ))}

        {/* finish cake */}
        <View style={[s.abs, { left: width / 2 - 60, top: 40, alignItems: 'center' }]} pointerEvents="none">
          <Candy name="cake" size={120} />
          <Text style={s.finish}>{allDone ? 'You did it!' : 'The big cake!'}</Text>
        </View>

        {stops.map((p, i) => {
          const finished = i < done;
          const isNow = i === current && !allDone;
          const locked = i > current;
          const w = worldOf(i);
          const node = (
            <View
              style={[
                s.node,
                outline,
                locked ? s.locked : hard(5),
                { backgroundColor: finished ? w.node : isNow ? '#fff' : locked ? '#E7E2D6' : w.node },
              ]}
            >
              {finished ? <StarIcon size={26} fill={colors.sun} stroke={8} /> : locked ? <LockIcon size={24} /> : null}
              <Text style={[s.nodeText, finished && { fontSize: 18 }]}>{i + 1}</Text>
            </View>
          );
          return (
            <Pressable
              key={`stop${i}`}
              disabled={locked}
              onPress={() => {
                sfx('tap');
                onPlay(i);
              }}
              accessibilityRole="button"
              accessibilityLabel={locked ? `Level ${i + 1}, locked` : `Play level ${i + 1}`}
              style={[s.abs, { left: p.x - NODE / 2, top: p.y - NODE / 2 }]}
            >
              {isNow ? <Animated.View style={{ transform: [{ scale: pulse }] }}>{node}</Animated.View> : node}
            </Pressable>
          );
        })}

        {/* the child's own character stands on their stop */}
        <Animated.View
          pointerEvents="none"
          style={[
            s.abs,
            {
              left: Animated.add(pos.x, -KID / 2),
              top: Animated.add(Animated.add(pos.y, -NODE / 2 - KID + 16), hop),
            },
          ]}
        >
          <Avatar size={KID} />
        </Animated.View>
      </ScrollView>

      <View style={s.bottom}>
        <Sticker color={colors.sun} r={28} lift={4} style={s.shop} onPress={onShop} accessibilityLabel="Shop">
          <Text style={s.shopText}>Shop</Text>
        </Sticker>
        <Sticker
          color={colors.grass}
          r={34}
          style={s.play}
          onPress={() => onPlay(allDone ? LEVELS_PER_GAME - 1 : current)}
          accessibilityLabel={`Play level ${current + 1}`}
        >
          <Text style={s.playText}>Play level {current + 1}</Text>
        </Sticker>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  title: { flex: 1, textAlign: 'center', fontFamily: font.bold, fontSize: 28, color: colors.ink },
  abs: { position: 'absolute' },
  node: { width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  locked: { opacity: 0.85 },
  nodeText: { fontFamily: font.bold, fontSize: 26, color: colors.ink, includeFontPadding: false },
  sign: { position: 'absolute', width: 220, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  signText: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  finish: { fontFamily: font.bold, fontSize: 22, color: colors.ink, marginTop: 4 },
  bottom: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  shop: { height: 68, paddingHorizontal: 20 },
  shopText: { fontFamily: font.bold, fontSize: 22, color: colors.ink },
  play: { flex: 1, height: 68 },
  playText: { fontFamily: font.bold, fontSize: 26, color: colors.ink },
});
