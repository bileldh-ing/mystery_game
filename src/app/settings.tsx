import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Header, Screen, SectionTitle } from '../components/ui';
import { setAmbient } from '../game/sound';
import { useGame } from '../game/store';
import type { Settings } from '../game/engine';
import { C } from '../theme';

const SPEEDS: { id: Settings['speed']; label: string; sub: string }[] = [
  { id: 'normal', label: 'Real time', sub: 'Typing delays as written. Most immersive.' },
  { id: 'fast', label: 'Fast', sub: 'About twice as quick.' },
  { id: 'instant', label: 'Instant', sub: 'Messages appear almost immediately.' },
];

export default function SettingsScreen() {
  const settings = useGame((s) => s.settings);
  const setSetting = useGame((s) => s.setSetting);
  const resetAll = useGame((s) => s.resetAll);
  const router = useRouter();

  const doReset = () => {
    const go = () => {
      resetAll();
      router.replace('/');
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Erase all progress?')) go();
    } else
      Alert.alert('Erase all progress?', 'This deletes your save, endings and chapter checkpoints.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase', style: 'destructive', onPress: go },
      ]);
  };

  return (
    <Screen>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionTitle>Message speed</SectionTitle>
        {SPEEDS.map((s) => (
          <Pressable key={s.id} style={st.row} onPress={() => setSetting('speed', s.id)}>
            <View style={{ flex: 1 }}>
              <Text style={st.label}>{s.label}</Text>
              <Text style={st.sub}>{s.sub}</Text>
            </View>
            <View style={[st.radio, settings.speed === s.id && st.radioOn]} />
          </Pressable>
        ))}

        <SectionTitle>Sound & feel</SectionTitle>
        <View style={st.row}>
          <Text style={[st.label, { flex: 1 }]}>Sound effects & ambience</Text>
          <Switch
            value={settings.sound}
            onValueChange={(v) => {
              setSetting('sound', v);
              setAmbient(v);
            }}
            trackColor={{ true: C.amberDim, false: C.line }}
            thumbColor={settings.sound ? C.amber : C.dim}
          />
        </View>
        <View style={st.row}>
          <Text style={[st.label, { flex: 1 }]}>Haptics</Text>
          <Switch value={settings.haptics} onValueChange={(v) => setSetting('haptics', v)} trackColor={{ true: C.amberDim, false: C.line }} thumbColor={settings.haptics ? C.amber : C.dim} />
        </View>
        <View style={st.row}>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Story notifications</Text>
            <Text style={st.sub}>Messages keep arriving while the app is closed (Android/iOS).</Text>
          </View>
          <Switch value={settings.notifications} onValueChange={(v) => setSetting('notifications', v)} trackColor={{ true: C.amberDim, false: C.line }} thumbColor={settings.notifications ? C.amber : C.dim} />
        </View>

        <SectionTitle>Save</SectionTitle>
        <Text style={[st.sub, { marginHorizontal: 16, marginBottom: 12 }]}>
          Progress saves automatically. A checkpoint is kept at the start of every chapter (Chapters app).
        </Text>
        <View style={{ marginHorizontal: 16 }}>
          <Button label="Erase all progress" kind="danger" onPress={doReset} />
        </View>

        <SectionTitle>About</SectionTitle>
        <Text style={[st.sub, { marginHorizontal: 16, lineHeight: 19 }]}>
          Read 2:14 — an original interactive mystery told through a phone. All characters and events are fictional.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
  label: { color: C.text, fontSize: 15, fontWeight: '600' },
  sub: { color: C.dim, fontSize: 12.5, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.dim },
  radioOn: { borderColor: C.amber, backgroundColor: C.amber },
});
