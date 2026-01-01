import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) {
  return (
    <View className={`w-full ${containerClassName}`}>
      {label && <Text className="text-muted-foreground mb-1.5 ml-1 text-sm font-medium">{label}</Text>}
      
      <View className={`bg-input border-border flex-row items-center rounded-2xl border px-4 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-destructive' : ''} ${props.multiline ? 'py-3' : 'h-14'}`}>
        {leftIcon && <View className="mr-3 text-muted-foreground">{leftIcon}</View>}
        
        <TextInput
          className={`text-foreground flex-1 text-base font-medium placeholder:text-muted-foreground ${className}`}
          placeholderTextColor="hsl(var(--muted-foreground))"
          {...props}
        />
        
        {rightIcon && <View className="ml-3 text-muted-foreground">{rightIcon}</View>}
      </View>
      
      {error && <Text className="text-destructive mt-1.5 ml-1 text-xs font-medium">{error}</Text>}
    </View>
  );
}
