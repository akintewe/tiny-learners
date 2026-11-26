import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Sticker } from '../components/ui';
import { colors, font } from '../theme';
import { speak } from '../speak';
import { useStore } from '../store';

/** First visit to a map or the shop: pick who travels the candy map. */
export function ChooseAvatar({ onDone }: { onDone: () => void }) {
  const { setAvatar } = useStore();
  useEffect(() => {
    speak('Who will walk the candy map? Pick a friend!');
  }, []);
  return (
    <SafeAreaView style={s.root}>
      <Text style={s.title} accessibilityRole="header">
        Pick a friend!
      </Text>
      <View style={s.row}>
        {(['girl', 'boy'] as const).map((k) => (
          <Sticker
            key={k}
            color={k === 'girl' ? colors.berry : colors.sky}
            r={32}
            style={s.card}
            onPress={() => {
              setAvatar(k);
              speak(k === 'girl' ? 'Hi! Let us go!' : 'Hello! Let us go!');
              onDone();
            }}
            accessibilityLabel={k === 'girl' ? 'Girl' : 'Boy'}
          >
            <Avatar size={150} kind={k} wearing={{}} />
          </Sticker>
        ))}
      </View>
      <Text style={s.sub}>You can change later in the shop.</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFE3F1', alignItems: 'center', justifyContent: 'center', gap: 28, padding: 20 },
  title: { fontFamily: font.bold, fontSize: 40, color: colors.ink },
  row: { flexDirection: 'row', gap: 16 },
  card: { width: 170, height: 210 },
  sub: { fontFamily: font.medium, fontSize: 18, color: colors.ink },
});
