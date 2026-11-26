import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Screen } from './Screen';
import { Card, PipSays, SpeakButton, Sticker } from './ui';
import { ArrowIcon, Pip, StarIcon } from './art';
import { colors, font, hard, outline, radius } from '../theme';
import { speak } from '../speak';
import { sfx } from '../sound';
import { pick } from '../data';
import { useStore } from '../store';
import type { Skill } from '../storage';

export type Round = {
  key?: string; // progress key for the adaptive path, e.g. "L:B"
  say: string; // spoken prompt
  question: string; // shown under the art
  art: React.ReactNode; // the picture the child looks at
  options: string[];
  answer: string;
  explain: string; // spoken and shown when we reveal the answer
  /** Draw an option as a picture instead of text. */
  renderOption?: (opt: string) => React.ReactNode;
  optionHeight?: number;
};

export type MakeRound = (skills: Record<string, Skill>, unlocked: number, prevKey: string | undefined, level: number) => Round;

type Props = {
  title: string;
  makeRound: MakeRound;
  optionColors: string[];
  onBack: () => void;
  level: number;
  rounds: number;
  /** Called after the last round of the level. */
  onFinish: () => void;
};

type Phase = 'ask' | 'reveal' | 'win';

const CHEERS = ['Great job!', 'Yay!', 'Well done!', 'You got it!', 'Super!'];

