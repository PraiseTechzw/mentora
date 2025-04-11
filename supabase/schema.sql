-- Create tables for Mentora app

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  preferences JSONB
);

-- Watch history table
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_thumbnail TEXT NOT NULL,
  video_duration TEXT NOT NULL,
  watched_duration TEXT NOT NULL,
  source TEXT NOT NULL
);

-- Saved videos table
CREATE TABLE IF NOT EXISTS public.saved_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_thumbnail TEXT NOT NULL,
  video_duration TEXT NOT NULL,
  source TEXT NOT NULL,
  UNIQUE(user_id, video_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Insert default categories
INSERT INTO public.categories (name, icon, color)
VALUES
  ('Programming', 'code', '#FF6B6B'),
  ('Mathematics', 'calculator', '#4ECDC4'),
  ('Science', 'flask', '#45B7D1'),
  ('History', 'book', '#96CEB4'),
  ('Languages', 'language', '#FFEEAD'),
  ('Arts', 'palette', '#D4A5A5'),
  ('Business', 'briefcase', '#9B59B6')
ON CONFLICT (name) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only access their own watch history
CREATE POLICY "Users can view own watch history" ON public.watch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history" ON public.watch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history" ON public.watch_history
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own saved videos
CREATE POLICY "Users can view own saved videos" ON public.saved_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved videos" ON public.saved_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved videos" ON public.saved_videos
  FOR DELETE USING (auth.uid() = user_id);

-- Categories are readable by all authenticated users
CREATE POLICY "Categories are viewable by all users" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated'); 