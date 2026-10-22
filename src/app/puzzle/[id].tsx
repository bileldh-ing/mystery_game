// Puzzle screen: code / evidence / photo / order / choice, with 3 progressive hints.
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Button, Header, Screen } from '../../components/ui';
import { PHOTOS, PUZZLES } from '../../content';
import { play } from '../../game/sound';
import { useGame } from '../../game/store';
import { C } from '../../theme';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function PuzzleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = PUZZLES[id];
  const solved = useGame((s) => !!s.solved[id]);
  const hintsUsed = useGame((s) => s.hints[id] ?? 0);
  const photos = useGame((s) => s.photos);
  const flags = useGame((s) => s.flags);
  const solve = useGame((s) => s.solve);
  const takeHint = useGame((s) => s.useHint);

  const [fields, setFields] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [justSolved, setJustSolved] = useState(false);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  if (!p) return null;
  const k = p.kind;

  const fail = (msg: string) => {
    setError(msg);
    play('wrong');
    shake.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }), withTiming(-6, { duration: 50 }), withTiming(0, { duration: 50 }));
  };
  const win = () => {
    setError(null);
    solve(id, true);
    setJustSolved(true);
    play('clue');
  };

  const submit = () => {
    if (k.type === 'code') {
      const ok = k.fields.every((f, i) => f.answers.map(norm).includes(norm(fields[i] ?? '')));
      ok ? win() : fail(k.fields.length > 1 ? 'Not quite. Check both answers.' : 'Wrong code.');
    } else if (k.type === 'evidence') {
      const ok = picked.length === k.correct.length && k.correct.every((c) => picked.includes(c));
      ok ? win() : fail('That doesn’t prove it. Look again at how she writes.');
    } else if (k.type === 'photo') {
      picked[0] === k.correct ? win() : fail('That photo doesn’t contradict her story.');
    } else if (k.type === 'order') {
      const ok = order.join() === k.correct.join();
      if (ok) win();
      else {
        fail('The timeline doesn’t hold. Check the times again.');
        setOrder([]);
      }
    } else if (k.type === 'choice') {
      const correct = picked[0] === k.correct;
      if (k.oneShot) {
        solve(id, correct);
        setJustSolved(true);
        play(correct ? 'clue' : 'wrong');
      } else correct ? win() : fail('No.');
    }
  };

  const ready =
    k.type === 'code'
      ? k.fields.every((_, i) => (fields[i] ?? '').trim().length > 0)
      : k.type === 'evidence'
        ? picked.length === k.pick
        : k.type === 'order'
          ? order.length === k.items.length
          : picked.length === 1;

  if (solved || justSolved) {
    const oneShotWrong = k.type === 'choice' && k.oneShot && flags[k.oneShot.flag] === false;
    return (
      <Screen>
        <Header title={p.title} />
        <Animated.View entering={FadeIn} style={st.done}>
          <Ionicons name={oneShotWrong ? 'help-circle' : 'checkmark-circle'} size={72} color={oneShotWrong ? C.dim : C.green} />
          <Text style={st.doneTitle}>{oneShotWrong ? 'Guess made' : 'Solved'}</Text>
          <Text style={st.doneText}>{oneShotWrong ? 'You made your guess. TIDE will answer.' : p.success}</Text>
          <View style={{ marginTop: 30, alignSelf: 'stretch' }}>
            <Button label="Back to the case" onPress={() => router.back()} />
          </View>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={p.title} subtitle="Puzzle" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={st.prompt}>{p.prompt}</Text>

          <Animated.View style={[{ marginTop: 18 }, shakeStyle]}>
            {k.type === 'code'
              ? k.fields.map((f, i) => (
                  <View key={i} style={{ marginBottom: 14 }}>
                    <Text style={st.fieldLabel}>{f.label}</Text>
                    <TextInput
                      value={fields[i] ?? ''}
                      onChangeText={(v) => setFields((a) => Object.assign([...a], { [i]: v }))}
                      placeholder={f.placeholder}
                      placeholderTextColor={C.faint}
                      keyboardType={f.keyboard === 'numeric' ? 'number-pad' : 'default'}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[st.input, f.keyboard === 'numeric' && st.inputCode]}
                      onSubmitEditing={() => ready && submit()}
                    />
                  </View>
                ))
              : null}

            {k.type === 'evidence' ? (
              <View style={{ gap: 8 }}>
                <Text style={st.fieldLabel}>Pick {k.pick}</Text>
                {k.options.map((o) => {
                  const on = picked.includes(o.id);
                  return (
                    <Pressable
                      key={o.id}
                      style={[st.opt, on && st.optOn]}
                      onPress={() => setPicked((a) => (on ? a.filter((x) => x !== o.id) : a.length < k.pick ? [...a, o.id] : a))}
                    >
                      <Ionicons name={on ? 'checkbox' : 'square-outline'} size={20} color={on ? C.amber : C.dim} />
                      <Text style={st.optText}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {k.type === 'photo' ? (
              <View style={st.photoGrid}>
                {k.options.map((pid) => {
                  const have = photos.includes(pid);
                  const on = picked[0] === pid;
                  return (
                    <Pressable key={pid} disabled={!have} onPress={() => setPicked([pid])} style={[st.photoCell, on && { borderColor: C.amber }]}>
                      {have ? (
                        <Image source={PHOTOS[pid].src} style={{ flex: 1 }} contentFit="cover" />
                      ) : (
                        <View style={st.unknown}>
                          <Ionicons name="help" size={28} color={C.faint} />
                        </View>
                      )}
                      <Text style={st.photoLabel} numberOfLines={1}>
                        {have ? PHOTOS[pid].title : 'Not found yet'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {k.type === 'order' ? (
              <View>
                <Text style={st.fieldLabel}>Tap events in order — earliest first</Text>
                {order.map((oid, i) => (
                  <Animated.View entering={FadeInDown} key={oid} style={st.orderRow}>
                    <Text style={st.orderNum}>{i + 1}</Text>
                    <Text style={st.optText}>{k.items.find((x) => x.id === oid)?.label}</Text>
                  </Animated.View>
                ))}
                <View style={{ gap: 8, marginTop: 10 }}>
                  {k.items
                    .filter((x) => !order.includes(x.id))
                    .map((x) => (
                      <Pressable key={x.id} style={st.opt} onPress={() => setOrder((o) => [...o, x.id])}>
                        <Ionicons name="add-circle-outline" size={20} color={C.amber} />
                        <Text style={st.optText}>{x.label}</Text>
                      </Pressable>
                    ))}
                </View>
                {order.length ? (
                  <Pressable onPress={() => setOrder([])} style={{ marginTop: 10, alignSelf: 'flex-start' }}>
                    <Text style={{ color: C.amber }}>↺ Start over</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {k.type === 'choice' ? (
              <View style={{ gap: 8 }}>
                {k.oneShot ? <Text style={[st.fieldLabel, { color: C.red }]}>One guess only.</Text> : null}
                {k.options.map((o) => {
                  const on = picked[0] === o.id;
                  return (
                    <Pressable key={o.id} style={[st.opt, on && st.optOn]} onPress={() => setPicked([o.id])}>
                      {o.avatar ? <Image source={o.avatar} style={{ width: 36, height: 36, borderRadius: 18 }} /> : null}
                      <Text style={st.optText}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </Animated.View>

          {error ? <Text style={st.error}>{error}</Text> : null}

          <View style={{ marginTop: 20 }}>
            <Button label={k.type === 'choice' && k.oneShot ? 'Lock in guess' : 'Submit'} onPress={submit} disabled={!ready} />
          </View>

          <View style={st.hints}>
            <Text style={st.hintKicker}>HINTS · {hintsUsed}/3</Text>
            {p.hints.slice(0, hintsUsed).map((h, i) => (
              <Animated.Text entering={FadeIn} key={i} style={st.hint}>
                {i + 1}. {h}
              </Animated.Text>
            ))}
            {hintsUsed < 3 ? (
              <Pressable onPress={() => takeHint(id)} style={st.hintBtn}>
                <Ionicons name="bulb-outline" size={16} color={C.amber} />
                <Text style={{ color: C.amber, fontWeight: '700' }}>{hintsUsed === 2 ? 'Reveal answer' : 'Get a hint'}</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const st = StyleSheet.create({
  prompt: { color: C.text, fontSize: 16, lineHeight: 23 },
  fieldLabel: { color: C.dim, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: C.panel, color: C.text, fontSize: 18, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: C.line },
  inputCode: { fontSize: 30, letterSpacing: 14, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.panel, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.line },
  optOn: { borderColor: C.amber, backgroundColor: C.panel2 },
  optText: { color: C.text, fontSize: 15, flex: 1 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCell: { width: '47%', height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: C.panel },
  unknown: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoLabel: { color: C.dim, fontSize: 11, padding: 6, backgroundColor: C.bg2 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: C.panel2, borderRadius: 10, marginBottom: 6 },
  orderNum: { color: C.amber, fontWeight: '900', width: 20, textAlign: 'center' },
  error: { color: C.red, marginTop: 12, fontWeight: '600' },
  hints: { marginTop: 30, padding: 14, backgroundColor: C.bg2, borderRadius: 14, borderWidth: 1, borderColor: C.line },
  hintKicker: { color: C.amber, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  hint: { color: C.text, fontSize: 14, lineHeight: 20, marginBottom: 8 },
  hintBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  doneTitle: { color: C.text, fontSize: 26, fontWeight: '800', marginTop: 12 },
  doneText: { color: C.dim, fontSize: 16, textAlign: 'center', marginTop: 10, lineHeight: 23 },
});
