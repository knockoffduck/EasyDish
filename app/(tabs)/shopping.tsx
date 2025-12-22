import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, X, ClipboardList, Tag, CheckCircle2 } from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const {
    shoppingList,
    toggleShoppingItem,
    clearShoppingList,
    clearCompleted,
    removeRecipeFromShoppingList,
  } = useStore();

  // Get unique source recipes
  const sourceRecipes = useMemo(() => {
    return Array.from(new Set(shoppingList.map((i) => i.sourceRecipe).filter(Boolean))) as string[];
  }, [shoppingList]);

  // Group items by category
  const groupedList = useMemo(() => {
    const groups: Record<string, typeof shoppingList> = {};
    shoppingList.forEach((item) => {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return Object.keys(groups)
      .sort()
      .map((category) => ({
        category,
        items: groups[category],
      }));
  }, [shoppingList]);

  const handleClearAll = () => {
    Alert.alert('Clear All', 'Remove all items from your shopping list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearShoppingList },
    ]);
  };

  const hasCompleted = shoppingList.some((i) => i.completed);

  return (
    <View className="bg-background flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-text text-xl font-bold">Shopping List</Text>
        <View className="flex-row gap-4">
          {shoppingList.length > 0 && (
            <Pressable onPress={handleClearAll} className="flex-row items-center gap-1">
              <Trash2 size={14} className="text-destructive" />
              <Text className="text-destructive text-xs font-bold underline">Clear All</Text>
            </Pressable>
          )}
          {hasCompleted && (
            <Pressable onPress={clearCompleted}>
              <Text className="text-primary text-xs font-bold underline">Clear Done</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        {/* Source Recipes Section */}
        {sourceRecipes.length > 0 && (
          <View className="bg-card border-border mb-6 rounded-2xl border p-4 shadow-sm">
            <Text className="text-muted mb-3 text-[10px] font-black uppercase tracking-widest">
              Shopping for {sourceRecipes.length} recipes (Tap to remove):
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {sourceRecipes.map((name) => (
                <Pressable
                  key={name}
                  onPress={() => removeRecipeFromShoppingList(name)}
                  className="bg-primary/10 border-primary/20 active:bg-destructive/10 active:border-destructive/20 flex-row items-center gap-1.5 rounded-full border px-2.5 py-1.5 shadow-sm">
                  <Text className="text-primary text-[10px] font-bold">{name}</Text>
                  <X size={10} className="text-primary/40" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {shoppingList.length === 0 ? (
          <View className="mt-20 items-center justify-center px-10">
            <View className="bg-card mb-4 h-20 w-20 items-center justify-center rounded-full">
              <ClipboardList size={40} className="text-muted/30" />
            </View>
            <Text className="text-muted text-center text-sm">Your list is empty.</Text>
            <Text className="text-muted/60 mt-1 text-center text-xs">
              Add ingredients from a recipe to see them here.
            </Text>
          </View>
        ) : (
          /* Grouped List */
          <View className="gap-6">
            {groupedList.map((group) => (
              <View key={group.category} className="gap-2">
                {/* Section Header */}
                <View className="bg-secondary/50 border-border flex-row items-center gap-2 rounded-xl border px-4 py-1.5 shadow-sm">
                  <Tag size={14} className="text-primary" />
                  <Text className="text-text text-xs font-black uppercase tracking-widest">
                    {group.category}
                  </Text>
                  <Text className="text-muted ml-auto text-[10px] font-bold">
                    {group.items.length} items
                  </Text>
                </View>

                {/* Items Card */}
                <View className="bg-card border-border overflow-hidden rounded-3xl border shadow-sm">
                  {group.items.map((item, index) => (
                    <Pressable
                      key={item.id}
                      onPress={() => toggleShoppingItem(item.id)}
                      className={`border-border/50 active:bg-primary/5 flex-row items-center gap-4 p-4 ${
                        index !== group.items.length - 1 ? 'border-b' : ''
                      }`}>
                      <View className={item.completed ? 'text-green-500' : 'text-muted'}>
                        <CheckCircle2
                          size={24}
                          fill={item.completed ? 'currentColor' : 'none'}
                          className={item.completed ? 'text-green-500' : 'text-muted'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`text-text font-medium ${
                            item.completed ? 'line-through opacity-40' : ''
                          }`}
                          numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-muted text-xs">{item.amount}</Text>
                          {item.sourceRecipe && (
                            <Text
                              className="text-primary/70 flex-1 truncate text-[9px] font-bold italic"
                              numberOfLines={1}>
                              For: {item.sourceRecipe}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
