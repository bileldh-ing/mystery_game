// Ivy's cloud mirror: her messages (read-only), notes, and Pulse fitness data.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Avatar, Button, Header, Screen } from '../../components/ui';
import { AV, DELETED_NOTICE, IVY_THREADS, NOTES } from '../../content';
import { useGame } from '../../game/store';
import { C } from '../../theme';

type Tab = 'messages' | 'notes' | 'pulse';

export default function IvyPhone() {
  const router = useRouter();
  const unlocked = useGame((s) => !!s.flags.ivyUnlocked);
  const posted = useGame((s) => !!s.posted.p_passcode);
  const ivyThreads = useGame((s) => s.ivyThreads);
  const notes = useGame((s) => s.notes);
  const pulse = useGame((s) => !!s.flags.pulseUnlocked);
  const [tab, setTab] = useState<Tab>('messages');
  const [openNote, setOpenNote] = useState<string | null>(null);

  if (!unlocked) {
    return (
      <Screen>
        <Header title="Ivy · cloud mirror" />
        <View style={st.lock}>
          <Avatar source={AV.ivy} size={96} ring={C.amber} />
          <Ionicons name="lock-closed" size={28} color={C.amber} style={{ marginTop: 20 }} />
          <Text style={st.lockTitle}>Enter passcode</Text>
          <Text style={st.lockSub}>Read-only cloud mirror of Ivy’s phone · device offline since Sat 3 Oct, 02:15</Text>
          {posted ? (
            <View style={{ marginTop: 24, alignSelf: 'stretch', paddingHorizontal: 40 }}>
              <Button label="Enter code" icon="keypad" onPress={() => router.push({ pathname: '/puzzle/[id]', params: { id: 'p_passcode' } })} />
            </View>
          ) : (
            <Text style={[st.lockSub, { marginTop: 24 }]}>You don’t have any idea what the code might be. Yet.</Text>
          )}
        </View>
      </Screen>
    );
  }

  const tabs: Tab[] = pulse ? ['messages', 'notes', 'pulse'] : ['messages', 'notes'];
  const note = openNote ? NOTES[openNote] : null;

  return (
    <Screen>
      <Header title="Ivy · cloud mirror" subtitle="Device offline since Sat 3 Oct, 02:15" avatar={AV.ivy} />
      <View style={st.tabs}>
        {tabs.map((t) => (
          <Pressable key={t} onPress={() => { setTab(t); setOpenNote(null); }} style={[st.tab, tab === t && st.tabOn]}>
            <Text style={[st.tabText, tab === t && { color: C.bg }]}>
              {t === 'messages' ? 'Messages' : t === 'notes' ? `Notes (${notes.length})` : 'Pulse'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'messages' ? (
        <ScrollView>
          {ivyThreads.map((id) => {
            const th = IVY_THREADS[id];
            const last = th.messages.filter((m) => m.from !== 'system').slice(-1)[0];
            return (
              <Pressable
                key={id}
                style={({ pressed }) => [st.row, pressed && { backgroundColor: C.panel }]}
                onPress={() => router.push({ pathname: '/ivy/[thread]', params: { thread: id } })}
              >
                {th.avatar ? (
                  <Avatar source={th.avatar} size={46} />
                ) : (
                  <View style={st.emoji}>
                    <Text style={{ fontSize: 22 }}>{th.emoji}</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={st.name}>{th.name}</Text>
                  <Text style={st.preview} numberOfLines={1}>
                    {last?.text}
                  </Text>
                </View>
                <Text style={st.time}>{last?.time}</Text>
              </Pressable>
            );
          })}
          <View style={st.deleted}>
            <Ionicons name="trash-outline" size={16} color={C.red} />
            <Text style={st.deletedText}>{DELETED_NOTICE}</Text>
          </View>
        </ScrollView>
      ) : null}

      {tab === 'notes' ? (
        note ? (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Pressable onPress={() => setOpenNote(null)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Ionicons name="chevron-back" size={18} color={C.amber} />
              <Text style={{ color: C.amber }}>All notes</Text>
            </Pressable>
            <Animated.View entering={FadeIn} style={st.paper}>
              <Text style={st.noteDate}>{note.date}</Text>
              <Text style={st.noteTitle}>{note.title}</Text>
              <Text style={st.noteBody}>{note.body}</Text>
            </Animated.View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
            {[...notes].reverse().map((id) => (
              <Pressable key={id} style={st.noteRow} onPress={() => setOpenNote(id)}>
                <Text style={st.noteRowTitle}>{NOTES[id].title}</Text>
                <Text style={st.noteRowBody} numberOfLines={2}>
                  {NOTES[id].body}
                </Text>
                <Text style={st.noteRowDate}>{NOTES[id].date}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )
      ) : null}

      {tab === 'pulse' ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={st.pulseCard}>
            <Text style={st.kicker}>PULSE · BAND “IVY’S”</Text>
            <Text style={st.big}>112 bpm</Text>
            <Text style={st.dim}>Last sync: Sun 11 Oct, 04:12</Text>
            <Text style={st.dim}>Via: HA-R7 (Harbour Authority relay)</Text>
          </View>
          <Text style={[st.kicker, { marginTop: 20, marginLeft: 4 }]}>SYNC HISTORY</Text>
          {[
            ['Sun 11 Oct 04:12', 'HA-R7', '112 bpm · resting? no'],
            ['Thu 8 Oct 18:02', 'HA-R7', '96 bpm'],
            ['Mon 5 Oct 03:47', 'HA-R7', '104 bpm'],
            ['Sat 3 Oct 01:24', 'HA-R3', '141 bpm · spike'],
            ['Fri 2 Oct 23:40', 'phone', '88 bpm'],
          ].map(([t, via, hr]) => (
            <View key={t} style={st.syncRow}>
              <Text style={st.syncT}>{t}</Text>
              <Text style={[st.syncVia, via === 'HA-R7' && { color: C.amber }]}>{via}</Text>
              <Text style={st.syncHr}>{hr}</Text>
            </View>
          ))}
          <Text style={[st.dim, { marginTop: 14, lineHeight: 19 }]}>
            Band registered as a staff device at Saltmere Harbour Office (internship, July). Syncs automatically when near a harbour relay.
          </Text>
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const st = StyleSheet.create({
  lock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lockTitle: { color: C.text, fontSize: 20, fontWeight: '700', marginTop: 10 },
  lockSub: { color: C.dim, fontSize: 13, textAlign: 'center', marginTop: 6 },
  tabs: { flexDirection: 'row', margin: 12, backgroundColor: C.panel, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  tabOn: { backgroundColor: '#b59ad1' },
  tabText: { color: C.dim, fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  emoji: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' },
  name: { color: C.text, fontWeight: '700', fontSize: 15 },
  preview: { color: C.dim, fontSize: 13, marginTop: 2 },
  time: { color: C.faint, fontSize: 11, marginLeft: 8 },
  deleted: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, padding: 12, borderRadius: 10, backgroundColor: 'rgba(224,86,91,0.1)' },
  deletedText: { color: '#f1b3b5', fontSize: 13 },
  paper: { backgroundColor: '#efe6d2', borderRadius: 4, padding: 20 },
  noteDate: { color: '#7d6f57', fontSize: 12 },
  noteTitle: { color: '#2b2418', fontSize: 20, fontWeight: '700', marginTop: 4, marginBottom: 12 },
  noteBody: { color: '#2b2418', fontSize: 15.5, lineHeight: 23 },
  noteRow: { backgroundColor: C.panel, borderRadius: 12, padding: 14 },
  noteRowTitle: { color: C.text, fontWeight: '700', fontSize: 15 },
  noteRowBody: { color: C.dim, fontSize: 13, marginTop: 4 },
  noteRowDate: { color: C.faint, fontSize: 11, marginTop: 6 },
  pulseCard: { backgroundColor: C.panel, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.amberDim },
  kicker: { color: C.amber, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  big: { color: C.text, fontSize: 42, fontWeight: '200', marginVertical: 6 },
  dim: { color: C.dim, fontSize: 13 },
  syncRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  syncT: { color: C.text, flex: 1.4, fontSize: 13 },
  syncVia: { color: C.dim, flex: 0.7, fontSize: 13, fontWeight: '700' },
  syncHr: { color: C.dim, flex: 1.2, fontSize: 12, textAlign: 'right' },
});
