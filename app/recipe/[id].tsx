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
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-bold text-text">Recipe not found</Text>
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

  const handleEdit = () => {
    router.push({
      pathname: '/recipe/edit',
      params: { id: recipe.id },
    });
  };

  const handleAddToList = () => {
    addToShoppingList(recipe);
    setShowToast(true);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Sticky Header */}
      <View
        className="z-10 flex-row items-center border-b border-border bg-background px-4 py-2"
        style={{ paddingTop: insets.top }}>
        <Pressable
          onPress={() => router.back()}
          className="rounded-full p-2 active:bg-secondary/20">
          <ArrowLeft size={24} className="text-text" />
        </Pressable>
        <Text className="mx-2 flex-1 truncate text-xl font-bold text-text" numberOfLines={1}>
          {recipe.title}
        </Text>
        <View className="flex-row gap-1">
          <Pressable onPress={handleEdit} className="rounded-full p-2 active:bg-secondary/20">
            <Edit2 size={20} className="text-muted" />
          </Pressable>
          <Pressable className="rounded-full p-2 active:bg-secondary/20">
            <Copy size={20} className="text-muted" />
          </Pressable>
          <Pressable onPress={handleDelete} className="rounded-full p-2 active:bg-destructive/10">
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
            <View className="flex-1 items-center rounded-2xl border border-border bg-card p-3 shadow-sm">
              <Clock size={18} className="mb-1 text-accent" />
              <Text className="text-[10px] font-bold uppercase text-muted">TIME</Text>
              <Text className="text-sm font-bold text-text">{recipe.prepTime}</Text>
            </View>
            <View className="flex-1 items-center rounded-2xl border border-border bg-card p-3 shadow-sm">
              <Users size={18} className="mb-1 text-primary" />
              <Text className="text-[10px] font-bold uppercase text-muted">YIELD</Text>
              <Text className="text-sm font-bold text-text">{recipe.servings} servings</Text>
            </View>
            {recipe.tags && (
              <View className="flex-1 items-center rounded-2xl border border-primary/20 bg-card p-3 shadow-sm">
                <Zap size={18} className="mb-1 text-primary" />
                <Text className="text-[10px] font-bold uppercase text-muted">EQUIPMENT</Text>
                {recipe.tags.map((tag) => (
                  <Text key={tag} className="text-sm font-bold text-text">
                    {tag}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Ingredients Section */}
          <View className="mb-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-text">Ingredients</Text>
              <Pressable
                onPress={handleAddToList}
                className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-1.5 active:scale-95">
                <ShoppingCart size={14} className="text-primary-foreground" />
                <Text className="text-xs font-bold text-primary-foreground">Add to List</Text>
              </Pressable>
            </View>

            <View className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              {recipe.ingredients.map((ing, i) => (
                <View
                  key={i}
                  className="flex-row justify-between border-b border-border/50 py-3 last:border-0">
                  <View>
                    <Text className="font-medium text-text">{ing.name}</Text>
                    <Text className="text-[10px] font-bold uppercase text-primary">
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
            <Text className="mb-4 text-lg font-bold text-text">Instructions</Text>
            <View className="gap-4">
              {recipe.steps.map((step, i) => (
                <View
                  key={i}
                  className="flex-row gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Text className="text-xs font-bold text-white">{i + 1}</Text>
                  </View>
                  <Text className="flex-1 text-sm leading-relaxed text-text/80">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {showToast && (
        <View className="absolute left-0 right-0 top-24 z-[60] items-center">
          <View className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 shadow-2xl shadow-primary/40">
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
