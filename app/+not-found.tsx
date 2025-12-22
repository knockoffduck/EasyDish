import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { ChefHat, ArrowLeft } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      {/* This updates the navigation header for this specific screen */}
      <Stack.Screen options={{ title: 'Page Not Found', headerShown: true }} />

      <View className="bg-background flex-1 items-center justify-center p-6">
        <View className="bg-secondary/10 mb-6 rounded-full p-6">
          <ChefHat size={64} className="text-primary" />
        </View>

        <Text className="text-text mb-2 text-center text-2xl font-black">Lost in the kitchen?</Text>

        <Text className="text-secondary mb-10 text-center leading-5">
          We couldnt find the recipe or page you were looking for.
        </Text>

        <Link href="/" asChild>
          <View className="bg-primary shadow-primary/30 flex-row items-center rounded-2xl px-8 py-4 shadow-lg active:scale-95">
            <ArrowLeft size={20} className="text-text" />
            <Text className="text-text ml-3 font-black">Back to Recipes</Text>
          </View>
        </Link>
      </View>
    </>
  );
}
