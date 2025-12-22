import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 1. Get your keys from the .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// 2. Initialize the client with a custom storage adapter
// This ensures that when the user closes the app, they stay logged in
// and their local data remains synced.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Helper to check if the connection is active.
 * Useful for debugging during initial setup.
 */
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('recipes').select('count');
    if (error) {
      console.error('Supabase connection failed:', error.message);
      return false;
    }
    console.log('Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('Unexpected error connecting to Supabase:', err);
    return false;
  }
};
