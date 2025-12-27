import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Trash2,
  X,
  ClipboardList,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Wallet,
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const {
    shoppingList,
    toggleShoppingItem,
    clearShoppingList,
    clearCompleted,
    removeRecipeFromShoppingList,
  } = useStore();

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // --- Calculations ---
  const totals = useMemo(() => {
    const total = shoppingList.reduce((acc, item) => acc + (item.price || 0), 0);
    console.log(shoppingList);
    const remaining = shoppingList
      .filter((i) => !i.completed)
      .reduce((acc, item) => acc + (item.price || 0), 0);

    return {
      total: (total / 100).toFixed(2),
      remaining: (remaining / 100).toFixed(2),
      matchedCount: shoppingList.filter((i) => i.isMatched).length,
    };
  }, [shoppingList]);

  const sourceRecipes = useMemo(() => {
    return Array.from(new Set(shoppingList.map((i) => i.sourceRecipe).filter(Boolean))) as string[];
  }, [shoppingList]);

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

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-xl font-bold text-text">Shopping List</Text>
        <View className="flex-row gap-4">
          {shoppingList.length > 0 && (
            <Pressable onPress={handleClearAll} className="flex-row items-center gap-1">
              <Trash2 size={14} className="text-destructive" />
              <Text className="text-xs font-bold text-destructive underline">Clear All</Text>
            </Pressable>
          )}
          {shoppingList.some((i) => i.completed) && (
            <Pressable onPress={clearCompleted}>
              <Text className="text-xs font-bold text-primary underline">Clear Done</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        {/* Price Summary Card */}
        {shoppingList.length > 0 && (
          <View className="mb-6 flex-row items-center gap-4 rounded-[2rem] border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <View className="rounded-2xl bg-primary p-3">
              <Wallet size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                Est. Basket Total
              </Text>
              <Text className="text-2xl font-black text-text">${totals.total}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-bold text-muted">Left to pay</Text>
              <Text className="font-bold text-primary">${totals.remaining}</Text>
            </View>
          </View>
        )}

        {/* Source Recipes Section */}
        {sourceRecipes.length > 0 && (
          <View className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Text className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">
              Shopping for {sourceRecipes.length} recipes:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {sourceRecipes.map((name) => (
                <Pressable
                  key={name}
                  onPress={() => removeRecipeFromShoppingList(name)}
                  className="flex-row items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1.5 active:border-destructive/20 active:bg-destructive/10">
                  <Text className="text-[10px] font-bold text-primary">{name}</Text>
                  <X size={10} className="text-primary/40" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {shoppingList.length === 0 ? (
          <View className="mt-20 items-center justify-center px-10">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-card">
              <ClipboardList size={40} className="text-muted/30" />
            </View>
            <Text className="text-center text-sm text-muted">Your list is empty.</Text>
          </View>
        ) : (
          /* Grouped List */
          <View className="gap-4">
            {groupedList.map((group) => {
              const isCollapsed = collapsedCategories[group.category];

              return (
                <View key={group.category} className="gap-2">
                  <Pressable
                    onPress={() => toggleCategory(group.category)}
                    className="flex-row items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 shadow-sm active:opacity-70">
                    {isCollapsed ? (
                      <ChevronRight size={16} className="text-primary" />
                    ) : (
                      <ChevronDown size={16} className="text-primary" />
                    )}
                    <Tag size={14} className="text-primary/60" />
                    <Text className="text-xs font-black uppercase tracking-widest text-text">
                      {group.category}
                    </Text>
                    <Text className="ml-auto text-[10px] font-bold text-muted">
                      {group.items.length} items
                    </Text>
                  </Pressable>

                  {!isCollapsed && (
                    <View className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                      {group.items.map((item, index) => (
                        <Pressable
                          key={item.id}
                          onPress={() => toggleShoppingItem(item.id)}
                          className={`flex-row items-center gap-4 border-border/50 p-4 active:bg-primary/5 ${index !== group.items.length - 1 ? 'border-b' : ''}`}>
                          <CheckCircle2
                            size={24}
                            fill={item.completed ? '#22c55e' : 'none'}
                            className={item.completed ? 'text-green-500' : 'text-muted'}
                          />

                          <View className="flex-1">
                            <Text
                              className={`font-medium text-text ${item.completed ? 'line-through opacity-40' : ''}`}
                              numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text className="text-xs text-muted">{item.amount || '1 unit'}</Text>
                          </View>

                          {/* Individual Price Tag */}
                          {item.price && (
                            <View
                              className={`rounded-lg px-2 py-1 ${item.completed ? 'bg-muted/10' : 'bg-primary/10'}`}>
                              <Text
                                className={`text-[10px] font-black ${item.completed ? 'text-muted' : 'text-primary'}`}>
                                ${(item.price / 100).toFixed(2)}
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
