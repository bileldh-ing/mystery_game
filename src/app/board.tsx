// Case board: suspects with linked evidence, all clues, current objective.
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Avatar, Header, Screen, SectionTitle } from '../components/ui';
import { CHARACTERS, CLUES, PHOTOS } from '../content';
import { useGame } from '../game/store';
import type { CharId } from '../game/types';
import { C } from '../theme';

const SUSPECTS: CharId[] = ['maya', 'jonah', 'walt', 'brennan'];
type Tab = 'suspects' | 'clues';

export default function Board() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('suspects');
  const clues = useGame((s) => s.clues);
  const objective = useGame((s) => s.objective);
  const flags = useGame((s) => s.flags);
  const threads = useGame((s) => s.threads);

  const known = SUSPECTS.filter((id) => threads.includes(id as any));
  const people: CharId[] = ['ivy', ...known, 'tide'];
  if (flags.tideIdentified) people.push('theo');

  return (
    <Screen>
      <Header title="Case Board" subtitle={`Ivy Calder · ${clues.length} clues`} />
      <View style={st.tabs}>
        {(['suspects', 'clues'] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[st.tab, tab === t && st.tabOn]}>
            <Text style={[st.tabText, tab === t && { color: C.bg }]}>{t === 'suspects' ? 'People' : 'Evidence'}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {objective ? (
          <View style={st.objective}>
            <Text style={st.kicker}>OBJECTIVE</Text>
            <Text style={st.objText}>{objective}</Text>
          </View>
        ) : null}

        {tab === 'suspects' ? (
          people.map((id) => {
            const ch = CHARACTERS[id];
            const linked = clues.map((c) => CLUES[c]).filter((c) => c?.about?.includes(id));
            return (
              <Animated.View entering={FadeIn} key={id} style={st.card}>
                <View style={st.pin} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar source={ch.avatar} size={56} ring={ch.suspect ? C.red : C.teal} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={st.name}>{ch.name}</Text>
                    <Text style={st.role}>{ch.role}</Text>
                    {ch.suspect ? <Text style={st.suspect}>SUSPECT</Text> : null}
                  </View>
                </View>
                <Text style={st.bio}>{ch.bio}</Text>
                {linked.length ? (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    {linked.map((c) => (
                      <View key={c.id} style={st.string}>
                        <View style={st.thread} />
                        <Text style={st.linkText}>
                          <Text style={{ fontWeight: '800', color: C.text }}>{c.title}. </Text>
                          {c.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Animated.View>
            );
          })
        ) : (
          <>
            <SectionTitle>Evidence</SectionTitle>
            {clues.length === 0 ? <Text style={st.empty}>Nothing yet. Dig.</Text> : null}
            {[...clues].reverse().map((cid) => {
              const c = CLUES[cid];
              if (!c) return null;
              return (
                <Pressable
                  key={cid}
                  style={st.clue}
                  disabled={!c.photo}
                  onPress={() => c.photo && router.push({ pathname: '/gallery/[photo]', params: { photo: c.photo } })}
                >
                  {c.photo ? <Image source={PHOTOS[c.photo].src} style={st.thumb} contentFit="cover" /> : <View style={st.noThumb}><Text style={{ fontSize: 20 }}>🔎</Text></View>}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={st.clueTitle}>{c.title}</Text>
                    <Text style={st.clueText}>{c.text}</Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const st = StyleSheet.create({
  tabs: { flexDirection: 'row', margin: 12, backgroundColor: C.panel, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  tabOn: { backgroundColor: C.amber },
  tabText: { color: C.dim, fontWeight: '700' },
  objective: { marginHorizontal: 12, marginBottom: 6, padding: 14, borderRadius: 14, backgroundColor: '#1e2a1f', borderWidth: 1, borderColor: '#3c5a3f' },
  kicker: { color: C.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  objText: { color: C.text, marginTop: 4, fontSize: 14 },
  card: {
    marginHorizontal: 12,
    marginTop: 14,
    padding: 14,
    backgroundColor: '#1b1712',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3a2f22',
    transform: [{ rotate: '-0.4deg' }],
  },
  pin: { position: 'absolute', top: -6, alignSelf: 'center', width: 12, height: 12, borderRadius: 6, backgroundColor: C.red },
  name: { color: C.text, fontSize: 17, fontWeight: '800' },
  role: { color: C.dim, fontSize: 12, marginTop: 2 },
  suspect: { color: C.red, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  bio: { color: '#cbbfae', fontSize: 13.5, marginTop: 10, lineHeight: 19 },
  string: { flexDirection: 'row' },
  thread: { width: 2, backgroundColor: C.red, marginRight: 10, borderRadius: 1 },
  linkText: { color: C.dim, fontSize: 13, flex: 1, lineHeight: 18 },
  clue: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    backgroundColor: C.panel,
    borderRadius: 12,
  },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  noThumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' },
  clueTitle: { color: C.text, fontWeight: '800', fontSize: 14 },
  clueText: { color: C.dim, fontSize: 13, marginTop: 3, lineHeight: 18 },
  empty: { color: C.dim, textAlign: 'center', marginTop: 30 },
});
