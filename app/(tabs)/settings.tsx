import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Moon, Sun, Scale, User, UserPlus, LogOut, ChevronRight } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Pull state from your Zustand store
  const { darkMode, setDarkMode, unitSystem, setUnitSystem, user } = useStore();

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleToggleUnit = (sys: 'metric' | 'imperial') => {
    setUnitSystem(sys);
  };

  // Helper to format the display name from Supabase metadata
  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : 'Guest User';

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error signing out', error.message);
    }
  };

  return (
    <View className="bg-background flex-1" style={{ paddingTop: insets.top }}>
      <View className="p-4">
        <Text className="text-text mb-6 px-1 text-xl font-bold">Settings</Text>

        <View className="gap-4">
          {/* Account Section */}
          <Pressable
            onPress={() => !user && router.push('/authModal')}
            className={`bg-card border-border rounded-[2.5rem] border p-5 shadow-sm transition-transform active:scale-[0.98]`}>
            <View className="flex-row items-center gap-4">
              <View className="bg-primary/10 rounded-2xl p-3">
                {user ? (
                  <User size={22} className="text-primary" />
                ) : (
                  <UserPlus size={22} className="text-primary" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-text text-sm font-bold">
                  {user ? displayName : 'Guest User'}
                </Text>
                <Text className="text-muted truncate text-xs">
                  {user ? user.email : 'Tap to sign in or join'}
                </Text>
              </View>
              {user ? (
                <Pressable
                  onPress={handleSignOut}
                  className="active:bg-destructive/10 rounded-xl p-2">
                  <LogOut size={18} className="text-destructive" />
                </Pressable>
              ) : (
                <ChevronRight size={18} className="text-muted" />
              )}
            </View>
          </Pressable>

          {/* Preferences Section */}
          <View className="bg-card border-border rounded-[2.5rem] border p-5 shadow-sm">
            {/* Dark Mode Toggle */}
            <View className="mb-8 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="bg-primary/10 rounded-2xl p-3">
                  {darkMode ? (
                    <Moon size={22} className="text-primary" />
                  ) : (
                    <Sun size={22} className="text-primary" />
                  )}
                </View>
                <View>
                  <Text className="text-text text-sm font-bold">Dark Mode</Text>
                  <Text className="text-muted text-xs">Eye-friendly theme</Text>
                </View>
              </View>
              <Pressable
                onPress={handleToggleDarkMode}
                className={`h-7 w-14 rounded-full p-1 transition-all ${
                  darkMode ? 'bg-primary' : 'bg-border'
                }`}>
                <View
                  className={`h-5 w-5 rounded-full bg-white shadow-md transition-all ${
                    darkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </Pressable>
            </View>

            {/* Measurement Toggle */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="bg-accent/10 rounded-2xl p-3">
                  <Scale size={22} className="text-accent" />
                </View>
                <View>
                  <Text className="text-text text-sm font-bold">Measurement</Text>
                  <Text className="text-muted text-xs">Preferred unit system</Text>
                </View>
              </View>
              <View className="bg-input border-border flex-row rounded-2xl border p-1">
                {(['metric', 'imperial'] as const).map((sys) => (
                  <Pressable
                    key={sys}
                    onPress={() => handleToggleUnit(sys)}
                    className={`rounded-xl px-4 py-1.5 transition-all ${
                      unitSystem === sys ? 'bg-card shadow-md' : ''
                    }`}>
                    <Text
                      className={`text-xs font-black capitalize ${
                        unitSystem === sys ? 'text-primary' : 'text-muted'
                      }`}>
                      {sys}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
