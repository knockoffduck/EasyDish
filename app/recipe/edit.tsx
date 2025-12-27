import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../store/useStore';
import { processManualRecipe } from '../../services/RecipeService';
import { Recipe } from '@/types';

export default function EditRecipeModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, updateRecipe, darkMode } = useStore(); // Assuming you have updateRecipe in store

  // Find the existing recipe
  const existingRecipe = recipes.find((r) => r.id === id);

  // State
  const [previewImage, setPreviewImage] = useState<string | null>(existingRecipe?.image || null);
  const [manualData, setManualData] = useState({
    title: existingRecipe?.title || '',
    prepTime: existingRecipe?.prepTime || '',
    servings: existingRecipe?.servings || '',
    ingredients: existingRecipe?.ingredients.map((i) => i.name).join('\n') || '',
    steps: existingRecipe?.steps.join('\n') || '',
  });

  const placeholderColor = darkMode ? '#64748b' : '#94a3b8';

  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    if (!result.canceled) setPreviewImage(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!manualData.title.trim() || !id) return;

    const { cleanTitle, tags } = processManualRecipe(manualData.title, manualData.steps);

    const updatedRecipe: Recipe = {
      ...existingRecipe!, // Keep existing metadata (dates, etc)
      id: id,
      title: cleanTitle,
      prepTime: manualData.prepTime,
      servings: manualData.servings,
      tags,
      image: previewImage,
      ingredients: manualData.ingredients
        .split('\n')
        .filter((i) => i.trim())
        .map((i) => ({
          name: i.trim(),
          amount: '',
          category: 'Other',
        })),
      steps: manualData.steps.split('\n').filter((s) => s.trim()),
    };

    updateRecipe(updatedRecipe);
    router.back();
  };

  if (!existingRecipe) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border bg-card px-6 py-4">
        <Text className="text-xl font-bold text-text">Edit Recipe</Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-full p-1 active:bg-secondary/20">
          <X size={24} className="text-muted" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Photo Upload Section */}
        <View className="mb-6">
          {previewImage ? (
            <View className="relative h-32 w-full overflow-hidden rounded-2xl border border-border bg-card">
              <Image source={{ uri: previewImage }} className="h-full w-full object-cover" />
              <View className="absolute inset-0 items-center justify-center bg-black/20">
                <Pressable
                  onPress={handleImageUpload}
                  className="rounded-full bg-white p-2 shadow-lg">
                  <Camera size={16} className="text-slate-900" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => setPreviewImage(null)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                <Trash2 size={16} color="white" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleImageUpload}
              className="h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-input active:border-primary">
              <Camera className="text-primary" size={24} />
              <Text className="text-[10px] font-black uppercase tracking-widest text-muted">
                Add Photo
              </Text>
            </Pressable>
          )}
        </View>

        {/* Form Fields */}
        <View className="gap-4 pb-10">
          <TextInput
            placeholder="Recipe Title"
            placeholderTextColor={placeholderColor}
            value={manualData.title}
            onChangeText={(t) => setManualData({ ...manualData, title: t })}
            className="rounded-xl border border-border bg-input px-4 py-3 text-sm text-text"
          />

          <View className="flex-row gap-3">
            <TextInput
              placeholder="Time"
              placeholderTextColor={placeholderColor}
              value={manualData.prepTime}
              onChangeText={(t) => setManualData({ ...manualData, prepTime: t })}
              className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-sm text-text"
            />
            <TextInput
              placeholder="Yield"
              placeholderTextColor={placeholderColor}
              value={manualData.servings}
              onChangeText={(t) => setManualData({ ...manualData, servings: t })}
              className="w-24 rounded-xl border border-border bg-input px-4 py-3 text-sm text-text"
              keyboardType="numeric"
            />
          </View>

          <View>
            <Text className="mb-2 text-[10px] font-bold uppercase text-muted">Ingredients</Text>
            <TextInput
              multiline
              value={manualData.ingredients}
              onChangeText={(t) => setManualData({ ...manualData, ingredients: t })}
              className="h-32 rounded-xl border border-border bg-input p-4 text-sm text-text"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          <View>
            <Text className="mb-2 text-[10px] font-bold uppercase text-muted">Instructions</Text>
            <TextInput
              multiline
              value={manualData.steps}
              onChangeText={(t) => setManualData({ ...manualData, steps: t })}
              className="h-32 rounded-xl border border-border bg-input p-4 text-sm text-text"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!manualData.title.trim()}
            className={`flex-row items-center justify-center rounded-2xl py-4 shadow-xl shadow-primary/30 active:scale-95 ${
              !manualData.title.trim() ? 'bg-border' : 'bg-primary'
            }`}>
            <Text className="text-xs font-black uppercase tracking-tight text-white">
              Save Changes
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
