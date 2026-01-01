import { View, Text } from 'react-native';
import { ChefHat, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Button from '../ui/Button';

export default function Header() {
  const router = useRouter();

  return (
    <View className="bg-background border-border flex-row items-center justify-between border-b px-6 py-4">
      <View>
        <View className="flex-row items-center gap-2">
          <ChefHat size={28} className="text-primary" strokeWidth={2.5} />
          <Text className="text-foreground text-2xl font-black tracking-tight">EasyDish</Text>
        </View>
        <Text className="text-muted-foreground text-[11px] font-bold tracking-[0.2em] ml-1">YOUR AI SOUS CHEF</Text>
      </View>

      <Button
        onPress={() => router.push('/modal')}
        variant="primary"
        size="icon"
        icon={<Plus size={24} color="white" />}
        className="rounded-full shadow-xl shadow-primary/30"
      />
    </View>
  );
}
