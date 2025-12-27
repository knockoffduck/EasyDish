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

  // 1. Sync Zustand dark mode state with NativeWind's internal color scheme
  useEffect(() => {
    setColorScheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setColorScheme]);

  // 2. Auth Listener: Sync Supabase User with Zustand Store
  useEffect(() => {
    // Check for an existing active session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user); // Set initial user state
    });

    // Listen for login, logout, or token refresh events
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // If session exists, set the user; otherwise, set to null (logged out)
      setUser(session?.user ?? null);
    });

    // Clean up subscription when the layout unmounts
    return () => authListener.subscription.unsubscribe();
  }, [setUser]);

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
