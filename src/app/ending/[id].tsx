import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { ENDINGS } from '../../content';
import { useGame } from '../../game/store';
import type { EndingId } from '../../game/types';
import { C } from '../../theme';

export default function EndingScreen() {
  const { id } = useLocalSearchParams<{ id: EndingId }>();
  const e = ENDINGS[id];
  const flags = useGame((s) => s.flags);
  const endings = useGame((s) => s.endings);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  if (!e) return null;
  const label = id === 'true' ? 'TRUE ENDING' : id === 'good' ? 'GOOD ENDING' : 'BAD ENDING';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <Animated.View entering={FadeIn.duration(1500)}>
          <Image source={e.art} style={{ width: '100%', height: 340 }} contentFit="cover" />
          <LinearGradient colors={['transparent', C.bg]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 160 }} />
        </Animated.View>
        <View style={{ paddingHorizontal: 24, marginTop: -40 }}>
          <Animated.Text entering={FadeInDown.delay(500)} style={[st.kicker, id === 'bad' && { color: C.red }]}>
            {label}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(800)} style={st.title}>
            {e.title}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(1000)} style={st.tag}>
            {e.tagline}
          </Animated.Text>
          {e.body(flags).map((p, i) => (
            <Animated.Text key={i} entering={FadeInDown.delay(1400 + i * 500)} style={st.p}>
              {p}
            </Animated.Text>
          ))}
          <View style={st.found}>
            <Text style={st.foundTitle}>ENDINGS FOUND · {endings.length}/3</Text>
            {(['bad', 'good', 'true'] as EndingId[]).map((x) => (
              <Text key={x} style={[st.foundRow, !endings.includes(x) && { color: C.faint }]}>
                {endings.includes(x) ? '●' : '○'} {endings.includes(x) ? ENDINGS[x].title : '???'}
              </Text>
            ))}
          </View>
          <View style={{ gap: 10, marginTop: 24 }}>
            <Button label="Replay a chapter" icon="refresh" onPress={() => router.replace('/chapters')} />
            <Button label="Back to phone" kind="ghost" onPress={() => router.replace('/home')} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  kicker: { color: C.amber, fontWeight: '900', letterSpacing: 3, fontSize: 12 },
  title: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 4 },
  tag: { color: C.dim, fontSize: 16, fontStyle: 'italic', marginTop: 4, marginBottom: 18 },
  p: { color: C.text, fontSize: 16, lineHeight: 25, marginBottom: 14 },
  found: { marginTop: 18, padding: 16, borderRadius: 14, backgroundColor: C.panel },
  foundTitle: { color: C.amber, fontWeight: '800', letterSpacing: 1.5, fontSize: 11, marginBottom: 8 },
  foundRow: { color: C.text, fontSize: 15, marginVertical: 2 },
});
