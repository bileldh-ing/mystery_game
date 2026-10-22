// "Saltmere Herald" in-game browser.
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header, Screen } from '../../components/ui';
import { ARTICLES, PHOTOS } from '../../content';
import { useGame } from '../../game/store';
import { C } from '../../theme';

export default function News() {
  const router = useRouter();
  const ids = useGame((s) => s.articles);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const a = id ? ARTICLES[id] : null;

  return (
    <Screen style={{ backgroundColor: '#f3efe6' }}>
      <Header title="Saltmere Herald" onBack={a ? () => router.setParams({ id: undefined as any }) : undefined} />
      <View style={st.urlBar}>
        <Ionicons name="lock-closed" size={12} color="#6b6457" />
        <Text style={st.url} numberOfLines={1}>
          herald.saltmere.co{a ? `/news/${a.id.replace('a_', '')}` : ''}
        </Text>
      </View>
      {a ? (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 50 }}>
          <Text style={st.kicker}>{a.source.toUpperCase()} · {a.date}</Text>
          <Text style={st.h1}>{a.title}</Text>
          {a.photo ? (
            <Pressable onPress={() => router.push({ pathname: '/gallery/[photo]', params: { photo: a.photo! } })}>
              <Image source={PHOTOS[a.photo].src} style={st.hero} contentFit="cover" />
              <Text style={st.caption}>{PHOTOS[a.photo].title} — tap to enlarge</Text>
            </Pressable>
          ) : null}
          {a.body.split('\n\n').map((p, i) => (
            <Text key={i} style={st.p}>
              {p}
            </Text>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 14 }}>
          <Text style={st.masthead}>The Saltmere Herald</Text>
          <Text style={st.motto}>Serving the harbour since 1874</Text>
          {[...ids].reverse().map((aid) => {
            const x = ARTICLES[aid];
            return (
              <Pressable key={aid} style={st.item} onPress={() => router.setParams({ id: aid })}>
                {x.photo ? <Image source={PHOTOS[x.photo].src} style={st.thumb} contentFit="cover" /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={st.itemTitle}>{x.title}</Text>
                  <Text style={st.itemDate}>{x.date}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const ink = '#1d1a14';
const st = StyleSheet.create({
  urlBar: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e2dccf', marginHorizontal: 10, marginTop: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  url: { color: '#6b6457', fontSize: 12, flex: 1 },
  masthead: { fontFamily: 'serif', fontSize: 30, fontWeight: '900', color: ink, textAlign: 'center', marginTop: 8 },
  motto: { color: '#6b6457', textAlign: 'center', fontStyle: 'italic', marginBottom: 14, borderBottomWidth: 2, borderBottomColor: ink, paddingBottom: 10 },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#d8d0bf' },
  thumb: { width: 84, height: 64 },
  itemTitle: { fontFamily: 'serif', color: ink, fontSize: 17, fontWeight: '700', lineHeight: 22 },
  itemDate: { color: '#6b6457', fontSize: 12, marginTop: 4 },
  kicker: { color: '#8a3a3a', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  h1: { fontFamily: 'serif', color: ink, fontSize: 26, fontWeight: '900', lineHeight: 32, marginTop: 6, marginBottom: 14 },
  hero: { width: '100%', height: 200, marginBottom: 4 },
  caption: { color: '#6b6457', fontSize: 12, fontStyle: 'italic', marginBottom: 14 },
  p: { fontFamily: 'serif', color: ink, fontSize: 16.5, lineHeight: 25, marginBottom: 14 },
});
