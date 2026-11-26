import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { SvgXml } from 'react-native-svg';
import { WEAR_SVG } from '../assets/wear';
import type { Avatar as Kind, Wearing } from '../storage';
import { useStore } from '../store';

// Animated kids from LottieFiles (credits in src/credits.ts).
const SOURCES = {
  boy: require('../../assets/lottie/avatar-boy.json'),
  girl: require('../../assets/lottie/avatar-girl.json'),
};

// Where each slot sits on each character, as fractions of the square frame (center x, center y, width).
type Anchor = { x: number; y: number; w: number };
const ANCHORS: Record<Kind, Record<keyof Wearing, Anchor>> = {
  boy: { hat: { x: 0.47, y: 0.035, w: 0.34 }, glasses: { x: 0.51, y: 0.28, w: 0.3 }, shirt: { x: 0.53, y: 0.55, w: 0.34 } },
  girl: { hat: { x: 0.5, y: 0.1, w: 0.36 }, glasses: { x: 0.5, y: 0.36, w: 0.3 }, shirt: { x: 0.51, y: 0.58, w: 0.3 } },
};

// drawn back to front: shirt, then glasses, then hat
const ORDER: (keyof Wearing)[] = ['shirt', 'glasses', 'hat'];

/** An item that drops onto the kid with a bounce whenever it changes. */
function Worn({ id, a, size }: { id: string; a: Anchor; size: number }) {
  const [drop] = useState(() => new Animated.Value(0));
  useEffect(() => {
    drop.setValue(0);
    Animated.spring(drop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }).start();
  }, [id, drop]);
  const w = a.w * size;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.item,
        {
          width: w,
          height: w,
          left: a.x * size - w / 2,
          top: a.y * size - w / 2,
          opacity: drop,
          transform: [
            { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-size * 0.35, 0] }) },
            { scale: drop.interpolate({ inputRange: [0, 1], outputRange: [1.6, 1] }) },
          ],
        },
      ]}
    >
      <SvgXml xml={WEAR_SVG[id]} width={w} height={w} />
    </Animated.View>
  );
}

export function Avatar({ size, kind, wearing }: { size: number; kind?: Kind; wearing?: Wearing }) {
  const store = useStore();
  const who = kind ?? store.avatar ?? 'girl';
  const clothes = wearing ?? store.wearing;
  return (
    <View style={{ width: size, height: size }}>
      <LottieView source={SOURCES[who]} autoPlay loop style={{ width: size, height: size }} />
      {ORDER.map((slot) => {
        const id = clothes[slot];
        return id && WEAR_SVG[id] ? <Worn key={slot} id={id} a={ANCHORS[who][slot]} size={size} /> : null;
      })}
    </View>
  );
}

const s = StyleSheet.create({
  item: { position: 'absolute' },
});
