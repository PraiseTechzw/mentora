// YouTube Data API integration
// Note: In a real app, you would need to obtain an API key from the Google Developer Console

import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.youtubeApiKey || process.env.YOUTUBE_API_KEY || "YOUR_YOUTUBE_API_KEY"
const BASE_URL = "https://www.googleapis.com/youtube/v3"

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  channelId: string
  publishedAt: string
  viewCount: string
  duration: string
}

export async function searchVideos(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  try {
    const searchResponse = await fetch(
      `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${API_KEY}`,
    )

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch videos")
    }

    const searchData = await searchResponse.json()
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",")

    // Get additional video details
    const videosResponse = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`,
    )

    if (!videosResponse.ok) {
      throw new Error("Failed to fetch video details")
    }

    const videosData = await videosResponse.json()

    return videosData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: formatPublishedDate(item.snippet.publishedAt),
      viewCount: formatViewCount(item.statistics.viewCount),
      duration: formatDuration(item.contentDetails.duration),
    }))
  } catch (error) {
    console.error("Error fetching videos:", error)
    return []
  }
}

export async function getPopularEducationalVideos(categoryId = "27", maxResults = 10): Promise<YouTubeVideo[]> {
  try {
    // Category 27 is "Education" in YouTube's category system
    const response = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&videoCategoryId=${categoryId}&maxResults=${maxResults}&key=${API_KEY}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch popular videos")
    }

    const data = await response.json()

    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: formatPublishedDate(item.snippet.publishedAt),
      viewCount: formatViewCount(item.statistics.viewCount),
      duration: formatDuration(item.contentDetails.duration),
    }))
  } catch (error) {
    console.error("Error fetching popular videos:", error)
    return []
  }
}

export async function getVideosByCategory(categoryName: string, maxResults = 10): Promise<YouTubeVideo[]> {
  // Map category names to search queries
  const categoryQueries: Record<string, string> = {
    Programming: "programming tutorial",
    Mathematics: "mathematics education",
    Science: "science education",
    History: "history documentary education",
    Languages: "language learning tutorial",
    Arts: "arts education tutorial",
    Business: "business education",
  }

  const query = categoryQueries[categoryName] || categoryName + " education"
  return searchVideos(query, maxResults)
}

export async function getChannelInfo(channelId: string) {
  try {
    const response = await fetch(`${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`)

    if (!response.ok) {
      throw new Error("Failed to fetch channel info")
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      const channel = data.items[0]
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.medium.url,
        subscriberCount: formatSubscriberCount(channel.statistics.subscriberCount),
        videoCount: channel.statistics.videoCount,
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching channel info:", error)
    return null
  }
}

// Helper functions for formatting
function formatPublishedDate(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return "Today"
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  }
}

function formatViewCount(viewCount: string): string {
  const count = Number.parseInt(viewCount, 10)
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return viewCount
}

function formatSubscriberCount(subscriberCount: string): string {
  const count = Number.parseInt(subscriberCount, 10)
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return subscriberCount
}

function formatDuration(isoDuration: string): string {
  // ISO 8601 duration format: PT#H#M#S
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) {
    return "0:00"
  }

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
}
