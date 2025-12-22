import { View, Text, Pressable } from 'react-native';
import { ChefHat, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Header() {
  const router = useRouter();

  return (
    <View className="bg-background border-border flex-row items-center justify-between border-b p-6 pb-4">
      <View>
        <View className="flex-row items-center gap-2">
          <ChefHat size={24} className="text-primary" fill="currentColor" />
          <Text className="text-primary text-2xl font-black tracking-tighter">EasyDish</Text>
        </View>
        <Text className="text-muted text-[10px] font-bold tracking-widest">YOUR AI SOUS CHEF</Text>
      </View>

      <Pressable
        onPress={() => router.push('/modal')}
        className="bg-primary shadow-primary/20 rounded-2xl p-3 shadow-lg active:scale-95">
        <Plus size={24} className="text-white" />
      </Pressable>
    </View>
  );
}
