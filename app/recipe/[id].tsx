import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  Users,
  Zap,
  ShoppingCart,
  Copy,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export default function RecipeDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { recipes, deleteRecipe, addToShoppingList } = useStore();

  const [showToast, setShowToast] = useState(false);

  // Find the recipe in the global store
  const recipe = recipes.find((r) => r.id === id);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!recipe) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <Text className="text-text font-bold">Recipe not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Recipe', `Are you sure you want to delete "${recipe.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRecipe(recipe.id);
          router.back();
        },
      },
    ]);
  };

  const handleAddToList = () => {
    addToShoppingList(recipe);
    setShowToast(true);
  };

  return (
    <View className="bg-background flex-1">
      {/* Sticky Header */}
      <View
        className="bg-background border-border z-10 flex-row items-center border-b px-4 py-2"
        style={{ paddingTop: insets.top }}>
        <Pressable
          onPress={() => router.back()}
          className="active:bg-secondary/20 rounded-full p-2">
          <ArrowLeft size={24} className="text-text" />
        </Pressable>
        <Text className="text-text mx-2 flex-1 truncate text-xl font-bold" numberOfLines={1}>
          {recipe.title}
        </Text>
        <View className="flex-row gap-1">
          <Pressable className="active:bg-secondary/20 rounded-full p-2">
            <Edit2 size={20} className="text-muted" />
          </Pressable>
          <Pressable className="active:bg-secondary/20 rounded-full p-2">
            <Copy size={20} className="text-muted" />
          </Pressable>
          <Pressable onPress={handleDelete} className="active:bg-destructive/10 rounded-full p-2">
            <Trash2 size={20} className="text-destructive" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Hero Image */}
        {recipe.image && (
          <View className="shadow-inner relative h-64 w-full overflow-hidden">
            <Image source={{ uri: recipe.image }} className="h-full w-full object-cover" />
            <View className="absolute inset-0 bg-black/10" />
          </View>
        )}

        <View className="p-6">
          {/* Stats Row */}
          <View className="mb-8 flex-row flex-wrap gap-2">
            <View className="bg-card border-border flex-1 items-center rounded-2xl border p-3 shadow-sm">
              <Clock size={18} className="text-accent mb-1" />
              <Text className="text-muted text-[10px] font-bold uppercase">TIME</Text>
              <Text className="text-text text-sm font-bold">{recipe.prepTime}</Text>
            </View>
            <View className="bg-card border-border flex-1 items-center rounded-2xl border p-3 shadow-sm">
              <Users size={18} className="text-primary mb-1" />
              <Text className="text-muted text-[10px] font-bold uppercase">YIELD</Text>
              <Text className="text-text text-sm font-bold">{recipe.servings} servings</Text>
            </View>
            {recipe.tags &&
              recipe.tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-card border-primary/20 flex-1 items-center rounded-2xl border p-3 shadow-sm">
                  <Zap size={18} className="text-primary mb-1" />
                  <Text className="text-muted text-[10px] font-bold uppercase">EQUIPMENT</Text>
                  <Text className="text-text text-sm font-bold">{tag}</Text>
                </View>
              ))}
          </View>

          {/* Ingredients Section */}
          <View className="mb-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-text text-lg font-bold">Ingredients</Text>
              <Pressable
                onPress={handleAddToList}
                className="bg-primary flex-row items-center gap-1 rounded-full px-3 py-1.5 active:scale-95">
                <ShoppingCart size={14} className="text-primary-foreground" />
                <Text className="text-primary-foreground text-xs font-bold">Add to List</Text>
              </Pressable>
            </View>

            <View className="bg-card border-border rounded-3xl border p-4 shadow-sm">
              {recipe.ingredients.map((ing, i) => (
                <View
                  key={i}
                  className="border-border/50 flex-row justify-between border-b py-3 last:border-0">
                  <View>
                    <Text className="text-text font-medium">{ing.name}</Text>
                    <Text className="text-primary text-[10px] font-bold uppercase">
                      {ing.category}
                    </Text>
                  </View>
                  <Text className="text-muted">{ing.amount}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions Section */}
          <View>
            <Text className="text-text mb-4 text-lg font-bold">Instructions</Text>
            <View className="gap-4">
              {recipe.steps.map((step, i) => (
                <View
                  key={i}
                  className="bg-card border-border flex-row gap-4 rounded-2xl border p-4 shadow-sm">
                  <View className="bg-primary h-6 w-6 items-center justify-center rounded-full">
                    <Text className="text-xs font-bold text-white">{i + 1}</Text>
                  </View>
                  <Text className="text-text/80 flex-1 text-sm leading-relaxed">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {showToast && (
        <View className="absolute left-0 right-0 top-24 z-[60] items-center">
          <View className="bg-primary shadow-primary/40 flex-row items-center justify-center gap-2 rounded-2xl px-6 py-3 shadow-2xl">
            <View className="rounded-full bg-white/20 p-1">
              <Check size={14} className="text-white" strokeWidth={4} />
            </View>
            <Text className="text-sm font-black tracking-tight text-white">Added to List</Text>
          </View>
        </View>
      )}
    </View>
  );
}
