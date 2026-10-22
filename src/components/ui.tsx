import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top, paddingBottom: insets.bottom }, style]}>
      {children}
    </View>
  );
}

export function Avatar({ source, size = 40, ring }: { source: number; size?: number; ring?: string }) {
  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ring ? 2 : 0,
        borderColor: ring,
        backgroundColor: C.panel,
      }}
      contentFit="cover"
    />
  );
}

export function Header({
  title,
  subtitle,
  avatar,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  avatar?: number;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <View style={s.header}>
      <Pressable
        hitSlop={12}
        onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/home'))}
        style={s.back}
        accessibilityLabel="Back"
      >
        <Ionicons name="chevron-back" size={26} color={C.amber} />
      </Pressable>
      {avatar ? <Avatar source={avatar} size={36} /> : null}
      <View style={{ flex: 1, marginLeft: avatar ? 10 : 0 }}>
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={s.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <View style={s.badge}>
      <Text style={s.badgeText}>{n > 9 ? '9+' : n}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}) {
  const bg = kind === 'primary' ? C.amber : kind === 'danger' ? C.red : 'transparent';
  const fg = kind === 'primary' ? '#1a1206' : kind === 'danger' ? '#fff' : C.amber;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, borderColor: kind === 'ghost' ? C.amberDim : bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.section}>{children}</Text>;
}

export const fmtTime = (t: number) => {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
    backgroundColor: C.bg2,
  },
  back: { paddingHorizontal: 6, paddingVertical: 4 },
  title: { color: C.text, fontSize: 17, fontWeight: '700' },
  subtitle: { color: C.dim, fontSize: 12, marginTop: 1 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  btnText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  section: {
    color: C.amber,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 8,
    marginHorizontal: 16,
  },
});
