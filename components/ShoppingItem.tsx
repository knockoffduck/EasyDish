import { View, Text, Pressable } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { ShoppingItem as ShoppingItemType } from '../types';

export default function ShoppingItem({
  item,
  onToggle,
}: {
  item: ShoppingItemType;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="border-secondary/20 flex-row items-center border-b p-4">
      <CheckCircle2
        size={24}
        className={item.completed ? 'text-primary fill-primary' : 'text-secondary fill-transparent'}
      />
      <View className="ml-4 flex-1">
        <Text
          className={`font-medium ${item.completed ? 'text-secondary line-through' : 'text-text'}`}>
          {item.name}
        </Text>
        <Text className="text-secondary text-xs">{item.amount}</Text>
      </View>
      {item.sourceRecipe && (
        <Text className="text-primary text-[10px] font-bold italic">For: {item.sourceRecipe}</Text>
      )}
    </Pressable>
  );
}
