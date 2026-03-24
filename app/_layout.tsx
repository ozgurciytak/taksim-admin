import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { PaperProvider } from 'react-native-paper';
import { Platform, StatusBar, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    const applyFullScreen = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('inset-touch');
      }
    };

    applyFullScreen();

    // Re-apply when app comes back to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        applyFullScreen();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <PaperProvider>
            <StatusBar hidden />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(admin)" />
            </Stack>
          </PaperProvider>
        </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
}
