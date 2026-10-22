// Messenger chat: typing indicator, timestamps, read receipts, reply choices, photo + puzzle cards.
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { fmtTime, Header, Screen } from '../../components/ui';
import { PHOTOS, PUZZLES } from '../../content';
import { evalCond, nodeAt } from '../../game/engine';
import { play } from '../../game/sound';
import { useGame } from '../../game/store';
import type { ChatMsg, ThreadId } from '../../game/types';
import { C } from '../../theme';
import { threadDisplay } from '../../game/display';

const EMPTY: ChatMsg[] = [];

function Dot({ i }: { i: number }) {
  const v = useSharedValue(0.3);
  useEffect(() => {
    v.value = withDelay(i * 160, withRepeat(withSequence(withTiming(1, { duration: 320 }), withTiming(0.3, { duration: 320 })), -1));
  }, [i, v]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ translateY: (1 - v.value) * 3 }] }));
  return <Animated.View style={[st.dot, style]} />;
}

function TypingBubble() {
  return (
    <Animated.View entering={FadeIn.duration(150)} style={[st.bubble, st.them, st.typingBubble]}>
      <Dot i={0} />
      <Dot i={1} />
      <Dot i={2} />
    </Animated.View>
  );
}

function Bubble({ m, showTime, router }: { m: ChatMsg; showTime: boolean; router: ReturnType<typeof useRouter> }) {
  const solved = useGame((s) => (m.puzzle ? !!s.solved[m.puzzle] : false));
  if (m.puzzle) {
    const p = PUZZLES[m.puzzle];
    return (
      <Animated.View entering={FadeInDown.duration(250)} style={st.puzzleCard}>
        <Text style={st.puzzleKicker}>🧩 PUZZLE</Text>
        <Text style={st.puzzleTitle}>{p?.title}</Text>
        <Text style={st.puzzlePrompt} numberOfLines={3}>
          {p?.prompt}
        </Text>
        {solved ? (
          <View style={st.solvedRow}>
            <Ionicons name="checkmark-circle" size={18} color={C.green} />
            <Text style={st.solvedText}>Solved</Text>
          </View>
        ) : (
          <Pressable style={st.solveBtn} onPress={() => router.push({ pathname: '/puzzle/[id]', params: { id: m.puzzle! } })}>
            <Text style={st.solveText}>Solve</Text>
          </Pressable>
        )}
      </Animated.View>
    );
  }
  if (m.from === 'system') {
    return (
      <Animated.View entering={FadeIn} style={st.system}>
        <Text style={st.systemText}>{m.text}</Text>
      </Animated.View>
    );
  }
  const mine = m.from === 'me';
  return (
    <Animated.View entering={FadeInDown.duration(220)} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
      {m.photo ? (
        <Pressable onPress={() => router.push({ pathname: '/gallery/[photo]', params: { photo: m.photo! } })}>
          <View style={[st.photoBubble, mine ? st.me : st.them]}>
            <Image source={PHOTOS[m.photo]?.src} style={st.photo} contentFit="cover" />
            {m.text ? <Text style={[st.msgText, { padding: 8 }]}>{m.text}</Text> : null}
          </View>
        </Pressable>
      ) : (
        <View style={[st.bubble, mine ? st.me : st.them]}>
          <Text style={st.msgText}>{m.text}</Text>
        </View>
      )}
      {showTime ? <Text style={st.time}>{fmtTime(m.at)}</Text> : null}
    </Animated.View>
  );
}

