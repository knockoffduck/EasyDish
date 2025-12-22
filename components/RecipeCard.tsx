import { View, Text, Image, Pressable } from 'react-native';
import { Zap, ChevronRight, BookOpen } from 'lucide-react-native';
import { Recipe } from '../types';

export default function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-card border-border mb-4 flex-row items-center rounded-3xl border p-3 shadow-sm active:scale-[0.98]">
      {/* Image / Placeholder */}
      <View className="bg-secondary/50 h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} className="h-full w-full object-cover" />
        ) : (
          <BookOpen size={24} className="text-primary" />
        )}
      </View>

      {/* Content */}
      <View className="ml-4 flex-1">
        <Text className="text-text truncate text-base font-bold" numberOfLines={1}>
          {recipe.title}
        </Text>
        <View className="mt-1 flex-row flex-wrap gap-2">
          {/* Prep Time Badge */}
          <View className="bg-secondary/20 rounded-full px-2 py-0.5">
            <Text className="text-muted text-[9px] font-black uppercase">{recipe.prepTime}</Text>
          </View>

          {/* Items Count Badge */}
          <View className="bg-primary/10 rounded-full px-2 py-0.5">
            <Text className="text-primary text-[9px] font-black uppercase">
              {recipe.ingredients.length} Items
            </Text>
          </View>

          {/* Tags */}
          {recipe.tags &&
            recipe.tags.map((tag) => (
              <View
                key={tag}
                className="bg-accent/10 flex-row items-center gap-0.5 rounded-full px-2 py-0.5">
                <Zap size={8} className="text-accent" />
                <Text className="text-accent text-[9px] font-black uppercase">{tag}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* Action Icon */}
      <ChevronRight size={20} className="text-muted" />
    </Pressable>
  );
}
