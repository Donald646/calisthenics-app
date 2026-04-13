import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

import { colors } from '@/constants/theme';
import { AppStateProvider, useAppState } from '@/contexts/app-state';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AppStateProvider>
      <HydrationGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="onboarding"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="workout/[id]"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="session/[id]"
            options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="exercise/[id]"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="history"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="profile"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="session/complete"
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
        </Stack>
      </HydrationGate>
      <StatusBar style="dark" />
    </AppStateProvider>
  );
}

// Blocks children from rendering until AsyncStorage has loaded, preventing
// a flash of empty state / immediate redirect to onboarding on cold start
function HydrationGate({ children }: { children: React.ReactNode }) {
  const { hydrated } = useAppState();
  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }
  return <>{children}</>;
}
