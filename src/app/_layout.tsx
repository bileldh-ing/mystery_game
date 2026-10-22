import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Banner, Toast } from '../components/Overlays';
import { Runner } from '../components/Runner';
import { useGame } from '../game/store';
import { C } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useGame((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: C.bg },
              animation: 'fade_from_bottom',
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen name="home" options={{ animation: 'fade' }} />
            <Stack.Screen name="chapter/[n]" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="ending/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="puzzle/[id]" options={{ presentation: 'modal' }} />
          </Stack>
          {hydrated ? <Runner /> : null}
          <Banner />
          <Toast />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
