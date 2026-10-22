// Lock screen — the first thing the player sees; story notifications pile up here.
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../components/ui';
import { CHARACTERS, GAME_TITLE, THREAD_META, WALLPAPER } from '../content';
import { useGame } from '../game/store';
import { C } from '../theme';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function LockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useClock();
  const notifs = useGame((s) => s.notifs);
  const hydrated = useGame((s) => s.hydrated);
  const fresh = useGame((s) => !s.cursor && s.awaitingChapter === 1 && s.completed.length === 0);
  const awaiting = useGame((s) => s.awaitingChapter);
  const setUnlocked = useGame((s) => s.setUnlockedPhone);
  const clearNotifs = useGame((s) => s.clearNotifs);

  useFocusEffect(
    useCallback(() => {
      setUnlocked(false);
    }, [setUnlocked]),
  );

  const unlock = (thread?: string) => {
    setUnlocked(true);
    clearNotifs();
    router.replace('/home');
    if (thread) setTimeout(() => router.push({ pathname: '/messages/[thread]', params: { thread } }), 50);
  };

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const recent = notifs.slice(-5).reverse();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={WALLPAPER} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }}>
        <Animated.View entering={FadeIn.duration(700)} style={{ alignItems: 'center' }}>
          <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={st.date}>
            {DAYS[now.getDay()]}, {now.getDate()} {MONTHS[now.getMonth()]}
          </Text>
          <Text style={st.clock}>
            {hh}:{mm}
          </Text>
        </Animated.View>

        {hydrated && fresh ? (
          <Animated.View entering={FadeInDown.delay(400).duration(700)} style={st.titleCard}>
            <Text style={st.title}>{GAME_TITLE}</Text>
            <Text style={st.tag}>A missing girl. A cloned phone. A message she didn’t write.</Text>
            <Pressable style={st.begin} onPress={() => router.push({ pathname: '/chapter/[n]', params: { n: '1' } })}>
              <Text style={st.beginText}>BEGIN</Text>
            </Pressable>
            <Text style={st.hintText}>Best with sound on. Story messages arrive in real time — notifications on.</Text>
          </Animated.View>
        ) : (
          <ScrollView style={{ flex: 1, marginTop: 30 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
            {awaiting && !fresh ? (
              <Pressable
                style={st.notif}
                onPress={() => {
                  setUnlocked(true);
                  router.push({ pathname: '/chapter/[n]', params: { n: String(awaiting) } });
                }}
              >
                <View style={[st.appDot, { backgroundColor: C.amber }]}>
                  <Ionicons name="book" size={18} color="#1a1206" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={st.nTitle}>Chapter {awaiting} is ready</Text>
                  <Text style={st.nBody}>Tap to continue the case.</Text>
                </View>
              </Pressable>
            ) : null}
            {recent.map((n, idx) => {
              const char = CHARACTERS[THREAD_META[n.thread].char];
              return (
                <Animated.View key={n.id} entering={FadeInDown.delay(idx * 60)}>
                  <Pressable style={st.notif} onPress={() => unlock(n.thread)}>
                    <Avatar source={char.avatar} size={38} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={[st.nTitle, { flex: 1 }]} numberOfLines={1}>
                          {n.title}
                        </Text>
                        <Text style={st.nTime}>
                          {String(new Date(n.at).getHours()).padStart(2, '0')}:
                          {String(new Date(n.at).getMinutes()).padStart(2, '0')}
                        </Text>
                      </View>
                      <Text style={st.nBody} numberOfLines={2}>
                        {n.body}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
            {notifs.length > 5 ? <Text style={st.more}>+{notifs.length - 5} more notifications</Text> : null}
          </ScrollView>
        )}

        {!fresh ? (
          <Pressable style={st.unlock} onPress={() => unlock()}>
            <Ionicons name="chevron-up" size={22} color="rgba(255,255,255,0.8)" />
            <Text style={st.unlockText}>Tap to unlock</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  date: { color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 8, fontWeight: '500' },
  clock: { color: '#fff', fontSize: 84, fontWeight: '200', letterSpacing: -2, marginTop: -4 },
  titleCard: {
    marginTop: 'auto',
    marginBottom: 30,
    marginHorizontal: 20,
    padding: 22,
    borderRadius: 22,
    backgroundColor: 'rgba(7,13,16,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(242,165,65,0.35)',
    alignItems: 'center',
  },
  title: { color: C.amber, fontSize: 38, fontWeight: '800', letterSpacing: 1 },
  tag: { color: C.text, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  begin: { marginTop: 20, backgroundColor: C.amber, paddingHorizontal: 44, paddingVertical: 14, borderRadius: 30 },
  beginText: { color: '#1a1206', fontWeight: '900', letterSpacing: 3, fontSize: 16 },
  hintText: { color: C.dim, fontSize: 12, textAlign: 'center', marginTop: 14 },
  notif: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,32,38,0.82)',
    borderRadius: 18,
    padding: 12,
  },
  appDot: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  nTime: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  nBody: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 2 },
  more: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 12, marginTop: 4 },
  unlock: { alignItems: 'center', paddingTop: 10 },
  unlockText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
});
