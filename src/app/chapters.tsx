import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header, Screen, SectionTitle } from '../components/ui';
import { CHAPTERS, ENDINGS } from '../content';
import { useGame } from '../game/store';
import type { EndingId } from '../game/types';
import { C } from '../theme';

function confirm(msg: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(msg)) onYes();
    return;
  }
  Alert.alert('Replay chapter?', msg, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Replay', style: 'destructive', onPress: onYes },
  ]);
}

export default function Chapters() {
  const router = useRouter();
  const completed = useGame((s) => s.completed);
  const snapshots = useGame((s) => s.snapshots);
  const cursor = useGame((s) => s.cursor);
  const awaiting = useGame((s) => s.awaitingChapter);
  const endings = useGame((s) => s.endings);
  const replay = useGame((s) => s.replayChapter);

  return (
    <Screen>
      <Header title="Chapters" subtitle={`Endings found ${endings.length}/3`} />
      <ScrollView contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 40 }}>
        {CHAPTERS.map((c) => {
          const done = completed.includes(c.n);
          const current = cursor?.ch === c.n || awaiting === c.n;
          const reachable = !!snapshots[c.n];
          const locked = !done && !current && !reachable;
          return (
            <Pressable
              key={c.n}
              disabled={locked}
              style={[st.card, locked && { opacity: 0.4 }]}
              onPress={() => {
                if (current && awaiting === c.n) router.push({ pathname: '/chapter/[n]', params: { n: String(c.n) } });
                else if (current) router.replace('/home');
                else if (reachable)
                  confirm(`Restart from Chapter ${c.n}? Progress after its start will be replaced (endings found are kept).`, () => {
                    replay(c.n);
                    router.replace({ pathname: '/chapter/[n]', params: { n: String(c.n) } });
                  });
              }}
            >
              <Image source={c.art} style={st.art} contentFit="cover" />
              <View style={st.info}>
                <Text style={st.num}>CHAPTER {c.n}</Text>
                <Text style={st.title}>{locked ? '???' : c.title}</Text>
                <Text style={st.status}>
                  {current ? 'In progress' : done ? 'Completed · tap to replay' : locked ? 'Locked' : 'Available'}
                </Text>
              </View>
            </Pressable>
          );
        })}
        <SectionTitle>Endings</SectionTitle>
        {(['bad', 'good', 'true'] as EndingId[]).map((id) => (
          <View key={id} style={st.ending}>
            <Text style={[st.endingTitle, !endings.includes(id) && { color: C.faint }]}>
              {endings.includes(id) ? `${ENDINGS[id].title} — ${ENDINGS[id].tagline}` : '??? — not yet found'}
            </Text>
          </View>
        ))}
        <Text style={st.more}>More chapters can be added in src/content/chapters — see README.</Text>
      </ScrollView>
    </Screen>
  );
}

const st = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: C.panel },
  art: { width: '100%', height: 130 },
  info: { padding: 14 },
  num: { color: C.amber, fontWeight: '800', letterSpacing: 2, fontSize: 11 },
  title: { color: C.text, fontSize: 22, fontWeight: '800', marginTop: 2 },
  status: { color: C.dim, fontSize: 13, marginTop: 4 },
  ending: { padding: 14, borderRadius: 12, backgroundColor: C.bg2 },
  endingTitle: { color: C.text, fontSize: 14 },
  more: { color: C.faint, fontSize: 12, textAlign: 'center', marginTop: 10 },
});
