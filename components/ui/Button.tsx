import React from 'react';
import { Text, Pressable, View, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  onPress: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  children?: React.ReactNode;
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'default',
  icon,
  disabled = false,
  loading = false,
  className = '',
  textClassName = '',
  children,
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-2xl active:opacity-90 active:scale-[0.98] transition-all';
  
  const variants = {
    primary: 'bg-primary shadow-lg shadow-primary/25',
    secondary: 'bg-secondary',
    outline: 'bg-transparent border border-border',
    ghost: 'bg-transparent',
    destructive: 'bg-destructive shadow-lg shadow-destructive/25',
  };

  const sizes = {
    sm: 'px-3 py-1.5',
    default: 'px-5 py-3.5',
    lg: 'px-8 py-4',
    icon: 'p-3',
  };

  const textVariants = {
    primary: 'text-primary-foreground font-bold',
    secondary: 'text-secondary-foreground font-medium',
    outline: 'text-foreground font-medium',
    ghost: 'text-foreground font-medium',
    destructive: 'text-destructive-foreground font-bold',
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' || variant === 'secondary' ? '#64748b' : '#ffffff'} />
      ) : (
        <>
          {icon && <View className={title ? 'mr-2' : ''}>{icon}</View>}
          {title && <Text className={`text-base ${textVariants[variant]} ${textClassName}`}>{title}</Text>}
          {children}
        </>
      )}
    </Pressable>
  );
}
