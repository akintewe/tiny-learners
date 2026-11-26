import React, { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { colors, font } from '../theme';
import { COLOR_NAMES, ColorName, ShapeName } from '../data';

const ink = colors.ink;
const STAR = '50,8 61,36 92,38 68,57 76,88 50,71 24,88 32,57 8,38 39,36';
const PIP = '50,6 62,36 94,38 69,58 78,90 50,72 22,90 31,58 6,38 38,36';

type Sized = { size?: number };

// ---------- Pip, the star mascot ----------

export type PipMood = 'happy' | 'cheer' | 'unsure' | 'sleepy';

/** Blinks every few seconds. */
function useBlink(enabled: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setClosed(true);
        t = setTimeout(() => {
          setClosed(false);
          loop();
        }, 140);
      }, 2500 + Math.random() * 2500);
    };
    loop();
    return () => clearTimeout(t);
  }, [enabled]);
  return closed;
}

export function Pip({ size = 92, mood = 'happy' }: Sized & { mood?: PipMood }) {
  const closed = useBlink(mood === 'happy' || mood === 'unsure');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Pip the star">
      <Polygon
        points={PIP}
        fill={colors.sun}
        stroke={ink}
        strokeWidth={mood === 'cheer' ? 5 : 6}
        strokeLinejoin="round"
      />
      {mood === 'sleepy' ? (
        <>
          <Path d="M36 50q5 5 10 0" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M54 50q5 5 10 0" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <Circle cx={50} cy={62} r={3.5} fill={ink} />
          <SvgText x={74} y={30} fontSize={16} fill={ink} fontFamily={font.bold}>
            z
          </SvgText>
          <SvgText x={82} y={18} fontSize={12} fill={ink} fontFamily={font.bold}>
            z
          </SvgText>
        </>
      ) : mood === 'cheer' ? (
        <>
          <Path d="M36 47q5-6 10 0" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M54 47q5-6 10 0" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M40 56q10 14 20 0z" fill="#fff" stroke={ink} strokeWidth={3.5} strokeLinejoin="round" />
          <Circle cx={32} cy={56} r={4.5} fill={colors.berry} opacity={0.7} />
          <Circle cx={68} cy={56} r={4.5} fill={colors.berry} opacity={0.7} />
        </>
      ) : (
        <>
          {closed ? (
            <Path d="M37 50h8M55 50h8" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          ) : (
            <>
              <Circle cx={41} cy={50} r={4} fill={ink} />
              <Circle cx={59} cy={50} r={4} fill={ink} />
              <Circle cx={42.5} cy={48.5} r={1.4} fill="#fff" />
              <Circle cx={60.5} cy={48.5} r={1.4} fill="#fff" />
            </>
          )}
          {mood === 'unsure' ? (
            <Path d="M44 61q6-4 12 0" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          ) : (
            <>
              <Path d="M43 59q7 7 14 0" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
              <Circle cx={34} cy={58} r={4} fill={colors.berry} opacity={0.7} />
              <Circle cx={66} cy={58} r={4} fill={colors.berry} opacity={0.7} />
            </>
          )}
        </>
      )}
    </Svg>
  );
}

/** Pip gently bobbing up and down, for idle screens. */
export function BobbingPip(props: Sized & { mood?: PipMood }) {
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -6, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y]);
  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <Pip {...props} />
    </Animated.View>
  );
}

// ---------- Icons ----------

export function StarIcon({ size = 24, fill = '#fff', stroke = 8 }: Sized & { fill?: string; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points={STAR} fill={fill} stroke={ink} strokeWidth={stroke} strokeLinejoin="round" />
    </Svg>
  );
}

