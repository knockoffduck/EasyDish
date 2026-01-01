import React, { useState } from 'react';
import {
  View,
  Text,
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
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
          <Text className="text-foreground text-2xl font-bold">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Button
            onPress={() => router.back()}
            variant="ghost"
            size="icon"
            icon={<X size={24} className="text-muted-foreground" />}
            className="rounded-full hover:bg-muted/10"
          />
        </View>

        <View className="gap-5">
          {/* First/Last Name for Signup */}
          {authMode === 'signup' && (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="First Name"
                      value={value}
                      onChangeText={onChange}
                      error={errors.firstName?.message}
                      className="bg-input"
                    />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="Last Name"
                      value={value}
                      onChangeText={onChange}
                      error={errors.lastName?.message}
                      className="bg-input"
                    />
                  )}
                />
              </View>
            </View>
          )}

          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email Address"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                leftIcon={<Mail size={18} className="text-muted-foreground" />}
              />
            )}
          />

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                leftIcon={<Lock size={18} className="text-muted-foreground" />}
              />
            )}
          />

          {/* Confirm Password Field */}
          {authMode === 'signup' && (
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Confirm Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  leftIcon={<Check size={18} className="text-muted-foreground" />}
                />
              )}
            />
          )}

          {/* Submit Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            variant="primary"
            size="lg"
            className="mt-4 rounded-2xl w-full"
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-primary-foreground text-sm font-bold uppercase tracking-wider">
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
              {!loading && <ArrowRight size={18} className="text-primary-foreground" />}
            </View>
          </Button>

          {/* Toggle Mode */}
          <View className="mt-4 flex-row items-center justify-center gap-2">
            <Text className="text-muted-foreground text-sm">
              {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <Button
              onPress={toggleMode}
              variant="ghost"
              size="sm"
              className="px-2"
              title={authMode === 'signin' ? 'Join Now' : 'Sign In'}
              textClassName="text-primary font-bold"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
