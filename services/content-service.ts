// Service for handling content uploads and management

import AsyncStorage from "@react-native-async-storage/async-storage"
import type { YouTubeVideo } from "./youtube-api"

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
    // Get existing submissions
    const existingSubmissionsJson = await AsyncStorage.getItem("contentSubmissions")
    const existingSubmissions: ContentSubmission[] = existingSubmissionsJson ? JSON.parse(existingSubmissionsJson) : []

    // Create new submission
    const newSubmission: ContentSubmission = {
      ...submission,
      id: Date.now().toString(),
      status: "pending",
      submittedAt: new Date().toISOString(),
    }

    // Save updated submissions
    const updatedSubmissions = [...existingSubmissions, newSubmission]
    await AsyncStorage.setItem("contentSubmissions", JSON.stringify(updatedSubmissions))

    return newSubmission
  } catch (error) {
    console.error("Error submitting content:", error)
    throw new Error("Failed to submit content")
  }
}

// Get all submissions for an instructor
export async function getInstructorSubmissions(instructorId: string): Promise<ContentSubmission[]> {
  try {
    const submissionsJson = await AsyncStorage.getItem("contentSubmissions")
    const submissions: ContentSubmission[] = submissionsJson ? JSON.parse(submissionsJson) : []

    return submissions.filter((submission) => submission.instructorId === instructorId)
  } catch (error) {
    console.error("Error getting instructor submissions:", error)
    return []
  }
}

// Register as an instructor
export async function registerInstructor(instructor: Omit<Instructor, "id">): Promise<Instructor> {
  try {
    // Get existing instructors
    const existingInstructorsJson = await AsyncStorage.getItem("instructors")
    const existingInstructors: Instructor[] = existingInstructorsJson ? JSON.parse(existingInstructorsJson) : []

    // Create new instructor
    const newInstructor: Instructor = {
      ...instructor,
      id: Date.now().toString(),
    }

    // Save updated instructors
    const updatedInstructors = [...existingInstructors, newInstructor]
    await AsyncStorage.setItem("instructors", JSON.stringify(updatedInstructors))

    return newInstructor
  } catch (error) {
    console.error("Error registering instructor:", error)
    throw new Error("Failed to register as instructor")
  }
}

// Get instructor profile
export async function getInstructorProfile(instructorId: string): Promise<Instructor | null> {
  try {
    const instructorsJson = await AsyncStorage.getItem("instructors")
    const instructors: Instructor[] = instructorsJson ? JSON.parse(instructorsJson) : []

    return instructors.find((instructor) => instructor.id === instructorId) || null
  } catch (error) {
    console.error("Error getting instructor profile:", error)
    return null
  }
}

// Save video to user's library
export async function saveVideoToLibrary(video: YouTubeVideo): Promise<void> {
  try {
    // Get existing saved videos
    const savedVideosJson = await AsyncStorage.getItem("savedVideos")
    const savedVideos: YouTubeVideo[] = savedVideosJson ? JSON.parse(savedVideosJson) : []

    // Check if video is already saved
    const isAlreadySaved = savedVideos.some((savedVideo) => savedVideo.id === video.id)

    if (!isAlreadySaved) {
      // Save updated videos
      const updatedVideos = [...savedVideos, video]
      await AsyncStorage.setItem("savedVideos", JSON.stringify(updatedVideos))
    }
  } catch (error) {
    console.error("Error saving video to library:", error)
    throw new Error("Failed to save video")
  }
}

// Get user's saved videos
export async function getSavedVideos(): Promise<YouTubeVideo[]> {
  try {
    const savedVideosJson = await AsyncStorage.getItem("savedVideos")
    return savedVideosJson ? JSON.parse(savedVideosJson) : []
  } catch (error) {
    console.error("Error getting saved videos:", error)
    return []
  }
}

// Add video to watch history
export async function addToWatchHistory(video: YouTubeVideo, watchedDuration: string): Promise<void> {
  try {
    // Get existing watch history
    const historyJson = await AsyncStorage.getItem("watchHistory")
    const history: Array<YouTubeVideo & { watchedAt: string; watchedDuration: string }> = historyJson
      ? JSON.parse(historyJson)
      : []

    // Remove if already in history
    const filteredHistory = history.filter((item) => item.id !== video.id)

    // Add to beginning of history
    const updatedHistory = [
      {
        ...video,
        watchedAt: new Date().toISOString(),
        watchedDuration,
      },
      ...filteredHistory,
    ]

    // Limit history to 100 items
    const trimmedHistory = updatedHistory.slice(0, 100)

    await AsyncStorage.setItem("watchHistory", JSON.stringify(trimmedHistory))
  } catch (error) {
    console.error("Error adding to watch history:", error)
  }
}

// Get user's watch history
export async function getWatchHistory(): Promise<Array<YouTubeVideo & { watchedAt: string; watchedDuration: string }>> {
  try {
    const historyJson = await AsyncStorage.getItem("watchHistory")
    return historyJson ? JSON.parse(historyJson) : []
  } catch (error) {
    console.error("Error getting watch history:", error)
    return []
  }
}