export default function Chat() {
  const { thread } = useLocalSearchParams<{ thread: ThreadId }>();
  const router = useRouter();
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const messages = useGame((s) => s.messages[thread] ?? EMPTY);
  const flags = useGame((s) => s.flags);
  const typing = useGame((s) => s.typing);
  const cursor = useGame((s) => s.cursor);
  const clues = useGame((s) => s.clues);
  const solved = useGame((s) => s.solved);
  const setActive = useGame((s) => s.setActiveThread);
  const markRead = useGame((s) => s.markRead);
  const pick = useGame((s) => s.pick);

  useFocusEffect(
    useCallback(() => {
      setActive(thread);
      markRead(thread);
      return () => setActive(null);
    }, [thread, setActive, markRead]),
  );

  useEffect(() => {
    markRead(thread);
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length, typing?.thread, thread, markRead]);

  const node = nodeAt(cursor);
  const choiceHere = node && node.k === 'choice' && node.t === thread ? node : null;
  const options = choiceHere ? choiceHere.options.filter((o) => !o.requires || evalCond(o.requires, { flags, clues, solved })) : [];
  const d = threadDisplay(thread, flags);
  const isTyping = typing?.thread === thread;
  const blocked = messages.some((m) => m.from === 'system' && /blocked you/.test(m.text ?? '')) &&
    !messages.some((m) => m.from === 'system' && /unblocked you/.test(m.text ?? ''));

  // last "me" message gets a read receipt if someone replied after it
  let lastMine = -1;
  messages.forEach((m, i) => {
    if (m.from === 'me') lastMine = i;
  });
  const repliedAfter = lastMine >= 0 && messages.slice(lastMine + 1).some((m) => m.from !== 'me' && m.from !== 'system');

  return (
    <Screen>
      <Header
        title={d.name}
        subtitle={isTyping ? 'typing…' : blocked ? 'blocked' : 'online'}
        avatar={d.avatar}
      />
      <ScrollView
        ref={scroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 20, gap: 6 }}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        {thread === 'tide' && messages.length > 0 ? (
          <Text style={st.e2e}>🔒 Unknown number. Messages are end-to-end encrypted.</Text>
        ) : null}
        {messages.map((m, i) => {
          const next = messages[i + 1];
          const showTime = !next || next.from !== m.from || next.at - m.at > 5 * 60 * 1000;
          return (
            <View key={m.id}>
              <Bubble m={m} showTime={showTime && m.from !== 'system'} router={router} />
              {i === lastMine && repliedAfter ? null : i === lastMine ? (
                <Text style={[st.time, { alignSelf: 'flex-end' }]}>Delivered</Text>
              ) : null}
              {i === lastMine && repliedAfter ? (
                <Text style={[st.time, { alignSelf: 'flex-end', color: C.teal }]}>Read {fmtTime(m.at + 4000)}</Text>
              ) : null}
            </View>
          );
        })}
        {isTyping ? <TypingBubble /> : null}
      </ScrollView>

      <View style={st.inputArea}>
        {options.length ? (
          <Animated.View entering={FadeInDown.duration(220)} style={{ gap: 8 }}>
            {options.map((o, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [st.option, pressed && { backgroundColor: C.panel2 }]}
                onPress={() => {
                  play('send');
                  pick(i);
                }}
              >
                <Text style={st.optionText}>{o.text}</Text>
                <Ionicons name="send" size={16} color={C.amber} />
              </Pressable>
            ))}
          </Animated.View>
        ) : (
          <View style={st.fakeInput}>
            <Text style={st.fakeInputText}>{blocked ? 'You can’t reply to this conversation.' : 'Message'}</Text>
            <Ionicons name="send" size={18} color={C.faint} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  e2e: {
    color: C.faint,
    fontSize: 11,
    textAlign: 'center',
    backgroundColor: C.bg2,
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  bubble: { maxWidth: '82%', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18 },
  me: { backgroundColor: C.bubbleMe, borderBottomRightRadius: 5 },
  them: { backgroundColor: C.bubbleThem, borderBottomLeftRadius: 5 },
  msgText: { color: C.text, fontSize: 15.5, lineHeight: 21 },
  time: { color: C.faint, fontSize: 10.5, marginTop: 3, marginHorizontal: 6 },
  typingBubble: { flexDirection: 'row', gap: 5, paddingVertical: 14, paddingHorizontal: 16, alignSelf: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.dim },
  photoBubble: { borderRadius: 16, overflow: 'hidden', maxWidth: 260 },
  photo: { width: 240, height: 170 },
  system: {
    alignSelf: 'center',
    backgroundColor: C.system,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: '90%',
  },
  systemText: { color: C.dim, fontSize: 12, textAlign: 'center' },
  puzzleCard: {
    alignSelf: 'center',
    width: '92%',
    backgroundColor: C.panel,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.amberDim,
    marginVertical: 8,
  },
  puzzleKicker: { color: C.amber, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  puzzleTitle: { color: C.text, fontSize: 17, fontWeight: '800', marginTop: 4 },
  puzzlePrompt: { color: C.dim, fontSize: 13, marginTop: 6, lineHeight: 18 },
  solveBtn: { marginTop: 12, backgroundColor: C.amber, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  solveText: { color: '#1a1206', fontWeight: '800', letterSpacing: 1 },
  solvedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  solvedText: { color: C.green, fontWeight: '700' },
  inputArea: {
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
    backgroundColor: C.bg2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.panel,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  optionText: { color: C.text, fontSize: 15, flex: 1, marginRight: 10 },
  fakeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.panel,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  fakeInputText: { color: C.faint, fontSize: 15 },
});
