import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Header, Screen, SectionTitle } from '../../components/ui';
import { PHOTOS } from '../../content';
import { useGame } from '../../game/store';
import { C } from '../../theme';

const ALBUMS = ['Received', "Ivy's Cloud", 'Archive'] as const;

export default function Gallery() {
  const router = useRouter();
  const ids = useGame((s) => s.photos);
  const { width } = useWindowDimensions();
  const size = (Math.min(width, 700) - 8) / 3;

  return (
    <Screen>
      <Header title="Gallery" subtitle={`${ids.length} photos`} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {ids.length === 0 ? <Text style={st.empty}>No photos yet. Clues people send you will appear here.</Text> : null}
        {ALBUMS.map((album) => {
          const list = ids.map((id) => PHOTOS[id]).filter((p) => p && p.album === album);
          if (!list.length) return null;
          return (
            <View key={album}>
              <SectionTitle>{album}</SectionTitle>
              <View style={st.grid}>
                {list.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push({ pathname: '/gallery/[photo]', params: { photo: p.id } })}
                    style={{ width: size, height: size, padding: 1 }}
                  >
                    <Image source={p.src} style={{ flex: 1, borderRadius: 4 }} contentFit="cover" />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 2 },
  empty: { color: C.dim, textAlign: 'center', marginTop: 60, paddingHorizontal: 30 },
});
