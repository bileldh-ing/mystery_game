import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHARACTERS, THREAD_META } from '../content';
import { useGame } from '../game/store';
import { C } from '../theme';
import { Avatar } from './ui';

export function Banner() {
  const banner = useGame((s) => s.banner);
  const setBanner = useGame((s) => s.setBanner);
  const unlockedPhone = useGame((s) => s.unlockedPhone);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 3800);
    return () => clearTimeout(t);
  }, [banner, setBanner]);

  if (!banner || !unlockedPhone) return null;
  const char = CHARACTERS[THREAD_META[banner.thread].char];
  return (
    <Animated.View
      key={banner.id}
      entering={FadeInUp.duration(260)}
      exiting={FadeOutUp.duration(200)}
      style={[st.bannerWrap, { top: insets.top + 6 }]}
    >
      <Pressable
        style={st.banner}
        onPress={() => {
          setBanner(null);
          router.push({ pathname: '/messages/[thread]', params: { thread: banner.thread } });
        }}
      >
        <Avatar source={char.avatar} size={38} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={st.bTitle} numberOfLines={1}>
              {banner.title}
            </Text>
            <Text style={st.bNow}>now</Text>
          </View>
          <Text style={st.bBody} numberOfLines={2}>
            {banner.body}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function Toast() {
  const toast = useGame((s) => s.toast);
  const setToast = useGame((s) => s.setToast);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast, setToast]);
  if (!toast) return null;
  return (
    <Animated.View
      key={toast}
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(200)}
      style={[st.toast, { bottom: insets.bottom + 90 }]}
      pointerEvents="none"
    >
      <Text style={st.toastText}>{toast}</Text>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  bannerWrap: { position: 'absolute', left: 8, right: 8, zIndex: 100 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22,38,45,0.97)',
    borderRadius: 18,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  bTitle: { color: C.text, fontWeight: '700', fontSize: 14, flex: 1 },
  bNow: { color: C.dim, fontSize: 11 },
  bBody: { color: C.dim, fontSize: 13, marginTop: 2 },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: C.panel2,
    borderColor: C.amberDim,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 90,
  },
  toastText: { color: C.amber, fontWeight: '700', fontSize: 13 },
});
