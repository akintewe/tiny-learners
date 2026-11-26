import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Card, SpeakDot } from '../components/ui';
import { Celebrate } from '../components/Quiz';
import { STROKES, Pt, resample } from '../strokes';
import { letterItem, NUMBER_WORDS } from '../data';
import { colors, font, outline } from '../theme';
import { speak } from '../speak';
import { sfx } from '../sound';
import { useStore } from '../store';
import type { LevelProps } from './types';

const ALL_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const INK_COLORS = [colors.sky, colors.berry, colors.grape, colors.tangerine, colors.grass];

const TOL = 13; // how close (in grid units) the finger must stay to the path
const AHEAD = 6; // how many points ahead the finger may jump

function sayGlyph(g: string) {
  if (/\d/.test(g)) speak(`Trace the number ${NUMBER_WORDS[Number(g)]}.`);
  else speak(`Trace the letter ${g}. ${letterItem(g).letter} says ${letterItem(g).sound}.`);
}

const pts = (p: Pt[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

export function Trace({ level, onBack, onFinish }: LevelProps) {
  const { addStar } = useStore();
  // three letters or numbers per level: A to Z, then 0 to 9
  const glyphs = ALL_KEYS.slice(level * 3, level * 3 + 3);
  const [step, setStep] = useState(0);
  const [won, setWon] = useState(false);
  const glyph = glyphs[step] ?? 'A';

  useEffect(() => {
    sayGlyph(glyphs[0] ?? 'A');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = () => {
    if (step + 1 >= glyphs.length) {
      onFinish();
      return;
    }
    setWon(false);
    setStep(step + 1);
    sayGlyph(glyphs[step + 1]);
  };

  if (won) return <Celebrate earned title="Great tracing!" onNext={goNext} onBack={onBack} />;

  return (
    <Screen title="Trace it!" onBack={onBack}>
      <View style={s.modes}>
        {glyphs.map((g, i) => (
          <View
            key={g}
            style={[s.step, outline, { backgroundColor: i < step ? colors.grass : i === step ? colors.grape : '#fff' }]}
          >
            <Text style={s.stepText}>{g}</Text>
          </View>
        ))}
        <View style={{ flex: 1 }} />
        <SpeakDot onPress={() => sayGlyph(glyph)} color={colors.grape} />
      </View>

      <Board
        key={glyph}
        glyph={glyph}
        onDone={() => {
          addStar();
          setWon(true);
        }}
      />
    </Screen>
  );
}

function Board({ glyph, onDone }: { glyph: string; onDone: () => void }) {
  const strokes = useMemo(() => (STROKES[glyph] ?? []).map((st) => resample(st)), [glyph]);
  const color = useMemo(() => INK_COLORS[glyph.charCodeAt(0) % INK_COLORS.length], [glyph]);
  const [size, setSize] = useState(0);
  const [stroke, setStroke] = useState(0);
  const [prog, setProg] = useState(0);
  const view = useRef<React.ComponentRef<typeof View>>(null);

  // gesture handlers read these, so keep them in refs too
  const st = useRef({ stroke: 0, prog: 0, tracking: false, ox: 0, oy: 0, scale: 1, finished: false });

  const measure = () => {
    // measure() reports page coordinates, the same space as touch pageX/pageY
    // (measureInWindow is offset by the status bar on edge-to-edge Android)
    view.current?.measure((_x, _y, w, _h, pageX, pageY) => {
      st.current.ox = pageX;
      st.current.oy = pageY;
      st.current.scale = w / 100;
    });
  };

  const handle = (pageX: number, pageY: number) => {
    const g = st.current;
    if (g.finished) return;
    const x = (pageX - g.ox) / g.scale;
    const y = (pageY - g.oy) / g.scale;
    const line = strokes[g.stroke];
    const here = line[g.prog];
    if (!g.tracking) {
      if (Math.hypot(x - here[0], y - here[1]) < TOL + 4) g.tracking = true;
      else return;
    }
    let best = -1;
    for (let j = g.prog; j <= Math.min(line.length - 1, g.prog + AHEAD); j++) {
      if (Math.hypot(x - line[j][0], y - line[j][1]) < TOL) best = j;
    }
    if (best < 0) {
      g.tracking = false; // wandered off; pick up again from the dot
      return;
    }
    if (best > g.prog) {
      g.prog = best;
      setProg(best);
    }
    if (g.prog >= line.length - 1) {
      Haptics.selectionAsync().catch(() => {});
      if (g.stroke >= strokes.length - 1) {
        g.finished = true;
        onDone();
        return;
      }
      sfx('stroke');
      g.stroke += 1;
      g.prog = 0;
      g.tracking = false;
      setStroke(g.stroke);
      setProg(0);
    }
  };

  const onGrant = (e: GestureResponderEvent) => {
    measure();
    st.current.tracking = false;
    handle(e.nativeEvent.pageX, e.nativeEvent.pageY);
  };
  const onMove = (e: GestureResponderEvent) => handle(e.nativeEvent.pageX, e.nativeEvent.pageY);
  const onRelease = () => {
    st.current.tracking = false;
  };

  const current = strokes[stroke] ?? [];
  const dot = current[prog] ?? [50, 50];

  return (
    <Card style={s.board}>
      <View
        style={s.fit}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setSize(Math.floor(Math.min(width, height)));
        }}
      >
      <View
        ref={view}
        style={{ width: size, height: size }}
        onLayout={measure}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={onGrant}
        onResponderMove={onMove}
        onResponderRelease={onRelease}
        accessibilityLabel={`Trace ${glyph} with your finger`}
      >
        {size > 0 && (
          <Svg width={size} height={size} viewBox="0 0 100 100">
            {strokes.map((p, i) => (
              <Polyline key={`g${i}`} points={pts(p)} fill="none" stroke="#EEE5CF" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {strokes.map((p, i) => (
              <Polyline key={`d${i}`} points={pts(p)} fill="none" stroke="#BDB197" strokeWidth={1.4} strokeDasharray="2 3" />
            ))}
            {strokes.slice(0, stroke).map((p, i) => (
              <Polyline key={`f${i}`} points={pts(p)} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {prog > 0 && (
              <Polyline points={pts(current.slice(0, prog + 1))} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
            )}
            <Circle cx={dot[0]} cy={dot[1]} r={7} fill={colors.grass} stroke={colors.ink} strokeWidth={2.2} />
            <SvgText x={dot[0]} y={dot[1] + 3.6} textAnchor="middle" fontSize={10} fill={colors.ink} fontFamily={font.bold}>
              {stroke + 1}
            </SvgText>
          </Svg>
        )}
      </View>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  modes: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: font.bold, fontSize: 28, color: colors.ink },
  board: { flex: 1, padding: 12, alignItems: 'center', justifyContent: 'center' },
  fit: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
});
