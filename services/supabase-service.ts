import { supabase, Database } from './supabase-client';
import { UserData } from './user-service';

// Types
interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

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

// User data operations
export async function syncUserData(userId: string, userData: UserData) {
  try {
    // Update user profile with data from local storage
    const { data, error } = await supabase
      .from('users')
      .update({
        name: userData.name,
        email: userData.email,
        avatar_url: userData.avatar,
        preferences: userData.preferences,
        points: userData.points,
        streak: userData.streak,
        last_login_date: userData.lastLoginDate,
        completed_courses: userData.completedCourses,
        bookmarked_videos: userData.bookmarkedVideos,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error syncing user data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error syncing user data:', error);
    return null;
  }
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }

    // Convert database format to UserData format
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar_url,
      points: data.points || 0,
      streak: data.streak || 0,
      lastLoginDate: data.last_login_date || new Date().toISOString(),
      preferences: data.preferences || [],
      completedCourses: data.completed_courses || [],
      bookmarkedVideos: data.bookmarked_videos || [],
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function updateUserPoints(userId: string, pointsToAdd: number): Promise<UserData | null> {
  try {
    // First get current user data
    const currentData = await getUserData(userId);
    if (!currentData) return null;

    // Calculate new points
    const newPoints = currentData.points + pointsToAdd;

    // Update in database
    const { data, error } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user points:', error);
      return null;
    }

    // Return updated user data
    return {
      ...currentData,
      points: newPoints,
    };
  } catch (error) {
    console.error('Error updating user points:', error);
    return null;
  }
}

export async function updateUserStreak(userId: string, streak: number): Promise<UserData | null> {
  try {
    // Update in database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        streak: streak,
        last_login_date: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user streak:', error);
      return null;
    }

    // Get updated user data
    return await getUserData(userId);
  } catch (error) {
    console.error('Error updating user streak:', error);
    return null;
  }
}

export async function addCompletedCourse(userId: string, videoId: string): Promise<UserData | null> {
  try {
    // First get current user data
    const currentData = await getUserData(userId);
    if (!currentData) return null;

    // Check if video is already completed
    if (currentData.completedCourses.includes(videoId)) {
      return currentData;
    }

    // Add video to completed courses
    const updatedCompletedCourses = [...currentData.completedCourses, videoId];

    // Update in database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        completed_courses: updatedCompletedCourses,
        points: currentData.points + 10 // Add points for completing a video
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error adding completed course:', error);
      return null;
    }

    // Return updated user data
    return {
      ...currentData,
      completedCourses: updatedCompletedCourses,
      points: currentData.points + 10,
    };
  } catch (error) {
    console.error('Error adding completed course:', error);
    return null;
  }
}

export async function addBookmarkedVideo(userId: string, videoId: string): Promise<UserData | null> {
  try {
    // First get current user data
    const currentData = await getUserData(userId);
    if (!currentData) return null;

    // Check if video is already bookmarked
    if (currentData.bookmarkedVideos.includes(videoId)) {
      return currentData;
    }

    // Add video to bookmarked videos
    const updatedBookmarkedVideos = [...currentData.bookmarkedVideos, videoId];

    // Update in database
    const { data, error } = await supabase
      .from('users')
      .update({ bookmarked_videos: updatedBookmarkedVideos })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error adding bookmarked video:', error);
      return null;
    }

    // Return updated user data
    return {
      ...currentData,
      bookmarkedVideos: updatedBookmarkedVideos,
    };
  } catch (error) {
    console.error('Error adding bookmarked video:', error);
    return null;
  }
}

export async function removeBookmarkedVideo(userId: string, videoId: string): Promise<UserData | null> {
  try {
    // First get current user data
    const currentData = await getUserData(userId);
    if (!currentData) return null;

    // Remove video from bookmarked videos
    const updatedBookmarkedVideos = currentData.bookmarkedVideos.filter(id => id !== videoId);

    // Update in database
    const { data, error } = await supabase
      .from('users')
      .update({ bookmarked_videos: updatedBookmarkedVideos })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error removing bookmarked video:', error);
      return null;
    }

    // Return updated user data
    return {
      ...currentData,
      bookmarkedVideos: updatedBookmarkedVideos,
    };
  } catch (error) {
    console.error('Error removing bookmarked video:', error);
    return null;
  }
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
      points: 0,
      streak: 0,
      last_login_date: new Date().toISOString(),
      preferences: [],
      completed_courses: [],
      bookmarked_videos: [],
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

  // Update last login date
  if (data.user) {
    await supabase.from('users').update({
      last_login_date: new Date().toISOString(),
    }).eq('id', data.user.id);
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

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'mentora://auth/reset-password',
  });

  if (error) {
    console.error('Error resetting password:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Error updating password:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
} 