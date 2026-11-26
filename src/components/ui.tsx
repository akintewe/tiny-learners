import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, font, hard, outline, radius, text } from '../theme';
import { HomeIcon, Pip, PipMood, SpeakerIcon, StarIcon } from './art';
import { sfx } from '../sound';
import { useStore } from '../store';

type StickerProps = Omit<PressableProps, 'style' | 'children'> & {
  color?: string;
  r?: number;
  lift?: number; // shadow depth in px
  selected?: boolean; // ink fill, color moves to the label
  faded?: boolean; // wrong answer
  quiet?: boolean; // skip the tap sound (answers play their own)
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode | ((state: { selected: boolean }) => React.ReactNode);
};

/**
 * A raised, outlined, flat-colored button. Pressing pushes it down onto its shadow.
 */
export function Sticker({
  color = colors.card,
  r = radius.button,
  lift = 6,
  selected = false,
  faded = false,
  style,
  children,
  disabled,
  quiet = false,
  onPress,
  ...rest
}: StickerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled || faded }}
      disabled={disabled || faded}
      onPress={(e) => {
        if (!quiet) sfx('tap');
        onPress?.(e);
      }}
      style={({ pressed }) => {
        const down = pressed || selected || faded;
        return [
          s.center,
          outline,
          { borderRadius: r, backgroundColor: selected ? colors.ink : color },
          down ? { transform: [{ translateY: lift }] } : hard(lift),
          faded && { opacity: 0.3 },
          style,
        ];
      }}
      {...rest}
    >
      {typeof children === 'function' ? children({ selected }) : children}
    </Pressable>
  );
}

export function Card({ style, children, lift = 6, color = colors.card }: {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  lift?: number;
  color?: string;
}) {
  return (
    <View style={[outline, { borderRadius: radius.card, backgroundColor: color }, lift ? hard(lift) : null, style]}>
      {children}
    </View>
  );
}

export function StarBadge() {
  const { stars } = useStore();
  return (
    <View
      style={[s.badge, outline, hard(4)]}
      accessible
      accessibilityLabel={`${stars} stars`}
    >
      <StarIcon size={24} />
      <Text style={s.badgeText}>{stars}</Text>
    </View>
  );
}

export function HomeButton({ onPress }: { onPress: () => void }) {
  return (
    <Sticker onPress={onPress} r={28} lift={4} style={s.round} accessibilityLabel="Home">
      <HomeIcon />
    </Sticker>
  );
}

export function SpeakButton({ onPress, color = colors.sky, label = 'Hear it again' }: {
  onPress: () => void;
  color?: string;
  label?: string;
}) {
  return (
    <Sticker onPress={onPress} color={color} lift={4} style={s.speak} accessibilityLabel={label}>
      <View style={s.row}>
        <SpeakerIcon />
        <Text style={s.speakText}>{label}</Text>
      </View>
    </Sticker>
  );
}

/** Small round speaker, used in the corner of a card. */
export function SpeakDot({ onPress, color = colors.sky }: { onPress: () => void; color?: string }) {
  return (
    <Sticker onPress={onPress} color={color} lift={3} r={26} style={s.dot} accessibilityLabel="Hear it again">
      <SpeakerIcon />
    </Sticker>
  );
}

export function PipSays({ children, mood = 'happy', size = 64, textStyle }: {
  children: React.ReactNode;
  mood?: PipMood;
  size?: number;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={s.says}>
      <Pip size={size} mood={mood} />
      <View style={[s.bubble, outline]}>
        <Text style={[text.body, s.bubbleText, textStyle]}>{children}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: colors.sun,
  },
  badgeText: { fontFamily: font.bold, fontSize: 22, color: colors.ink },
  round: { width: 56, height: 56 },
  speak: { height: 56, paddingHorizontal: 22, alignSelf: 'center' },
  speakText: { fontFamily: font.semibold, fontSize: 20, color: colors.ink },
  dot: { width: 52, height: 52 },
  says: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bubble: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  bubbleText: { lineHeight: 26 },
});
