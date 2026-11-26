import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { CANDY, CandyName } from '../assets/candy';

const STICKS: Partial<Record<CandyName, CandyName>> = {
  lollipopRed: 'lollipopBase',
  lollipopGreen: 'lollipopBase',
  lollipopWhiteRed: 'lollipopBaseBeige',
  lollipopWhiteGreen: 'lollipopBaseBeige',
  lollipopFruitRed: 'lollipopBasePink',
  lollipopFruitGreen: 'lollipopBasePink',
  lollipopFruitYellow: 'lollipopBasePink',
};

/** One Kenney candy sprite. Lollipops get their stick underneath; cream swirls sit in a cupcake case. */
export function Candy({ name, size }: { name: CandyName; size: number }) {
  if (name.startsWith('cream')) {
    return (
      <View style={{ width: size, alignItems: 'center' }}>
        <SvgXml xml={CANDY[name]} width={size} height={size} />
        <View style={{ marginTop: -size * 0.42 }}>
          <SvgXml xml={CANDY.cupCake} width={size} height={size} />
        </View>
      </View>
    );
  }
  const stick = STICKS[name];
  if (!stick) return <SvgXml xml={CANDY[name]} width={size} height={size} />;
  return (
    <View style={{ width: size, alignItems: 'center' }}>
      <SvgXml xml={CANDY[name]} width={size} height={size} />
      <View style={{ marginTop: -2 }}>
        <SvgXml xml={CANDY[stick]} width={size} height={size} />
      </View>
    </View>
  );
}
