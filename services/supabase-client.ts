import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get Supabase credentials from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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