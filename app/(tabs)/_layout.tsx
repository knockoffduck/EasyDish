import { Tabs } from 'expo-router';
import { BookOpen, ShoppingCart, Settings as SettingsIcon } from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export default function TabLayout() {
  const { darkMode } = useStore();

  // Map to theme colors defined in global.css / tailwind.config.js
  const primary = 'hsl(262, 83%, 58%)'; // Violet-600
  const inactive = darkMode ? 'hsl(240, 5%, 65%)' : 'hsl(240, 4%, 46%)'; // Zinc-400 / Zinc-500
  const background = darkMode ? 'hsl(240, 10%, 9%)' : 'hsl(0, 0%, 100%)'; // Zinc-900 / White
  const border = darkMode ? 'hsl(240, 4%, 16%)' : 'hsl(240, 6%, 90%)'; // Zinc-800 / Zinc-200

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: background,
          borderTopWidth: 1,
          borderTopColor: border,
          height: 84,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, focused }) => (
            <BookOpen size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color, focused }) => (
            <ShoppingCart size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <SettingsIcon size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
