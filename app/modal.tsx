import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable, // Kept for custom layouts like ImagePicker
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
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
        <Text className="text-foreground text-xl font-bold">New Recipe</Text>
        <Button
          onPress={() => router.back()}
          variant="ghost"
          size="icon"
          icon={<X size={24} className="text-muted-foreground" />}
        />
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
                  className="rounded-full bg-white p-2 shadow-lg active:scale-95 transition-all">
                  <Camera size={16} className="text-zinc-900" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => setPreviewImage(null)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 backdrop-blur-sm active:scale-95">
                <Trash2 size={16} color="white" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleImageUpload}
              className="bg-muted/10 border-border active:border-primary h-24 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed transition-all active:bg-muted/20">
              <Camera className="text-primary" size={24} />
              <Text className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                Add Photo
              </Text>
            </Pressable>
          )}
        </View>

        {/* Method Switcher */}
        <View className="bg-muted/10 border-border mb-6 flex-row self-center rounded-2xl border p-1">
          <Pressable
            onPress={() => setAddMethod('ai')}
            className={`flex-row items-center gap-2 rounded-xl px-6 py-2 transition-all ${
              addMethod === 'ai' ? 'bg-background shadow-sm' : ''
            }`}>
            <Sparkles size={14} className={addMethod === 'ai' ? 'text-primary' : 'text-muted-foreground'} />
            <Text
              className={`text-xs font-black transition-all ${
                addMethod === 'ai' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
              Magic AI
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAddMethod('manual')}
            className={`flex-row items-center gap-2 rounded-xl px-6 py-2 transition-all ${
              addMethod === 'manual' ? 'bg-background shadow-sm' : ''
            }`}>
            <PenLine size={14} className={addMethod === 'manual' ? 'text-primary' : 'text-muted-foreground'} />
            <Text
              className={`text-xs font-black transition-all ${
                addMethod === 'manual' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
              Manual
            </Text>
          </Pressable>
        </View>

        {/* Form Content */}
        <View className="pb-10">
          {addMethod === 'ai' ? (
            <View className="gap-5">
              <Text className="text-muted-foreground text-xs leading-relaxed">
                Paste recipe text. AI will strip equipment from title and create tags.
              </Text>
              <Input
                multiline
                placeholder="Paste messy recipe text here..."
                value={importText}
                onChangeText={setImportText}
                className="h-40 py-4 text-sm"
                containerClassName="bg-input"
                textAlignVertical='top'
              />
              <Button
                onPress={handleImport}
                disabled={loading || !importText.trim()}
                loading={loading}
                title="Format with AI"
                variant="primary"
                size="lg"
                className="w-full rounded-2xl"
                icon={<Sparkles size={16} color="white" />}
              />
            </View>
          ) : (
            <View className="gap-4">
              <Input
                placeholder="Recipe Title (e.g. Air Fryer Salmon)"
                value={manualData.title}
                onChangeText={(t) => setManualData({ ...manualData, title: t })}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    placeholder="Time (e.g. 45m)"
                    value={manualData.prepTime}
                    onChangeText={(t) => setManualData({ ...manualData, prepTime: t })}
                  />
                </View>
                <View className="w-24">
                  <Input
                    placeholder="Yield"
                    value={manualData.servings}
                    onChangeText={(t) => setManualData({ ...manualData, servings: t })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View>
                <Text className="text-muted-foreground mb-2 text-[10px] font-bold uppercase">
                  Ingredients
                </Text>
                <Input
                  multiline
                  placeholder="2 cups Flour&#10;1 tsp Salt"
                  value={manualData.ingredients}
                  onChangeText={(t) => setManualData({ ...manualData, ingredients: t })}
                  className="h-32 text-sm"
                  textAlignVertical='top'
                />
              </View>

              <View>
                <Text className="text-muted-foreground mb-2 text-[10px] font-bold uppercase">
                  Instructions
                </Text>
                <Input
                  multiline
                  placeholder="Preheat oven to 350F&#10;Mix dry ingredients"
                  value={manualData.steps}
                  onChangeText={(t) => setManualData({ ...manualData, steps: t })}
                  className="h-32 text-sm"
                  textAlignVertical='top'
                />
              </View>

              <Button
                onPress={handleManualSave}
                disabled={!manualData.title.trim()}
                title="Save Recipe"
                variant={!manualData.title.trim() ? 'secondary' : 'primary'}
                size="lg"
                className="w-full rounded-2xl mt-4"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
