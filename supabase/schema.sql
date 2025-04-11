-- Create tables for content management

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Content submissions table
CREATE TABLE content_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'course')),
    source_url TEXT NOT NULL,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit content"
    ON content_submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own submissions"
    ON content_submissions FOR SELECT
    USING (auth.uid() = user_id);

-- Instructor profiles table
CREATE TABLE instructor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    expertise TEXT[],
    years_of_experience INTEGER,
    social_links JSONB,
    rating DECIMAL(3,2),
    total_students INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Instructors can view their profile"
    ON instructor_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Saved videos table
CREATE TABLE saved_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can save videos"
    ON saved_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their saved videos"
    ON saved_videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved videos"
    ON saved_videos FOR DELETE
    USING (auth.uid() = user_id);

-- Watch history table
CREATE TABLE watch_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    watched_duration INTEGER DEFAULT 0,
    source TEXT NOT NULL,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can track watch history"
    ON watch_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their watch history"
    ON watch_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their watch history"
    ON watch_history FOR UPDATE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_content_submissions_user_id ON content_submissions(user_id);
CREATE INDEX idx_instructor_profiles_user_id ON instructor_profiles(user_id);
CREATE INDEX idx_saved_videos_user_id ON saved_videos(user_id);
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_last_watched ON watch_history(last_watched_at DESC); 