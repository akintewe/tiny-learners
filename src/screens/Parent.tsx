import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '../components/Screen';
import { Card, Sticker } from '../components/ui';
import { CheckIcon, LockIcon } from '../components/art';
import { colors, font, outline, radius, text } from '../theme';
import { useStore } from '../store';
import { isKnown, letterKey, numberKey } from '../learning';
import { PHONICS_ORDER } from '../data';
import { CREDITS } from '../credits';

const PROMISES = ['No ads', 'No accounts', 'No tracking', 'Works without internet'];
const LIMITS = [0, 15, 30, 60];

function makeSum(): [number, number] {
  return [6 + Math.floor(Math.random() * 4), 4 + Math.floor(Math.random() * 5)];
}

// A simple grown-up gate so small kids cannot change settings by accident.
export function Parent({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Screen title="Grown ups" noStars onBack={onBack}>
      {open ? <Settings onBack={onBack} /> : <Gate onOpen={() => setOpen(true)} />}
    </Screen>
  );
}

function Gate({ onOpen }: { onOpen: () => void }) {
  const [[a, b]] = useState(makeSum);
  const [input, setInput] = useState('');
  const [miss, setMiss] = useState(false);

  const check = () => {
    if (input.trim() === String(a * b)) onOpen();
    else {
      setMiss(true);
      setInput('');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Card style={s.gate}>
        <View style={[s.lock, outline]}>
          <LockIcon size={44} fill="#fff" stroke={2} />
        </View>
        <Text style={s.gateTitle}>This part is for grown ups.</Text>
        <Text style={s.gateSub}>{miss ? 'Not quite. Try again.' : 'Answer this to continue.'}</Text>
        <Text style={s.sum} nativeID="gate-q">
          {a} x {b} = ?
        </Text>
        <TextInput
          style={[s.input, outline]}
          keyboardType="number-pad"
          value={input}
          onChangeText={(t) => {
            setInput(t);
            setMiss(false);
          }}
          onSubmitEditing={check}
          maxLength={3}
          accessibilityLabel={`What is ${a} times ${b}?`}
          accessibilityLabelledBy="gate-q"
        />
        <Sticker color={colors.grass} r={32} lift={5} style={s.open} onPress={check} accessibilityLabel="Open">
          <Text style={s.openText}>Open</Text>
        </Sticker>
      </Card>
    </KeyboardAvoidingView>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={[s.toggle, outline, { backgroundColor: value ? colors.grass : '#E4E0D4' }]}
    >
      <View style={[s.knob, outline, value ? { right: 3 } : { left: 3 }]} />
    </Pressable>
  );
}

function Row({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <View style={s.line}>
      <View style={s.rowText}>
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={text.label}>{sub}</Text>
      </View>
      {children}
    </View>
  );
}

function Chip({ label, state }: { label: string; state: 'known' | 'learning' | 'locked' }) {
  const bg = state === 'known' ? colors.grass : state === 'learning' ? colors.sun : '#fff';
  return (
    <View style={[s.chip, outline, { backgroundColor: bg, opacity: state === 'locked' ? 0.45 : 1 }]}>
      <Text style={s.chipText}>{label}</Text>
    </View>
  );
}

function Settings({ onBack }: { onBack: () => void }) {
  const st = useStore();
  const letterState = (l: string, i: number) =>
    isKnown(st.skills[letterKey(l)]) ? 'known' : i < st.unlocked ? 'learning' : 'locked';
  const knownLetters = PHONICS_ORDER.filter((l) => isKnown(st.skills[letterKey(l)])).length;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const knownNums = nums.filter((n) => isKnown(st.skills[numberKey(n)])).length;

  const confirmReset = () =>
    Alert.alert('Reset learning progress?', 'Letters go back to the first six and all progress is cleared.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: st.resetProgress },
    ]);

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <Card style={s.box}>
        <Text style={s.h2}>Learning</Text>
        <Text style={text.label}>
          Knows {knownLetters} of 26 letter sounds. Letters unlock in phonics order (s, a, t, p, i, n first).
        </Text>
        <View style={s.chips}>
          {PHONICS_ORDER.map((l, i) => (
            <Chip key={l} label={l} state={letterState(l, i)} />
          ))}
        </View>
        <Text style={text.label}>Counts {knownNums} of 9 amounts confidently.</Text>
        <View style={s.chips}>
          {nums.map((n) => (
            <Chip key={n} label={String(n)} state={isKnown(st.skills[numberKey(n)]) ? 'known' : 'learning'} />
          ))}
        </View>
        <View style={s.legend}>
          <Chip label=" " state="known" />
          <Text style={text.label}>Known</Text>
          <Chip label=" " state="learning" />
          <Text style={text.label}>Practising</Text>
        </View>
      </Card>

      <Card style={s.box}>
        <Text style={s.h2}>Sound</Text>
        <Row title="Voice" sub="Reads letters and numbers out loud">
          <Toggle value={st.voice} onChange={(v) => st.setSetting('voice', v)} label="Voice" />
        </Row>
        <Row title="Sound effects" sub="Taps, pops and cheers">
          <Toggle value={st.sfx} onChange={(v) => st.setSetting('sfx', v)} label="Sound effects" />
        </Row>
        <Row title="Music" sub="Soft background music">
          <Toggle value={st.music} onChange={(v) => st.setSetting('music', v)} label="Music" />
        </Row>
      </Card>

      <Card style={s.box}>
        <Text style={s.h2}>Daily play time</Text>
        <Text style={text.label}>
          Played {st.minutesToday} {st.minutesToday === 1 ? 'minute' : 'minutes'} today. When time is up, Pip goes to sleep.
        </Text>
        <View style={s.limits}>
          {LIMITS.map((m) => (
            <Sticker
              key={m}
              color={colors.sky}
              r={22}
              lift={4}
              selected={st.limit === m}
              style={s.limit}
              onPress={() => st.setSetting('limit', m)}
              accessibilityLabel={m ? `${m} minutes a day` : 'No limit'}
            >
              <Text style={[s.limitText, st.limit === m && { color: colors.sky }]}>{m ? `${m}m` : 'Off'}</Text>
            </Sticker>
          ))}
        </View>
        {st.limitReached ? (
          <Sticker color={colors.sun} r={26} lift={4} style={s.wide} onPress={() => st.extendToday(15)}>
            <Text style={s.btnText}>Give 15 more minutes today</Text>
          </Sticker>
        ) : null}
      </Card>

      <Card style={s.box}>
        <Row title="Stars" sub={`${st.stars} now, ${st.earned} earned in total`}>
          <Sticker color={colors.berry} r={26} lift={4} style={s.reset} onPress={st.resetStars} disabled={st.stars === 0}>
            <Text style={s.btnText}>Reset</Text>
          </Sticker>
        </Row>
        <Text style={text.label}>Things bought in the shop stay when stars are reset.</Text>
        <Sticker color={colors.card} r={26} lift={4} style={s.wide} onPress={confirmReset}>
          <Text style={s.btnText}>Reset learning progress</Text>
        </Sticker>
      </Card>

      <Card style={s.safe} color={colors.grassSoft} lift={0}>
        <Text style={s.h2}>Safe by design</Text>
        {PROMISES.map((p) => (
          <View key={p} style={s.promise}>
            <View style={[s.check, outline]}>
              <CheckIcon />
            </View>
            <Text style={s.promiseText}>{p}</Text>
          </View>
        ))}
      </Card>

      <Card style={s.box} lift={0}>
        <Text style={s.h2}>Credits</Text>
        <Text style={text.label}>Pictures, animations, music and sounds made by these artists. Thank you!</Text>
        {CREDITS.map((c) => (
          <Text key={c.what} style={s.credit}>
            {c.what} by {c.by} ({c.license})
          </Text>
        ))}
      </Card>

      <Sticker color={colors.sun} r={34} style={s.back} onPress={onBack}>
        <Text style={s.backText}>Back to the fun</Text>
      </Sticker>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  gate: { paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center', gap: 20 },
  lock: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.grape,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateTitle: { fontFamily: font.bold, fontSize: 26, lineHeight: 30, color: colors.ink, textAlign: 'center' },
  gateSub: { fontFamily: font.medium, fontSize: 18, color: colors.ink, textAlign: 'center' },
  sum: { fontFamily: font.bold, fontSize: 38, color: colors.ink },
  input: {
    width: '100%',
    height: 68,
    borderRadius: radius.key,
    backgroundColor: colors.cream,
    textAlign: 'center',
    fontFamily: font.bold,
    fontSize: 36,
    color: colors.ink,
  },
  open: { width: '100%', height: 64 },
  openText: { fontFamily: font.bold, fontSize: 26, color: colors.ink },
  scroll: { gap: 16, paddingBottom: 20 },
  box: { borderRadius: 28, padding: 20, gap: 14 },
  h2: { fontFamily: font.bold, fontSize: 24, color: colors.ink },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: font.bold, fontSize: 20, color: colors.ink },
  toggle: { width: 76, height: 44, borderRadius: 22, justifyContent: 'center' },
  knob: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: font.bold, fontSize: 16, color: colors.ink },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  limits: { flexDirection: 'row', gap: 10 },
  limit: { flex: 1, height: 56 },
  limitText: { fontFamily: font.bold, fontSize: 20, color: colors.ink },
  wide: { height: 56, paddingHorizontal: 16 },
  reset: { height: 56, paddingHorizontal: 20 },
  btnText: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  safe: { borderRadius: 28, padding: 20, gap: 14 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseText: { fontFamily: font.semibold, fontSize: 20, color: colors.ink },
  credit: { fontFamily: font.medium, fontSize: 16, lineHeight: 21, color: colors.ink },
  back: { height: 68, marginBottom: 6 },
  backText: { fontFamily: font.bold, fontSize: 28, color: colors.ink },
});
