import '../global.css'; // MUST be the first import
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { useColorScheme, cssInterop } from 'nativewind';
import { supabase } from '../services/supabase';
import * as LucideIcons from 'lucide-react-native';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Object.entries(LucideIcons).forEach(([name, Icon]: [string, any]) => {
  if (name.match(/^[A-Z]/) && (typeof Icon === 'function' || typeof Icon === 'object')) {
    cssInterop(Icon, {
      className: {
        target: 'style',
        nativeStyleToProp: {
          color: true,
          fill: true,
        },
      },
    });
  }
});

export default function RootLayout() {
  // Pull darkMode state and the setUser action from Zustand
  const { darkMode, setUser } = useStore();
  const { setColorScheme } = useColorScheme();

  const [loaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
    Outfit_900Black,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // 1. Sync Zustand dark mode state with NativeWind's internal color scheme
  useEffect(() => {
    setColorScheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setColorScheme]);

  // 2. Auth Listener: Sync Supabase User with Zustand Store
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {/*
        The top-level View and Stack use a conditional 'key' based on darkMode.
        In React Native, this forces a clean re-render of the navigation container
        when the theme changes, ensuring background colors (contentStyle) update instantly.
      */}
      <View
        key={darkMode ? 'dark' : 'light'}
        className={`flex-1 bg-background ${darkMode ? 'dark' : ''}`}>
        <StatusBar style={darkMode ? 'light' : 'dark'} />

        <Stack
          key={darkMode ? 'dark' : 'light'}
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: darkMode ? 'hsl(222, 47%, 11%)' : 'hsl(210, 40%, 98%)',
            },
          }}>
          {/* Main Navigation Group */}
          <Stack.Screen name="(tabs)" />

          {/* Individual Recipe View */}
          <Stack.Screen name="recipe/[id]" />

          {/* Edit Recipe View */}
          <Stack.Screen
            name="recipe/edit"
            options={{
              presentation: 'modal',
              headerShown: false,
              title: 'Edit Recipe',
            }}
          />

          {/* Add Recipe Slide-up Modal */}
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />

          {/* Authentication Modal */}
          <Stack.Screen
            name="authModal"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
