import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Badge, fmtTime, Header, Screen } from '../../components/ui';
import { threadDisplay } from '../../game/display';
import { useGame } from '../../game/store';
import { C } from '../../theme';


export default function MessagesList() {
  const router = useRouter();
  const threads = useGame((s) => s.threads);
  const messages = useGame((s) => s.messages);
  const unread = useGame((s) => s.unread);
  const flags = useGame((s) => s.flags);
  const typing = useGame((s) => s.typing);

  const rows = [...threads]
    .map((t) => {
      const list = messages[t] ?? [];
      const last = list[list.length - 1];
      return { t, last };
    })
    .sort((a, b) => (b.last?.at ?? 0) - (a.last?.at ?? 0));

  return (
    <Screen>
      <Header title="Messages" />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.t}
        ListEmptyComponent={<Text style={st.empty}>No messages yet.</Text>}
        renderItem={({ item }) => {
          const d = threadDisplay(item.t, flags);
          const isTyping = typing?.thread === item.t;
          const preview = isTyping
            ? 'typing…'
            : item.last
              ? item.last.puzzle
                ? `🧩 ${item.last.text}`
                : item.last.photo
                  ? '📷 Photo'
                  : `${item.last.from === 'me' ? 'You: ' : ''}${item.last.text ?? ''}`
              : '';
          const n = unread[item.t] ?? 0;
          return (
            <Pressable
              style={({ pressed }) => [st.row, pressed && { backgroundColor: C.panel }]}
              onPress={() => router.push({ pathname: '/messages/[thread]', params: { thread: item.t } })}
            >
              <Avatar source={d.avatar} size={50} ring={n ? C.amber : undefined} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[st.name, n ? { color: '#fff' } : null]} numberOfLines={1}>
                    {d.name}
                  </Text>
                  <Text style={st.time}>{item.last ? fmtTime(item.last.at) : ''}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                  <Text style={[st.preview, isTyping && { color: C.teal, fontStyle: 'italic' }, n ? { color: C.text } : null]} numberOfLines={1}>
                    {preview}
                  </Text>
                  <Badge n={n} />
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const st = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  name: { color: C.text, fontSize: 16, fontWeight: '700', flex: 1 },
  time: { color: C.faint, fontSize: 12 },
  preview: { color: C.dim, fontSize: 14, flex: 1, marginRight: 8 },
  empty: { color: C.dim, textAlign: 'center', marginTop: 60 },
});
