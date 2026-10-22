// Chapter title card with art.
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { chapterByN } from '../../content';
import { useGame } from '../../game/store';
import { C } from '../../theme';

export default function ChapterCard() {
  const { n } = useLocalSearchParams<{ n: string }>();
  const num = Number(n);
  const ch = chapterByN(num);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const awaiting = useGame((s) => s.awaitingChapter);
  const start = useGame((s) => s.startChapter);
  const setUnlocked = useGame((s) => s.setUnlockedPhone);
  if (!ch) return null;
  const canStart = awaiting === num;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Animated.View entering={FadeIn.duration(1200)} style={StyleSheet.absoluteFill}>
        <Image source={ch.art} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>
      <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(7,13,16,0.98)']} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, justifyContent: 'flex-end', padding: 26, paddingBottom: insets.bottom + 30 }}>
        <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={st.kicker}>
          CHAPTER {ch.n}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(700).duration(900)} style={st.title}>
          {ch.title}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(1000).duration(900)} style={st.sub}>
          {ch.subtitle}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(1400).duration(700)} style={{ marginTop: 30 }}>
          {canStart ? (
            <Button
              label="Begin"
              onPress={() => {
                start(num);
                if (num === 1) {
                  // Chapter 1 opens on the lock screen, where the first message lands.
                  router.replace('/');
                } else {
                  setUnlocked(true);
                  router.replace('/home');
                }
              }}
            />
          ) : (
            <Button label="Back" kind="ghost" onPress={() => router.back()} />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  kicker: { color: C.amber, fontSize: 13, fontWeight: '800', letterSpacing: 4 },
  title: { color: '#fff', fontSize: 46, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  sub: { color: C.dim, fontSize: 15, marginTop: 6 },
});