export function Quiz({ title, makeRound, optionColors, onBack, level, rounds, onFinish }: Props) {
  const store = useStore();
  // keep the latest learning state for the next round without re-creating callbacks
  const latest = useRef(store);
  useEffect(() => {
    latest.current = store;
  });

  const [round, setRound] = useState<Round>(() => makeRound(store.skills, store.unlocked, undefined, level));
  const [played, setPlayed] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('ask');
  const [earned, setEarned] = useState(false);
  const [shake] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (played + 1 >= rounds) {
      onFinish();
      return;
    }
    setPlayed(played + 1);
    const st = latest.current;
    const r = makeRound(st.skills, st.unlocked, round.key, level);
    setRound(r);
    setWrong([]);
    setPhase('ask');
    setEarned(false);
    speak(r.say);
  }, [makeRound, round.key, played, rounds, onFinish, level]);

  useEffect(() => {
    speak(round.say);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const choose = (opt: string) => {
    if (phase !== 'ask') return;
    if (opt === round.answer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      // a star only for a first-try answer
      const first = wrong.length === 0;
      if (round.key) store.record(round.key, first);
      if (first) store.addStar();
      setEarned(first);
      setPhase('win');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    sfx('wrong');
    doShake();
    const w = [...wrong, opt];
    setWrong(w);
    if (w.length >= 2) {
      // one retry, then teach the answer and move on
      if (round.key) store.record(round.key, false);
      setPhase('reveal');
      speak(round.explain);
      timer.current = setTimeout(next, 4200);
    } else {
      speak('Almost! Let us try again.');
    }
  };

  if (phase === 'win') {
    return <Celebrate earned={earned} onNext={next} onBack={onBack} />;
  }

  const bubble =
    phase === 'reveal' ? (
      <PipSays mood="happy">{round.explain}</PipSays>
    ) : wrong.length > 0 ? (
      <PipSays mood="unsure">Almost! Let us try again.</PipSays>
    ) : null;

  const tall = round.optionHeight ?? 116;

  return (
    <Screen title={title} onBack={onBack}>
      <Progress done={played} total={rounds} />
      {bubble}
      <Card style={s.card}>
        <Animated.View style={[s.art, { transform: [{ translateX: shake }] }]}>{round.art}</Animated.View>
        <Text style={s.question}>{round.question}</Text>
        <SpeakButton onPress={() => speak(round.say)} />
      </Card>
      <View style={s.options}>
        {round.options.map((o, i) => {
          const c = optionColors[i % optionColors.length];
          const isAnswer = phase === 'reveal' && o === round.answer;
          return (
            <Sticker
              key={o}
              quiet
              color={round.renderOption ? colors.card : c}
              r={radius.button}
              style={[s.opt, { height: tall }, isAnswer && round.renderOption && s.optReveal]}
              faded={wrong.includes(o)}
              selected={isAnswer && !round.renderOption}
              disabled={phase !== 'ask'}
              onPress={() => choose(o)}
              accessibilityLabel={`Answer ${o}`}
            >
              {round.renderOption ? (
                round.renderOption(o)
              ) : (
                <Text style={[s.optText, isAnswer && { color: c }]}>{o}</Text>
              )}
            </Sticker>
          );
        })}
      </View>
    </Screen>
  );
}

/** A row of dots showing how far through the level the child is. */
function Progress({ done, total }: { done: number; total: number }) {
  if (total <= 1) return null;
  return (
    <View style={s.progress} accessibilityLabel={`Question ${done + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[s.dot, outline, { backgroundColor: i < done ? colors.grass : i === done ? colors.sun : '#fff' }]} />
      ))}
    </View>
  );
}

// ---------- "Great job!" screen ----------

const CONFETTI: { top: number; left: `${number}%`; color: string; bar?: boolean; rot?: string }[] = [
  { top: 90, left: '9%', color: colors.berry },
  { top: 60, left: '77%', color: colors.sky, bar: true, rot: '30deg' },
  { top: 180, left: '85%', color: colors.sun },
  { top: 150, left: '15%', color: colors.grape, bar: true, rot: '-25deg' },
  { top: 280, left: '6%', color: colors.tangerine },
  { top: 300, left: '87%', color: colors.berry, bar: true, rot: '50deg' },
  { top: 40, left: '46%', color: colors.grape },
];

function Confetti() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CONFETTI.map((c, i) => (
        <View
          key={i}
          style={[
            outline,
            {
              position: 'absolute',
              top: c.top,
              left: c.left,
              backgroundColor: c.color,
              width: c.bar ? 26 : 20,
              height: c.bar ? 14 : 20,
              borderRadius: c.bar ? 4 : 10,
              transform: c.rot ? [{ rotate: c.rot }] : undefined,
            },
          ]}
        />
      ))}
    </View>
  );
}

/** Shared win screen: "Great job! +1 star", plus any reward that star just unlocked. */
export function Celebrate({ earned, onNext, onBack, title }: {
  earned: boolean;
  onNext: () => void;
  onBack: () => void;
  title?: string;
}) {
  const [pop] = useState(() => new Animated.Value(0.6));
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();
    sfx(earned ? 'star' : 'correct');
    speak(pick(CHEERS));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen
      onBack={onBack}
      bg={colors.grassSoft}
      backdrop={<Confetti />}
    >
      <View style={s.win}>
        <Animated.View style={{ transform: [{ scale: pop }] }}>
          <Pip size={270} mood="cheer" />
        </Animated.View>
        <Text style={s.winTitle} accessibilityRole="header">
          {title ?? (earned ? 'Great job!' : 'You got it!')}
        </Text>
        {earned ? (
          <View style={[s.pill, outline, hard(4)]}>
            <StarIcon size={30} />
            <Text style={s.pillText}>+1 star</Text>
          </View>
        ) : null}
      </View>
      <Sticker style={s.next} r={38} onPress={onNext} accessibilityLabel="Next">
        <View style={s.nextRow}>
          <Text style={s.nextText}>Next</Text>
          <ArrowIcon />
        </View>
      </Sticker>
    </Screen>
  );
}

const s = StyleSheet.create({
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: -6 },
  dot: { width: 22, height: 22, borderRadius: 11 },
  card: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20 },
  art: { alignItems: 'center', justifyContent: 'center' },
  question: { fontFamily: font.bold, fontSize: 28, lineHeight: 32, color: colors.ink, textAlign: 'center' },
  options: { flexDirection: 'row', gap: 14, paddingBottom: 6 },
  opt: { flex: 1 },
  optReveal: { borderWidth: 6 },
  optText: { fontFamily: font.bold, fontSize: 64, color: colors.ink, includeFontPadding: false },
  win: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  winTitle: { fontFamily: font.bold, fontSize: 52, color: colors.ink, textAlign: 'center' },
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
  next: { height: 76, marginBottom: 6 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextText: { fontFamily: font.bold, fontSize: 32, color: colors.ink },
});
