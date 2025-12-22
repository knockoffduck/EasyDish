import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Sparkles, PenLine, Camera, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store/useStore';
import { formatRecipeWithAI } from '../services/gemini';
import { processManualRecipe } from '../services/RecipeService';
import { Recipe } from '@/types';

export default function AddRecipeModal() {
  const router = useRouter();
  const { addRecipe, darkMode } = useStore();

  // State
  const [addMethod, setAddMethod] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [importText, setImportText] = useState('');

  const [manualData, setManualData] = useState({
    title: '',
    prepTime: '',
    servings: '',
    ingredients: '',
    steps: '',
  });

  // Fallback color for placeholder text
  const placeholderColor = darkMode ? '#64748b' : '#94a3b8';

  // Image Picker Logic
  const handleImageUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPreviewImage(result.assets[0].uri);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setLoading(true);
    try {
      const cleanedRecipe = await formatRecipeWithAI(importText);
      addRecipe({
        ...cleanedRecipe,
        id: Date.now().toString(),
        image: previewImage,
      });
      router.back();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSave = () => {
    if (!manualData.title.trim()) return;
    const { cleanTitle, tags } = processManualRecipe(manualData.title, manualData.steps);

    const newRecipe: Recipe = {
      id: Date.now().toString(),
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

    addRecipe(newRecipe);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-background flex-1">
      {/* Header */}
      <View className="bg-card border-border flex-row items-center justify-between border-b px-6 py-4">
        <Text className="text-text text-xl font-bold">New Recipe</Text>
        <Pressable
          onPress={() => router.back()}
          className="active:bg-secondary/20 rounded-full p-1">
          <X size={24} className="text-muted" />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Photo Upload Section */}
        <View className="mb-4">
          {previewImage ? (
            <View className="bg-card border-border relative h-32 w-full overflow-hidden rounded-2xl border">
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
              className="bg-input border-border active:border-primary h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed">
              <Camera className="text-primary" size={24} />
              <Text className="text-muted text-[10px] font-black uppercase tracking-widest">
                Add Photo
              </Text>
            </Pressable>
          )}
        </View>

        {/* Method Switcher */}
        <View className="bg-input border-border mb-6 flex-row self-center rounded-2xl border p-1">
          <Pressable
            onPress={() => setAddMethod('ai')}
            className={`flex-row items-center gap-2 rounded-xl px-6 py-2 transition-all ${
              addMethod === 'ai' ? 'bg-card shadow-md' : ''
            }`}>
            <Sparkles size={14} className={addMethod === 'ai' ? 'text-primary' : 'text-muted'} />
            <Text
              className={`text-xs font-black transition-all ${
                addMethod === 'ai' ? 'text-primary' : 'text-muted'
              }`}>
              Magic AI
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAddMethod('manual')}
            className={`flex-row items-center gap-2 rounded-xl px-6 py-2 transition-all ${
              addMethod === 'manual' ? 'bg-card shadow-md' : ''
            }`}>
            <PenLine size={14} className={addMethod === 'manual' ? 'text-primary' : 'text-muted'} />
            <Text
              className={`text-xs font-black transition-all ${
                addMethod === 'manual' ? 'text-primary' : 'text-muted'
              }`}>
              Manual
            </Text>
          </Pressable>
        </View>

        {/* Form Content */}
        <View className="pb-10">
          {addMethod === 'ai' ? (
            <View className="gap-4">
              <Text className="text-muted text-xs leading-relaxed">
                Paste recipe text. AI will strip equipment from title and create tags.
              </Text>
              <TextInput
                multiline
                placeholder="Paste messy recipe text here..."
                placeholderTextColor={placeholderColor}
                value={importText}
                onChangeText={setImportText}
                className="bg-input border-border text-text h-40 rounded-2xl border p-5 text-sm"
                style={{ textAlignVertical: 'top' }}
              />
              <Pressable
                onPress={handleImport}
                disabled={loading || !importText.trim()}
                className={`shadow-primary/30 flex-row items-center justify-center rounded-2xl py-4 shadow-xl active:scale-95 ${
                  loading || !importText.trim() ? 'bg-border' : 'bg-primary'
                }`}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-xs font-black uppercase tracking-tight text-white">
                    Format with AI
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View className="gap-4">
              <TextInput
                placeholder="Recipe Title (e.g. Air Fryer Salmon)"
                placeholderTextColor={placeholderColor}
                value={manualData.title}
                onChangeText={(t) => setManualData({ ...manualData, title: t })}
                className="bg-input border-border text-text rounded-xl border px-4 py-3 text-sm"
              />
              <View className="flex-row gap-3">
                <TextInput
                  placeholder="Time (e.g. 45 mins)"
                  placeholderTextColor={placeholderColor}
                  value={manualData.prepTime}
                  onChangeText={(t) => setManualData({ ...manualData, prepTime: t })}
                  className="bg-input border-border text-text flex-1 rounded-xl border px-4 py-3 text-sm"
                />
                <TextInput
                  placeholder="Yield (e.g. 4)"
                  placeholderTextColor={placeholderColor}
                  value={manualData.servings}
                  onChangeText={(t) => setManualData({ ...manualData, servings: t })}
                  className="bg-input border-border text-text w-24 rounded-xl border px-4 py-3 text-sm"
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-muted mb-2 text-[10px] font-bold uppercase">
                  Ingredients (One per line)
                </Text>
                <TextInput
                  multiline
                  placeholder="2 cups Flour&#10;1 tsp Salt"
                  placeholderTextColor={placeholderColor}
                  value={manualData.ingredients}
                  onChangeText={(t) => setManualData({ ...manualData, ingredients: t })}
                  className="bg-input border-border text-text h-32 rounded-xl border p-4 text-sm"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              <View>
                <Text className="text-muted mb-2 text-[10px] font-bold uppercase">
                  Instructions (One per line)
                </Text>
                <TextInput
                  multiline
                  placeholder="Preheat oven to 350F&#10;Mix dry ingredients"
                  placeholderTextColor={placeholderColor}
                  value={manualData.steps}
                  onChangeText={(t) => setManualData({ ...manualData, steps: t })}
                  className="bg-input border-border text-text h-32 rounded-xl border p-4 text-sm"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              <Pressable
                onPress={handleManualSave}
                disabled={!manualData.title.trim()}
                className={`shadow-primary/30 flex-row items-center justify-center rounded-2xl py-4 shadow-xl active:scale-95 ${
                  !manualData.title.trim() ? 'bg-border' : 'bg-primary'
                }`}>
                <Text className="text-xs font-black uppercase tracking-tight text-white">
                  Save Recipe
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
