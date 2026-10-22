// Pinch / pan / double-tap zoom for photo clues (gesture-handler v3 hook API + reanimated).
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function ZoomableImage({ source }: { source: number }) {
  const scale = useSharedValue(1);
  const saved = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const stx = useSharedValue(0);
  const sty = useSharedValue(0);

  const pinch = usePinchGesture({
    onUpdate: (e) => {
      'worklet';
      scale.value = Math.min(5, Math.max(1, saved.value * e.scale));
    },
    onDeactivate: () => {
      'worklet';
      saved.value = scale.value;
      if (scale.value <= 1.01) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        stx.value = 0;
        sty.value = 0;
      }
    },
  });

  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      if (scale.value <= 1) return;
      tx.value = stx.value + e.translationX;
      ty.value = sty.value + e.translationY;
    },
    onDeactivate: () => {
      'worklet';
      stx.value = tx.value;
      sty.value = ty.value;
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: () => {
      'worklet';
      const next = scale.value > 1.5 ? 1 : 2.5;
      scale.value = withTiming(next);
      saved.value = next;
      if (next === 1) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        stx.value = 0;
        sty.value = 0;
      }
    },
  });

  const gesture = useSimultaneousGestures(pinch, pan, doubleTap);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}
