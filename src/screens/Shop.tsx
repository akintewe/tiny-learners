import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Avatar } from '../components/Avatar';
import { Card, Sticker } from '../components/ui';
import { StarIcon } from '../components/art';
import { Slot, WEAR, WEAR_SVG, WearItem } from '../assets/wear';
import { colors, font, hard, outline } from '../theme';
import { playMusic, sfx } from '../sound';
import { speak } from '../speak';
import { useStore } from '../store';

const TABS: { slot: Slot; label: string }[] = [
  { slot: 'hat', label: 'Hats' },
  { slot: 'glasses', label: 'Glasses' },
  { slot: 'shirt', label: 'Clothes' },
];

function Item({ item, onPress, owned, on, canPay }: {
  item: WearItem;
  onPress: () => void;
  owned: boolean;
  on: boolean;
  canPay: boolean;
}) {
  const [wobble] = useState(() => new Animated.Value(0));
  const press = () => {
    if (!owned && !canPay) {
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: -1, duration: 70, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 70, useNativeDriver: true }),
      ]).start();
    }
    onPress();
  };
  const rotate = wobble.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Sticker
        quiet
        r={24}
        lift={4}
        color={on ? colors.sun : colors.card}
        style={s.item}
        onPress={press}
        accessibilityLabel={`${item.name}${owned ? (on ? ', wearing' : ', yours') : `, ${item.price} stars`}`}
      >
        <SvgXml xml={WEAR_SVG[item.id]} width={58} height={58} />
        {owned ? (
          <Text style={s.tag}>{on ? 'On' : 'Wear'}</Text>
        ) : (
          <View style={[s.price, !canPay && { opacity: 0.45 }]}>
            <StarIcon size={18} fill={colors.sun} stroke={9} />
            <Text style={s.tag}>{item.price}</Text>
          </View>
        )}
      </Sticker>
    </Animated.View>
  );
}

export function Shop({ onBack }: { onBack: () => void }) {
  const st = useStore();
  const [tab, setTab] = useState<Slot>('hat');

  useEffect(() => {
    playMusic('shop');
    speak('Welcome to the shop! Use your stars to dress up.');
  }, []);

  const tapItem = (item: WearItem) => {
    const owned = st.owned.includes(item.id);
    if (owned) {
      const on = st.wearing[item.slot] === item.id;
      sfx('tap');
      st.wear(on ? null : item, item.slot);
      speak(on ? 'Off it goes!' : item.name);
      return;
    }
    if (st.stars >= item.price) {
      st.buy(item);
      sfx('buy');
      speak(`You got the ${item.name}!`);
    } else {
      sfx('wrong');
      const need = item.price - st.stars;
      speak(`You need ${need} more ${need === 1 ? 'star' : 'stars'}. Play to earn stars!`);
    }
  };

  return (
    <Screen title="Shop" onBack={onBack}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Card style={s.stage} color="#FFE3F1">
          <Avatar size={210} />
          <View style={s.kids}>
            {(['girl', 'boy'] as const).map((k) => (
              <Sticker
                key={k}
                r={20}
                lift={3}
                color={k === 'girl' ? colors.berry : colors.sky}
                selected={st.avatar === k}
                style={s.kid}
                onPress={() => st.setAvatar(k)}
                accessibilityLabel={k === 'girl' ? 'Play as the girl' : 'Play as the boy'}
              >
                <Text style={[s.kidText, st.avatar === k && { color: k === 'girl' ? colors.berry : colors.sky }]}>
                  {k === 'girl' ? 'Girl' : 'Boy'}
                </Text>
              </Sticker>
            ))}
          </View>
        </Card>

        <View style={s.tabs}>
          {TABS.map((t) => (
            <Sticker
              key={t.slot}
              r={22}
              lift={4}
              color={colors.grape}
              selected={tab === t.slot}
              style={s.tab}
              onPress={() => setTab(t.slot)}
            >
              <Text style={[s.tabText, tab === t.slot && { color: colors.grape }]}>{t.label}</Text>
            </Sticker>
          ))}
        </View>

        <View style={s.grid}>
          {WEAR.filter((w) => w.slot === tab).map((w) => (
            <Item
              key={w.id}
              item={w}
              owned={st.owned.includes(w.id)}
              on={st.wearing[w.slot] === w.id}
              canPay={st.stars >= w.price}
              onPress={() => tapItem(w)}
            />
          ))}
        </View>

        <View style={[s.note, outline, hard(3)]}>
          <StarIcon size={22} fill={colors.sun} stroke={8} />
          <Text style={s.noteText}>Earn stars by playing. Finish a level for 3 more!</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { gap: 16, paddingBottom: 20 },
  stage: { alignItems: 'center', paddingVertical: 12, gap: 8 },
  kids: { flexDirection: 'row', gap: 12 },
  kid: { height: 56, paddingHorizontal: 22 },
  kidText: { fontFamily: font.bold, fontSize: 20, color: colors.ink },
  tabs: { flexDirection: 'row', gap: 10 },
  tab: { flex: 1, height: 56 },
  tabText: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  item: { width: 100, height: 112, gap: 6 },
  price: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tag: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
  },
  noteText: { flex: 1, fontFamily: font.semibold, fontSize: 16, color: colors.ink },
});
