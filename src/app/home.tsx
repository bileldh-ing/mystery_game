// Phone home screen with app grid.
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../components/ui';
import { WALLPAPER } from '../content';
import { useGame } from '../game/store';
import type { AppId } from '../game/types';
import { C } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;
const APPS: { id: AppId; label: string; icon: IconName; color: string; href: string }[] = [
  { id: 'messages', label: 'Messages', icon: 'chatbubble-ellipses', color: '#2f9e8f', href: '/messages' },
  { id: 'gallery', label: 'Gallery', icon: 'images', color: '#c46b3a', href: '/gallery' },
  { id: 'board', label: 'Case Board', icon: 'git-network', color: '#8a3a3a', href: '/board' },
  { id: 'news', label: 'Herald', icon: 'newspaper', color: '#4b5d87', href: '/news' },
  { id: 'ivy', label: 'Ivy', icon: 'phone-portrait', color: '#6e4b87', href: '/ivy' },
  { id: 'chapters', label: 'Chapters', icon: 'book', color: '#a8712c', href: '/chapters' },
  { id: 'settings', label: 'Settings', icon: 'settings', color: '#4a5a60', href: '/settings' },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const apps = useGame((s) => s.apps);
  const unread = useGame((s) => s.unread);
  const objective = useGame((s) => s.objective);
  const awaiting = useGame((s) => s.awaitingChapter);
  const ivyUnlocked = useGame((s) => !!s.flags.ivyUnlocked);
  const setUnlocked = useGame((s) => s.setUnlockedPhone);
  const photos = useGame((s) => s.photos.length);
  const typing = useGame((s) => s.typing);

  useFocusEffect(
    useCallback(() => {
      setUnlocked(true);
    }, [setUnlocked]),
  );

  const totalUnread = Object.values(unread).reduce((a, b) => a + (b ?? 0), 0);
  const visible = APPS.filter((a) => apps.includes(a.id));

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={WALLPAPER} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={18} />
      <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 10, paddingHorizontal: 18 }}>
        <View style={st.topRow}>
          <Text style={st.carrier}>Saltmere · 4G</Text>
          <Pressable onPress={() => router.replace('/')} hitSlop={10} accessibilityLabel="Lock phone">
            <Ionicons name="lock-closed-outline" size={20} color={C.dim} />
          </Pressable>
        </View>

        {awaiting ? (
          <Pressable style={st.card} onPress={() => router.push({ pathname: '/chapter/[n]', params: { n: String(awaiting) } })}>
            <Text style={st.cardLabel}>CHAPTER {awaiting}</Text>
            <Text style={st.cardText}>Ready when you are. Tap to begin.</Text>
          </Pressable>
        ) : objective ? (
          <Animated.View entering={FadeInUp} style={st.card}>
            <Text style={st.cardLabel}>CURRENT OBJECTIVE</Text>
            <Text style={st.cardText}>{objective}</Text>
            {typing ? <Text style={st.typing}>{typing.who} is typing…</Text> : null}
          </Animated.View>
        ) : null}

        <View style={st.grid}>
          {visible.map((a, i) => {
            const badge = a.id === 'messages' ? totalUnread : 0;
            const locked = a.id === 'ivy' && !ivyUnlocked;
            return (
              <Animated.View key={a.id} entering={FadeInUp.delay(i * 40)} style={st.cell}>
                <Pressable onPress={() => router.push(a.href as any)} accessibilityLabel={a.label} style={{ alignItems: 'center' }}>
                  {({ pressed }) => (
                    <>
                      <View style={[st.icon, { backgroundColor: a.color, transform: [{ scale: pressed ? 0.92 : 1 }] }]}>
                        <Ionicons name={locked ? 'lock-closed' : a.icon} size={30} color="#fff" />
                        <View style={st.badge}>
                          <Badge n={badge} />
                        </View>
                      </View>
                      <Text style={st.label} numberOfLines={1}>
                        {a.label}
                        {a.id === 'gallery' && photos ? ` (${photos})` : ''}
                      </Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <View style={st.dock}>
          <Text style={st.dockText}>Ivy Calder · missing 9 days</Text>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  carrier: { color: C.dim, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(17,34,42,0.85)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,165,65,0.3)',
    marginBottom: 22,
  },
  cardLabel: { color: C.amber, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  cardText: { color: C.text, fontSize: 15, marginTop: 6, lineHeight: 21 },
  typing: { color: C.teal, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '25%', alignItems: 'center', marginBottom: 22 },
  icon: { width: 62, height: 62, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -6, right: -6 },
  label: { color: C.text, fontSize: 12, marginTop: 6, maxWidth: 80 },
  dock: {
    marginTop: 'auto',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(224,86,91,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(224,86,91,0.4)',
  },
  dockText: { color: '#f1b3b5', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
});
