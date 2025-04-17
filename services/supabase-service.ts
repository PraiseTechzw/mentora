import { supabase, Database } from './supabase-client';

// User operations
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: Database['public']['Tables']['users']['Update']) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

// Watch history operations
export async function addToWatchHistory(userId: string, video: YouTubeVideo, watchedDuration: string) {
  const { data, error } = await supabase
    .from('watch_history')
    .insert({
      user_id: userId,
      video_id: video.id,
      video_title: video.title,
      video_thumbnail: video.thumbnail,
      video_duration: video.duration,
      watched_duration: watchedDuration,
      source: 'youtube'
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to watch history:', error);
    return null;
  }

  return data;
}

export async function getWatchHistory(userId: string) {
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching watch history:', error);
    return [];
  }

  return data;
}

// Saved videos operations
export async function saveVideoToLibrary(userId: string, video: YouTubeVideo) {
  // Check if video is already saved
  const { data: existingVideo } = await supabase
    .from('saved_videos')
    .select('*')
    .eq('user_id', userId)
    .eq('video_id', video.id)
    .single();

  if (existingVideo) {
    return existingVideo; // Video already saved
  }

  const { data, error } = await supabase
    .from('saved_videos')
    .insert({
      user_id: userId,
      video_id: video.id,
      video_title: video.title,
      video_thumbnail: video.thumbnail,
      video_duration: video.duration,
      source: 'youtube'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving video to library:', error);
    return null;
  }

  return data;
}

export async function getSavedVideos(userId: string) {
  const { data, error } = await supabase
    .from('saved_videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved videos:', error);
    return [];
  }

  return data;
}

export async function removeFromLibrary(userId: string, videoId: string) {
  const { error } = await supabase
    .from('saved_videos')
    .delete()
    .eq('user_id', userId)
    .eq('video_id', videoId);

  if (error) {
    console.error('Error removing video from library:', error);
    return false;
  }

  return true;
}

// Categories operations
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

// Auth operations
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    console.error('Error signing up:', error);
    return { user: null, error };
  }

  // Create user profile
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      name: name,
    });
  }

  return { user: data.user, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return { error };
  }

  return { error: null };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return data.user;
} 