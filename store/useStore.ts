import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Recipe, ShoppingItem } from '../types';
import { User } from '@supabase/supabase-js';
import { colorScheme } from 'nativewind';
import { supabase } from '@/services/supabase';

interface StoreState {
  // --- Data ---
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  user: User | null;

  // --- UI Preferences ---
  darkMode: boolean;
  unitSystem: 'metric' | 'imperial';

  // --- Actions ---
  // Recipes
  addRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  fetchRecipes: () => Promise<void>;

  // Shopping List (Local Only)
  addToShoppingList: (recipe: Recipe) => void;
  toggleShoppingItem: (id: string) => void;
  clearShoppingList: () => void;
  clearCompleted: () => void;
  removeRecipeFromShoppingList: (recipeTitle: string) => void;

  // Auth
  setUser: (user: User | null) => void;

  // UI
  setDarkMode: (enabled: boolean) => void;
  setUnitSystem: (system: 'metric' | 'imperial') => void;
}

/**
 * Utility to check if a string is a valid UUID
 */
const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * Maps the local Recipe object to the Supabase table schema (snake_case columns)
 */
const mapRecipeToSupabase = (recipe: Recipe, userId: string) => {
  const data: any = {
    user_id: userId,
    title: recipe.title,
    prep_time: recipe.prepTime,
    servings: recipe.servings,
    image_url: recipe.image || null,
    tags: recipe.tags || [],
    ingredients: recipe.ingredients,
    steps: recipe.steps,
  };

  // Only include ID if it's a valid UUID to avoid database syntax errors
  if (isUuid(recipe.id)) {
    data.id = recipe.id;
  }

  return data;
};

/**
 * Maps Supabase recipe columns back to the local Recipe interface
 */
const mapSupabaseToRecipe = (row: any): Recipe => ({
  id: row.id,
  title: row.title,
  prepTime: row.prep_time,
  servings: row.servings,
  image: row.image_url,
  tags: row.tags || [],
  ingredients: row.ingredients || [],
  steps: row.steps || [],
});

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      recipes: [],
      shoppingList: [],
      user: null,
      darkMode: Appearance.getColorScheme() === 'dark',
      unitSystem: 'metric',

      // --- Sync Actions (Recipes Only) ---
      fetchRecipes: async () => {
        const { user } = get();
        if (!user) return;
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          set({ recipes: data.map(mapSupabaseToRecipe) });
        } else if (error) {
          console.error('Error fetching recipes:', error.message);
        }
      },

      // --- Recipe Actions ---
      addRecipe: async (recipe) => {
        const { user } = get();
        let finalRecipe = { ...recipe };

        // 1. If logged in, sync to Supabase first to get the official UUID
        if (user) {
          const supabaseData = mapRecipeToSupabase(recipe, user.id);
          const { data, error } = await supabase
            .from('recipes')
            .upsert(supabaseData)
            .select()
            .single();

          if (error) {
            console.error('Error syncing recipe to Supabase:', error.message);
          } else if (data) {
            finalRecipe = mapSupabaseToRecipe(data);
          }
        }

        // 2. Update local state
        set((state) => {
          const otherRecipes = state.recipes.filter((r) => r.id !== recipe.id);
          return { recipes: [finalRecipe, ...otherRecipes] };
        });
      },

      deleteRecipe: async (id) => {
        const { user } = get();

        // Optimistic local delete
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        }));

        if (user && isUuid(id)) {
          const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) console.error('Error deleting recipe from Supabase:', error.message);
        }
      },

      // --- Shopping List Actions (Local Only) ---
      addToShoppingList: (recipe) =>
        set((state) => {
          const newItems: ShoppingItem[] = recipe.ingredients.map((ing) => ({
            id: Math.random().toString(36).substring(7),
            name: ing.name,
            amount: ing.amount,
            category: ing.category || 'Other',
            completed: false,
            sourceRecipe: recipe.title,
          }));
          return { shoppingList: [...state.shoppingList, ...newItems] };
        }),

      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),

      clearShoppingList: () => set({ shoppingList: [] }),

      clearCompleted: () =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => !item.completed),
        })),

      removeRecipeFromShoppingList: (recipeTitle: string) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => item.sourceRecipe !== recipeTitle),
        })),

      // --- Auth ---
      setUser: (user) => {
        set({ user });
        if (user) {
          get().fetchRecipes();
        }
      },

      // --- UI ---
      setDarkMode: (darkMode) => {
        set({ darkMode });
        colorScheme.set(darkMode ? 'dark' : 'light');
      },
      setUnitSystem: (unitSystem) => set({ unitSystem }),
    }),
    {
      name: 'easydish-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
