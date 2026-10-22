import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ZoomableImage } from '../../components/ZoomableImage';
import { Header, Screen } from '../../components/ui';
import { PHOTOS } from '../../content';
import { C } from '../../theme';

export default function PhotoViewer() {
  const { photo } = useLocalSearchParams<{ photo: string }>();
  const p = PHOTOS[photo];
  const [inspect, setInspect] = useState(false);
  if (!p) return null;
  return (
    <Screen style={{ backgroundColor: '#000' }}>
      <Header
        title={p.title}
        subtitle={p.date}
        right={
          <Pressable onPress={() => setInspect((v) => !v)} hitSlop={10} style={{ paddingHorizontal: 8 }}>
            <Ionicons name={inspect ? 'search' : 'search-outline'} size={22} color={C.amber} />
          </Pressable>
        }
      />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ZoomableImage source={p.src} />
      </View>
      {inspect ? (
        <Animated.View entering={FadeInDown} style={st.panel}>
          <Text style={st.kicker}>YOU NOTICE</Text>
          <ScrollView style={{ maxHeight: 220 }}>
            {p.details.map((d, i) => (
              <Text key={i} style={st.detail}>
                • {d}
              </Text>
            ))}
          </ScrollView>
        </Animated.View>
      ) : (
        <Text style={st.tip}>Pinch or double-tap to zoom · 🔍 to inspect</Text>
      )}
    </Screen>
  );
}

const st = StyleSheet.create({
  panel: { backgroundColor: C.bg2, padding: 16, borderTopWidth: 1, borderTopColor: C.amberDim },
  kicker: { color: C.amber, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  detail: { color: C.text, fontSize: 14, lineHeight: 20, marginBottom: 6 },
  tip: { color: C.faint, textAlign: 'center', fontSize: 12, padding: 12 },
});
