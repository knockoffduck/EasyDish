import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Mail, Lock, Check, ArrowRight } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { useStore } from '../store/useStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../services/supabase';

// --- Validation Schema ---
const authSchema = z
  .object({
    authMode: z.enum(['signin', 'signup']),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .superRefine(({ authMode, password, confirmPassword, firstName, lastName }, ctx) => {
    if (authMode === 'signup') {
      if (!firstName || firstName.trim().length < 2) {
        ctx.addIssue({ code: 'custom', message: 'Required', path: ['firstName'] });
      }
      if (!lastName || lastName.trim().length < 2) {
        ctx.addIssue({ code: 'custom', message: 'Required', path: ['lastName'] });
      }
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      }
    }
  });

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthModal() {
  const router = useRouter();
  const { darkMode } = useStore();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  // Fallback color for placeholder text
  const placeholderColor = darkMode ? '#64748b' : '#94a3b8';

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      authMode: 'signin',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const toggleMode = () => {
    const newMode = authMode === 'signin' ? 'signup' : 'signin';
    setAuthMode(newMode);
    setValue('authMode', newMode);
    reset();
  };

  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            },
          },
        });
        if (error) throw error;
        Alert.alert('Success!', 'Please check your email to verify your account.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-background flex-1">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-8 pt-12"
        showsVerticalScrollIndicator={false}>
        <View className="mb-8 flex-row items-center justify-between">
          <Text className="text-text text-2xl font-bold">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="active:bg-secondary/20 rounded-full p-2">
            <X size={24} className="text-muted" />
          </Pressable>
        </View>

        <View className="gap-4">
          {/* First/Last Name for Signup */}
          {authMode === 'signup' && (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="First Name"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      className={`bg-input text-text rounded-2xl border px-4 py-3.5 text-sm ${
                        errors.firstName ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Last Name"
                      placeholderTextColor={placeholderColor}
                      value={value}
                      onChangeText={onChange}
                      className={`bg-input text-text rounded-2xl border px-4 py-3.5 text-sm ${
                        errors.lastName ? 'border-destructive' : 'border-border'
                      }`}
                    />
                  )}
                />
              </View>
            </View>
          )}

          {/* Email Field */}
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Mail size={16} className="text-muted" />
            </View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor={placeholderColor}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  className={`bg-input text-text rounded-2xl border py-3.5 pl-11 pr-4 text-sm ${
                    errors.email ? 'border-destructive' : 'border-border'
                  }`}
                />
              )}
            />
          </View>

          {/* Password Field */}
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Lock size={16} className="text-muted" />
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  className={`bg-input text-text rounded-2xl border py-3.5 pl-11 pr-4 text-sm ${
                    errors.password ? 'border-destructive' : 'border-border'
                  }`}
                />
              )}
            />
          </View>

          {/* Confirm Password Field */}
          {authMode === 'signup' && (
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Check size={16} className="text-muted" />
              </View>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor={placeholderColor}
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    className={`bg-input text-text rounded-2xl border py-3.5 pl-11 pr-4 text-sm ${
                      errors.confirmPassword ? 'border-destructive' : 'border-border'
                    }`}
                  />
                )}
              />
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-primary shadow-primary/30 mt-2 flex-row items-center justify-center rounded-2xl py-4 shadow-xl active:scale-95">
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-black uppercase tracking-tight text-white">
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Text>
                <ArrowRight size={16} className="text-white" />
              </View>
            )}
          </Pressable>

          {/* Toggle Mode */}
          <View className="mt-2 flex-row items-center justify-center gap-2">
            <Text className="text-muted text-xs">
              {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Pressable onPress={toggleMode}>
              <Text className="text-primary text-xs font-black">
                {authMode === 'signin' ? 'Join Now' : 'Sign In'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
