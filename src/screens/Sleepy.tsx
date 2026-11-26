import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BobbingPip, LockIcon } from '../components/art';
import { Sticker } from '../components/ui';
import { colors, font } from '../theme';
import { speak } from '../speak';

/** Shown when today's play time (set by a grown up) is used up. */
export function Sleepy({ onGrownUps }: { onGrownUps: () => void }) {
  useEffect(() => {
    speak('Pip is sleepy. Time to rest! See you tomorrow.');
  }, []);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.moon} />
      <View style={s.center}>
        <BobbingPip size={220} mood="sleepy" />
        <Text style={s.title}>Pip is sleepy</Text>
        <Text style={s.sub}>Time to rest! See you tomorrow.</Text>
      </View>
      <Sticker r={24} lift={0} style={s.grown} onPress={onGrownUps} accessibilityLabel="For grown ups">
        <View style={s.row}>
          <LockIcon />
          <Text style={s.grownText}>For grown ups</Text>
        </View>
      </Sticker>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3B3F6B', padding: 20 },
  moon: {
    position: 'absolute',
    top: 70,
    right: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.sunSoft,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  title: { fontFamily: font.bold, fontSize: 40, color: '#fff' },
  sub: { fontFamily: font.semibold, fontSize: 22, color: '#fff', textAlign: 'center' },
  grown: { alignSelf: 'center', height: 56, paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grownText: { fontFamily: font.semibold, fontSize: 16, color: colors.ink },
});
