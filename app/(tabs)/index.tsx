import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import RecipeCard from '../../components/RecipeCard';
import Header from '../../components/ui/Header';
import { useRouter } from 'expo-router';
import Input from '../../components/ui/Input';

export default function RecipesScreen() {
  const { recipes, darkMode } = useStore();
  const [query, setQuery] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const filtered = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      r.ingredients?.some((i) => i.name.toLowerCase().includes(query.toLowerCase()))
  );

  // Fallback color for the placeholder text prop which doesn't support Tailwind classes directly
  const placeholderColor = darkMode ? '#64748b' : '#94a3b8'; // slate-600 (dark) / slate-400 (light)

  return (
    <View className="bg-background flex-1" style={{ paddingTop: insets.top }}>
      <Header />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <RecipeCard recipe={item} onPress={() => router.push(`/recipe/${item.id}`)} />
          </View>
        )}
        ListHeaderComponent={
          <View className="p-4">
            {/* Search Bar Section */}
            <View className="mb-6">
              <Input
                value={query}
                onChangeText={setQuery}
                placeholder="Search recipes, tags, ingredients..."
                leftIcon={<Search size={18} className="text-muted-foreground" />}
                className="h-12"
              />
            </View>

            {/* Section Header */}
            <Text className="text-text mb-4 px-1 text-lg font-bold">My Collection</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-20 items-center px-10">
            <Text className="text-muted text-center text-sm font-medium">
              {query
                ? `No results for "${query}"`
                : 'Your collection is empty. Tap the + button to add your first recipe!'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
