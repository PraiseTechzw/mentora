import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get environment variables with fallbacks
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;

// Check if we're in development mode
const isDevelopment = __DEV__;

// Create a mock Supabase client for development when credentials are missing
const createMockClient = () => {
  console.warn('Using mock Supabase client in development mode');
  return {
    auth: {
      signIn: async () => ({ data: { user: { id: 'mock-user' } }, error: null }),
      signUp: async () => ({ data: { user: { id: 'mock-user' } }, error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
  };
};

// Initialize Supabase client
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  if (isDevelopment) {
    console.warn('Missing Supabase environment variables. Using mock client in development mode.');
    supabase = createMockClient();
  } else {
    throw new Error(
      'Missing Supabase environment variables. Please check your configuration in app.config.ts and .env file.'
    );
  }
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('Failed to create Supabase client:', error);
      supabase = createMockClient();
    } else {
      throw new Error('Failed to initialize Supabase client. Please check your configuration.');
    }
  }
}

export { supabase };

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          avatar_url: string | null
          preferences: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name: string
          avatar_url?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
          avatar_url?: string | null
          preferences?: Json | null
        }
      }
      watch_history: {
        Row: {
          id: string
          created_at: string
          user_id: string
          video_id: string
          video_title: string
          video_thumbnail: string
          video_duration: string
          watched_duration: string
          source: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          video_id: string
          video_title: string
          video_thumbnail: string
          video_duration: string
          watched_duration: string
          source: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          video_id?: string
          video_title?: string
          video_thumbnail?: string
          video_duration?: string
          watched_duration?: string
          source?: string
        }
      }
      saved_videos: {
        Row: {
          id: string
          created_at: string
          user_id: string
          video_id: string
          video_title: string
          video_thumbnail: string
          video_duration: string
          source: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          video_id: string
          video_title: string
          video_thumbnail: string
          video_duration: string
          source: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          video_id?: string
          video_title?: string
          video_thumbnail?: string
          video_duration?: string
          source?: string
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          icon: string
          color: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          icon: string
          color: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          icon?: string
          color?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 