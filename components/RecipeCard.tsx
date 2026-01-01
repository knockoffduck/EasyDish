import { View, Text, Image, Pressable } from 'react-native';
import { Zap, ChevronRight, BookOpen } from 'lucide-react-native';
import { Recipe } from '../types';

export default function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-card border-border mb-4 flex-row items-center rounded-3xl border p-4 shadow-sm active:scale-[0.98] transition-all">
      {/* Image / Placeholder */}
      <View className="bg-muted/20 h-20 w-20 items-center justify-center overflow-hidden rounded-2xl">
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} className="h-full w-full object-cover" />
        ) : (
          <BookOpen size={28} className="text-muted-foreground/50" />
        )}
      </View>

      {/* Content */}
      <View className="ml-4 flex-1 py-1">
        <Text className="text-card-foreground text-lg font-bold tracking-tight" numberOfLines={1}>
          {recipe.title}
        </Text>
        
        <View className="mt-2 flex-row flex-wrap gap-2">
          {/* Prep Time Badge */}
          <View className="bg-secondary px-2.5 py-1 rounded-md">
            <Text className="text-secondary-foreground text-[10px] font-bold uppercase tracking-wide">{recipe.prepTime}</Text>
          </View>

          {/* Items Count Badge */}
          <View className="bg-primary/10 px-2.5 py-1 rounded-md">
            <Text className="text-primary text-[10px] font-bold uppercase tracking-wide">
              {recipe.ingredients.length} Items
            </Text>
          </View>
        </View>
        
        {/* Tags Row */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {recipe.tags.slice(0, 3).map((tag) => (
              <View
                key={tag}
                className="flex-row items-center gap-1 rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5">
                <Zap size={8} className="text-accent" fill="currentColor" />
                <Text className="text-accent text-[9px] font-bold uppercase">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Icon */}
      <ChevronRight size={20} className="text-muted-foreground ml-2" />
    </Pressable>
  );
}
