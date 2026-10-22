import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header, Screen } from '../../components/ui';
import { CHARACTERS, IVY_THREADS, PHOTOS } from '../../content';
import { C } from '../../theme';

// Read-only view of one of Ivy's conversations. "ivy" is the phone owner (right side).
export default function IvyThread() {
  const { thread } = useLocalSearchParams<{ thread: string }>();
  const th = IVY_THREADS[thread];
  if (!th) return null;
  const group = th.id === 'family';
  return (
    <Screen>
      <Header title={th.name} subtitle="Ivy’s phone · read only" avatar={th.avatar} />
      <ScrollView contentContainerStyle={{ padding: 12, gap: 6 }}>
        {th.messages.map((m, i) => {
          if (m.from === 'system')
            return (
              <Text key={i} style={st.system}>
                {m.text}
              </Text>
            );
          const mine = m.from === 'ivy';
          const name = CHARACTERS[m.from as keyof typeof CHARACTERS]?.short;
          return (
            <View key={i} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
              {group && !mine ? <Text style={st.sender}>{name}</Text> : null}
              <View style={[st.bubble, mine ? st.me : st.them]}>
                {m.photo ? <Image source={PHOTOS[m.photo]?.src} style={{ width: 220, height: 150, borderRadius: 10 }} /> : null}
                {m.text ? <Text style={st.text}>{m.text}</Text> : null}
              </View>
              <Text style={st.time}>
                {m.time}
                {m.read ? ` · ${m.read}` : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const st = StyleSheet.create({
  bubble: { maxWidth: '82%', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18 },
  me: { backgroundColor: '#5b3f73', borderBottomRightRadius: 5 },
  them: { backgroundColor: C.bubbleThem, borderBottomLeftRadius: 5 },
  text: { color: C.text, fontSize: 15.5, lineHeight: 21 },
  time: { color: C.faint, fontSize: 10.5, marginTop: 3, marginHorizontal: 6 },
  sender: { color: C.amber, fontSize: 11, marginLeft: 8, marginBottom: 2, fontWeight: '700' },
  system: { color: C.red, fontSize: 12, textAlign: 'center', marginVertical: 6 },
});
