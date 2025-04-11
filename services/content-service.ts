// Service for handling content uploads and management

import { supabase } from './supabase-client'
import type { YouTubeVideo } from './youtube-api'

export interface Instructor {
  id: string
  name: string
  email: string
  bio: string
  avatar: string
  expertise: string[]
  socialLinks: {
    website?: string
    youtube?: string
    twitter?: string
    linkedin?: string
  }
}

export interface ContentSubmission {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  category: string
  tags: string[]
  instructorId: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  youtubeVideoId?: string
}

// Mock function to simulate content submission
export async function submitContent(
  submission: Omit<ContentSubmission, "id" | "status" | "submittedAt">,
): Promise<ContentSubmission> {
  try {
    // In a real app, this would insert into a Supabase table
    // For now, we'll just return a mock submission
    const newSubmission: ContentSubmission = {
      ...submission,
      id: Date.now().toString(),
      status: "pending",
      submittedAt: new Date().toISOString(),
    }

    return newSubmission
  } catch (error) {
    console.error("Error submitting content:", error)
    throw new Error("Failed to submit content")
  }
}

// Get all submissions for an instructor
export async function getInstructorSubmissions(instructorId: string): Promise<ContentSubmission[]> {
  try {
    // In a real app, this would query a Supabase table
    // For now, we'll just return an empty array
    return []
  } catch (error) {
    console.error("Error getting instructor submissions:", error)
    return []
  }
}

// Register as an instructor
export async function registerInstructor(instructor: Omit<Instructor, "id">): Promise<Instructor> {
  try {
    // In a real app, this would insert into a Supabase table
    // For now, we'll just return a mock instructor
    const newInstructor: Instructor = {
      ...instructor,
      id: Date.now().toString(),
    }

    return newInstructor
  } catch (error) {
    console.error("Error registering instructor:", error)
    throw new Error("Failed to register as instructor")
  }
}

// Get instructor profile
export async function getInstructorProfile(instructorId: string): Promise<Instructor | null> {
  try {
    // In a real app, this would query a Supabase table
    // For now, we'll just return null
    return null
  } catch (error) {
    console.error("Error getting instructor profile:", error)
    return null
  }
}

// Save video to user's library
export async function saveVideoToLibrary(video: YouTubeVideo): Promise<void> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Check if video is already saved
    const { data: existingVideo } = await supabase
      .from('saved_videos')
      .select('*')
      .eq('user_id', user.id)
      .eq('video_id', video.id)
      .single()

    if (!existingVideo) {
      // Save video to Supabase
      await supabase.from('saved_videos').insert({
        user_id: user.id,
        video_id: video.id,
        video_title: video.title,
        video_thumbnail: video.thumbnail,
        video_duration: video.duration,
        source: 'youtube'
      })
    }
  } catch (error) {
    console.error("Error saving video to library:", error)
    throw new Error("Failed to save video")
  }
}

// Get user's saved videos
export async function getSavedVideos(): Promise<YouTubeVideo[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    // Get saved videos from Supabase
    const { data, error } = await supabase
      .from('saved_videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error getting saved videos:", error)
      return []
    }

    // Convert to YouTubeVideo format
    return data.map(item => ({
      id: item.video_id,
      title: item.video_title,
      description: "", // Not stored in saved_videos
      thumbnail: item.video_thumbnail,
      channelTitle: "", // Not stored in saved_videos
      channelId: "", // Not stored in saved_videos
      publishedAt: "", // Not stored in saved_videos
      viewCount: "", // Not stored in saved_videos
      duration: item.video_duration
    }))
  } catch (error) {
    console.error("Error getting saved videos:", error)
    return []
  }
}

// Add video to watch history
export async function addToWatchHistory(video: YouTubeVideo, watchedDuration: string): Promise<void> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return // Silently fail if user is not authenticated
    }

    // Add to Supabase
    await supabase.from('watch_history').insert({
      user_id: user.id,
      video_id: video.id,
      video_title: video.title,
      video_thumbnail: video.thumbnail,
      video_duration: video.duration,
      watched_duration: watchedDuration,
      source: 'youtube'
    })
  } catch (error) {
    console.error("Error adding to watch history:", error)
  }
}

// Get user's watch history
export async function getWatchHistory(): Promise<Array<YouTubeVideo & { watchedAt: string; watchedDuration: string }>> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    // Get watch history from Supabase
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error getting watch history:", error)
      return []
    }

    // Convert to expected format
    return data.map(item => ({
      id: item.video_id,
      title: item.video_title,
      description: "", // Not stored in watch_history
      thumbnail: item.video_thumbnail,
      channelTitle: "", // Not stored in watch_history
      channelId: "", // Not stored in watch_history
      publishedAt: "", // Not stored in watch_history
      viewCount: "", // Not stored in watch_history
      duration: item.video_duration,
      watchedAt: item.created_at,
      watchedDuration: item.watched_duration
    }))
  } catch (error) {
    console.error("Error getting watch history:", error)
    return []
  }
}