export function HomeIcon({ size = 28 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={colors.sun} stroke={ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function SpeakerIcon({ size = 26 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" stroke={ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 9v6h4l5 4V5L8 9z" />
      <Path d="M16.5 9a4 4 0 0 1 0 6" fill="none" />
      <Path d="M19 6.5a8 8 0 0 1 0 11" fill="none" />
    </Svg>
  );
}

export function LockIcon({ size = 20, fill = 'none', stroke = 2.4 }: Sized & { fill?: string; stroke?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={4} y={11} width={16} height={10} rx={2} fill={fill} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  );
}

export function CheckIcon({ size = 18 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function ArrowIcon({ size = 32 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function MagnifierIcon({ size = 92 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Line x1={62} y1={62} x2={88} y2={88} stroke={ink} strokeWidth={11} strokeLinecap="round" />
      <Circle cx={42} cy={42} r={28} fill="#fff" stroke={ink} strokeWidth={6} />
      <SvgText x={42} y={54} textAnchor="middle" fontSize={34} fill={ink} fontFamily={font.bold}>
        B
      </SvgText>
    </Svg>
  );
}

// ---------- Drawn objects ----------

export function Apple({ size = 112 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="An apple">
      <Path d="M50 30c-14-10-36-4-36 22 0 22 16 38 28 38 4 0 6-2 8-2s4 2 8 2c12 0 28-16 28-38 0-26-22-32-36-22z" fill={colors.apple} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M50 30c0-10 4-18 12-22" stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M58 18c6-8 16-8 22-4-4 8-14 10-22 4z" fill={colors.grass} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M26 50c2-8 8-12 14-12" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} />
    </Svg>
  );
}

export function Ball({ size = 92, color = colors.sky }: Sized & { color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="A ball">
      <Circle cx={50} cy={50} r={42} fill={color} stroke={ink} strokeWidth={5} />
      <Path d="M12 38c20 14 56 14 76 0" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <Path d="M12 62c20-14 56-14 76 0" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}

export function BigStar({ size = 92 }: Sized) {
  return <StarIcon size={size} fill={colors.sun} stroke={6} />;
}

/** Things a child can count. Each draws in a given color so a set reads as a group. */
export type CountThing = 'ball' | 'apple' | 'star';
export const COUNT_THINGS: CountThing[] = ['ball', 'apple', 'star'];
export const COUNT_NAMES: Record<CountThing, string> = { ball: 'balls', apple: 'apples', star: 'stars' };

export function Countable({ thing, size, color }: { thing: CountThing; size: number; color: string }) {
  if (thing === 'apple') return <Apple size={size} />;
  if (thing === 'star') return <BigStar size={size} />;
  return <Ball size={size} color={color} />;
}

// ---------- Shapes and colors ----------

export function Shape({ shape, color, size = 80 }: { shape: ShapeName; color: ColorName | string; size?: number }) {
  const fill = (COLOR_NAMES as Record<string, string>)[color] ?? color;
  const common = { fill, stroke: ink, strokeWidth: 5, strokeLinejoin: 'round' as const };
  let el: React.ReactNode;
  switch (shape) {
    case 'circle':
      el = <Circle cx={50} cy={50} r={40} {...common} />;
      break;
    case 'square':
      el = <Rect x={12} y={12} width={76} height={76} rx={6} {...common} />;
      break;
    case 'rectangle':
      el = <Rect x={6} y={26} width={88} height={48} rx={6} {...common} />;
      break;
    case 'triangle':
      el = <Polygon points="50,10 92,86 8,86" {...common} />;
      break;
    case 'star':
      el = <Polygon points={STAR} {...common} />;
      break;
    case 'heart':
      el = <Path d="M50 88C20 66 8 50 8 33 8 20 18 10 31 10c9 0 15 5 19 12 4-7 10-12 19-12 13 0 23 10 23 23 0 17-12 33-42 55z" {...common} />;
      break;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={`${color} ${shape}`}>
      {el}
    </Svg>
  );
}

export function Balloon({ size = 84, color, label }: { size?: number; color: string; label?: string }) {
  return (
    <Svg width={size} height={size * 1.35} viewBox="0 0 100 135">
      <Path d="M50 98q-6 14 4 22t-2 15" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={50} cy={50} rx={40} ry={46} fill={color} stroke={ink} strokeWidth={5} />
      <Polygon points="44,98 56,98 50,90" fill={color} stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M28 34q4-12 16-16" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
      {label ? (
        <SvgText x={50} y={66} textAnchor="middle" fontSize={44} fill={ink} fontFamily={font.bold}>
          {label}
        </SvgText>
      ) : null}
    </Svg>
  );
}

export function PencilIcon({ size = 92 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M30 78 L22 50 L50 12 L78 50" fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="2 10" strokeLinecap="round" />
      <Path d="M58 86l30-30-10-10-30 30-4 14z" fill={colors.sun} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
      <Path d="M44 90l4-14 10 10z" fill="#FFE2B8" stroke={ink} strokeWidth={4} strokeLinejoin="round" />
    </Svg>
  );
}

export function LockedIcon({ size = 28 }: Sized) {
  return <LockIcon size={size} fill="#fff" stroke={2.2} />;
}

/** A friendly "?" bubble, used where the picture should not give the answer away. */
export function QuestionIcon({ size = 120 }: Sized) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={42} fill={colors.grape} stroke={ink} strokeWidth={5} />
      <SvgText x={50} y={68} textAnchor="middle" fontSize={54} fill={ink} fontFamily={font.bold}>
        ?
      </SvgText>
    </Svg>
  );
}
