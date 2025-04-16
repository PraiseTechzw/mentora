import { AggregatedVideo } from "../types/videoag"

// Function to extract video ID from YouTube URL
export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Function to get embedded URL from YouTube video ID
export function getEmbeddedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

// Function to get thumbnail URL from YouTube video ID with multiple fallbacks
export function getThumbnailUrl(videoId: string): string {
  // YouTube provides multiple thumbnail resolutions
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
}

// Function to fetch video details using Innertube API (YouTube's internal API)
async function fetchVideoDetails(videoId: string): Promise<any> {
  try {
    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20210721.00.00",
            },
          },
          videoId: videoId,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching video details for ${videoId}:`, error)
    return null
  }
}

// Function to fetch playlist data using Innertube API
async function fetchPlaylistData(playlistId: string): Promise<any> {
  try {
    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20210721.00.00",
            },
          },
          browseId: `VL${playlistId}`,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist data: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching playlist data for ${playlistId}:`, error)
    return null
  }
}

// Function to extract video data from Innertube API response
function extractVideoData(data: any): any | null {
  try {
    if (!data || !data.videoDetails) return null

    const videoDetails = data.videoDetails
    const microformat = data.microformat?.playerMicroformatRenderer

    return {
      id: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.shortDescription,
      channelId: videoDetails.channelId,
      channelName: videoDetails.author,
      viewCount: videoDetails.viewCount,
      publishDate: microformat?.publishDate,
      duration: videoDetails.lengthSeconds,
      thumbnail: videoDetails.thumbnail?.thumbnails?.pop()?.url,
    }
  } catch (error) {
    console.error("Error extracting video data:", error)
    return null
  }
}

// Function to extract playlist videos from Innertube API response
function extractPlaylistVideos(data: any): any[] {
  try {
    if (!data || !data.contents) return []

    const tabs = data.contents.twoColumnBrowseResultsRenderer?.tabs || []
    const playlistTab = tabs.find((tab: any) => tab.tabRenderer?.selected)

    if (!playlistTab) return []

    const content = playlistTab.tabRenderer.content
    const sectionList = content.sectionListRenderer || content.richGridRenderer

    if (!sectionList) return []

    const items = sectionList.contents
      .filter((item: any) => item.itemSectionRenderer || item.richItemRenderer)
      .flatMap((item: any) => {
        if (item.itemSectionRenderer) {
          return item.itemSectionRenderer.contents
        }
        if (item.richItemRenderer) {
          return [item.richItemRenderer.content]
        }
        return []
      })
      .filter((item: any) => item.playlistVideoRenderer || item.videoRenderer)
      .map((item: any) => {
        const renderer = item.playlistVideoRenderer || item.videoRenderer

        if (!renderer) return null

        const videoId = renderer.videoId
        const title = renderer.title?.runs?.[0]?.text
        const channelName = renderer.ownerText?.runs?.[0]?.text || renderer.shortBylineText?.runs?.[0]?.text
        const channelId =
          renderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
          renderer.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId

        const viewCountText =
          renderer.viewCountText?.simpleText || renderer.viewCountText?.runs?.map((run: any) => run.text).join("") || ""

        const lengthText = renderer.lengthText?.simpleText || ""

        // Extract duration in seconds from lengthText (format: HH:MM:SS or MM:SS)
        let durationSeconds = 0
        const timeParts = lengthText.split(":").map(Number)
        if (timeParts.length === 3) {
          // HH:MM:SS
          durationSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2]
        } else if (timeParts.length === 2) {
          // MM:SS
          durationSeconds = timeParts[0] * 60 + timeParts[1]
        }

        // Extract view count number from viewCountText
        const viewCountMatch = viewCountText.match(/[\d,]+/)
        const viewCount = viewCountMatch ? viewCountMatch[0].replace(/,/g, "") : "0"

        // Extract published date if available
        const publishedTimeText = renderer.publishedTimeText?.simpleText || ""

        return {
          id: videoId,
          title,
          channelName,
          channelId,
          viewCount,
          durationSeconds,
          lengthText,
          publishedTimeText,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        }
      })
      .filter(Boolean)

    return items
  } catch (error) {
    console.error("Error extracting playlist videos:", error)
    return []
  }
}

// Function to fetch videos from a YouTube playlist with real-time data
export async function fetchPlaylistVideos(playlistId: string): Promise<AggregatedVideo[]> {
  try {
    // First try using Innertube API
    const playlistData = await fetchPlaylistData(playlistId)
    const extractedVideos = extractPlaylistVideos(playlistData)

    if (extractedVideos.length > 0) {
      // Fetch detailed information for each video
      const videoDetailsPromises = extractedVideos.slice(0, 10).map(async (video) => {
        const details = await fetchVideoDetails(video.id)
        const extractedData = extractVideoData(details)

        return {
          id: video.id,
          title: video.title || extractedData?.title || "",
          description: extractedData?.description || "",
          thumbnail: video.thumbnail || getThumbnailUrl(video.id),
          source: "embedded",
          videoUrl: getEmbeddedUrl(video.id),
          duration: extractedData?.duration
            ? formatDuration(Number.parseInt(extractedData.duration))
            : video.lengthText || "",
          views: extractedData?.viewCount
            ? formatViews(Number.parseInt(extractedData.viewCount))
            : formatViewsFromText(video.viewCount),
          publishedAt: extractedData?.publishDate
            ? new Date(extractedData.publishDate).toISOString()
            : estimatePublishDate(video.publishedTimeText),
          channelName: video.channelName || extractedData?.channelName || "",
          channelId: video.channelId || extractedData?.channelId || "",
          isFree: true,
        }
      })

      const results = await Promise.allSettled(videoDetailsPromises)
      return results
        .filter((result): result is PromiseFulfilledResult<AggregatedVideo> => result.status === "fulfilled")
        .map((result) => result.value)
    }

    // If Innertube API fails, try alternative method
    return await fetchPlaylistVideosAlternative(playlistId)
  } catch (error) {
    console.error(`Error fetching playlist videos for ${playlistId}:`, error)
    return await fetchPlaylistVideosAlternative(playlistId)
  }
}

// Alternative method to fetch playlist videos
async function fetchPlaylistVideosAlternative(playlistId: string): Promise<AggregatedVideo[]> {
  try {
    // Use YouTube's RSS feed for playlists
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist RSS: ${response.statusText}`)
    }

    const xmlText = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, "text/xml")

    const entries = Array.from(xmlDoc.getElementsByTagName("entry"))

    return entries.map((entry) => {
      const videoId = entry.getElementsByTagName("yt:videoId")[0]?.textContent || ""
      const title = entry.getElementsByTagName("title")[0]?.textContent || ""
      const channelName = entry.getElementsByTagName("author")[0]?.getElementsByTagName("name")[0]?.textContent || ""
      const publishedAt = entry.getElementsByTagName("published")[0]?.textContent || ""

      return {
        id: videoId,
        title: title,
        description: entry.getElementsByTagName("media:description")[0]?.textContent || "",
        thumbnail: getThumbnailUrl(videoId),
        source: "embedded",
        videoUrl: getEmbeddedUrl(videoId),
        duration: "", // RSS doesn't provide duration
        views: "", // RSS doesn't provide view count
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        channelName: channelName,
        channelId: "", // RSS doesn't provide channel ID
        isFree: true,
      }
    })
  } catch (error) {
    console.error(`Error in alternative playlist fetch for ${playlistId}:`, error)

    // Last resort: try to scrape the playlist page
    return await scrapePlaylistPage(playlistId)
  }
}

// Last resort: scrape the playlist page
async function scrapePlaylistPage(playlistId: string): Promise<AggregatedVideo[]> {
  try {
    const response = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist page: ${response.statusText}`)
    }

    const html = await response.text()

    // Extract initial data from the page
    const initialDataMatch = html.match(/var\s+ytInitialData\s*=\s*({.+?});\s*<\/script>/s)
    if (!initialDataMatch) {
      throw new Error("Could not find initial data in the page")
    }

    // Clean up the JSON string and parse it
    const jsonStr = initialDataMatch[1].replace(/\\x([0-9A-F]{2})/gi, (_, p1) =>
      String.fromCharCode(Number.parseInt(p1, 16)),
    )

    try {
      const data = JSON.parse(jsonStr)
      const extractedVideos = extractPlaylistVideos(data)

      return extractedVideos.map((video) => ({
        id: video.id,
        title: video.title,
        description: "",
        thumbnail: getThumbnailUrl(video.id),
        source: "embedded",
        videoUrl: getEmbeddedUrl(video.id),
        duration: video.lengthText || "",
        views: formatViewsFromText(video.viewCount),
        publishedAt: estimatePublishDate(video.publishedTimeText),
        channelName: video.channelName || "",
        channelId: video.channelId || "",
        isFree: true,
      }))
    } catch (jsonError) {
      console.error("Error parsing JSON from page:", jsonError)

      // If JSON parsing fails, use regex to extract video IDs
      const videoIdPattern = /"videoId":"([^"]+)"/g
      const videoIds: string[] = []

      let match
      while ((match = videoIdPattern.exec(html)) !== null) {
        videoIds.push(match[1])
      }

      // Deduplicate video IDs
      const uniqueVideoIds = [...new Set(videoIds)]

      // Create basic video objects from IDs
      return uniqueVideoIds.map((videoId) => ({
        id: videoId,
        title: "",
        description: "",
        thumbnail: getThumbnailUrl(videoId),
        source: "embedded",
        videoUrl: getEmbeddedUrl(videoId),
        duration: "",
        views: "",
        publishedAt: new Date().toISOString(),
        channelName: "",
        channelId: "",
        isFree: true,
      }))
    }
  } catch (error) {
    console.error(`Error scraping playlist page for ${playlistId}:`, error)
    return []
  }
}

// Function to search YouTube videos directly using Innertube API
export async function searchYouTubeVideos(query: string, filter?: string): Promise<AggregatedVideo[]> {
  try {
    // Add educational filter to query if not already specified
    const searchQuery = filter ? `${query} ${filter}` : query

    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20210721.00.00",
            },
          },
          query: searchQuery,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to search videos: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract search results
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || []

    const itemSection = contents.find((content: any) => content.itemSectionRenderer)
    if (!itemSection) return []

    const items = itemSection.itemSectionRenderer.contents || []

    const videoItems = items
      .filter((item: any) => item.videoRenderer)
      .map((item: any) => {
        const renderer = item.videoRenderer

        if (!renderer || !renderer.videoId) return null

        const videoId = renderer.videoId
        const title = renderer.title?.runs?.[0]?.text || ""
        const channelName = renderer.ownerText?.runs?.[0]?.text || ""
        const channelId = renderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || ""

        const viewCountText =
          renderer.viewCountText?.simpleText || renderer.viewCountText?.runs?.map((run: any) => run.text).join("") || ""

        const lengthText = renderer.lengthText?.simpleText || ""
        const publishedTimeText = renderer.publishedTimeText?.simpleText || ""

        const descriptionSnippet =
          renderer.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((run: any) => run.text).join("") ||
          renderer.descriptionSnippet?.runs?.map((run: any) => run.text).join("") ||
          ""

        return {
          id: videoId,
          title,
          description: descriptionSnippet,
          thumbnail: getThumbnailUrl(videoId),
          source: "embedded",
          videoUrl: getEmbeddedUrl(videoId),
          duration: lengthText,
          views: formatViewsFromText(viewCountText),
          publishedAt: estimatePublishDate(publishedTimeText),
          channelName,
          channelId,
          isFree: true,
        }
      })
      .filter(Boolean)

    return videoItems
  } catch (error) {
    console.error("Error searching YouTube videos:", error)
    return []
  }
}

// Helper function to format duration from seconds to MM:SS format
function formatDuration(seconds: number): string {
  if (!seconds) return ""

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
}

// Helper function to format view count
function formatViews(viewCount: number): string {
  if (!viewCount) return ""

  if (viewCount >= 1000000) {
    return `${(viewCount / 1000000).toFixed(1)}M`
  } else if (viewCount >= 1000) {
    return `${(viewCount / 1000).toFixed(1)}K`
  } else {
    return viewCount.toString()
  }
}

// Helper function to format views from text
function formatViewsFromText(viewText: string): string {
  if (!viewText) return ""

  // Extract numbers from view text (e.g., "1,234,567 views")
  const viewMatch = viewText.match(/[\d,]+/)
  if (!viewMatch) return ""

  const viewCount = Number.parseInt(viewMatch[0].replace(/,/g, ""))
  return formatViews(viewCount)
}

// Helper function to estimate publish date from text
function estimatePublishDate(publishedText: string): string {
  if (!publishedText) return new Date().toISOString()

  const now = new Date()

  // Handle different time formats: "X years ago", "X months ago", "X weeks ago", "X days ago", "X hours ago"
  const yearMatch = publishedText.match(/(\d+)\s+year/)
  const monthMatch = publishedText.match(/(\d+)\s+month/)
  const weekMatch = publishedText.match(/(\d+)\s+week/)
  const dayMatch = publishedText.match(/(\d+)\s+day/)
  const hourMatch = publishedText.match(/(\d+)\s+hour/)

  if (yearMatch) {
    const years = Number.parseInt(yearMatch[1])
    now.setFullYear(now.getFullYear() - years)
  } else if (monthMatch) {
    const months = Number.parseInt(monthMatch[1])
    now.setMonth(now.getMonth() - months)
  } else if (weekMatch) {
    const weeks = Number.parseInt(weekMatch[1])
    now.setDate(now.getDate() - weeks * 7)
  } else if (dayMatch) {
    const days = Number.parseInt(dayMatch[1])
    now.setDate(now.getDate() - days)
  } else if (hourMatch) {
    const hours = Number.parseInt(hourMatch[1])
    now.setHours(now.getHours() - hours)
  }

  return now.toISOString()
}

// Function to discover educational content categories
export async function discoverEducationalCategories(): Promise<string[]> {
  // These are common educational categories on YouTube
  const commonCategories = [
    "Programming",
    "Mathematics",
    "Science",
    "History",
    "Language Learning",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Finance",
    "Art",
    "Music",
    "Literature",
  ]

  try {
    // Try to discover trending educational categories
    const trendingEducational = await searchYouTubeVideos("educational trending", "course")

    // Extract potential categories from video titles
    const extractedCategories = trendingEducational
      .flatMap((video) => {
        const title = video.title.toLowerCase()
        return commonCategories.filter((category) => title.includes(category.toLowerCase()))
      })
      .filter(Boolean)

    // Combine with common categories and deduplicate
    const allCategories = [...new Set([...extractedCategories, ...commonCategories])]

    return allCategories.slice(0, 10) // Limit to top 10 categories
  } catch (error) {
    console.error("Error discovering educational categories:", error)
    return commonCategories.slice(0, 10)
  }
}

// Function to discover trending educational playlists
export async function discoverEducationalPlaylists(): Promise<string[]> {
  try {
    // Search for trending educational playlists
    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/search?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20210721.00.00",
            },
          },
          query: "educational playlists tutorials",
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to discover playlists: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract playlist results
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || []

    const itemSection = contents.find((content: any) => content.itemSectionRenderer)
    if (!itemSection) return []

    const items = itemSection.itemSectionRenderer.contents || []

    // Extract playlist IDs
    const playlistIds = items
      .filter((item: any) => item.playlistRenderer)
      .map((item: any) => item.playlistRenderer.playlistId)
      .filter(Boolean)

    return playlistIds
  } catch (error) {
    console.error("Error discovering educational playlists:", error)
    return []
  }
}

// Function to get educational videos dynamically
export async function getEducationalVideos(): Promise<AggregatedVideo[]> {
  try {
    // Discover trending educational content
    const results = await searchYouTubeVideos("educational tutorial", "course")

    if (results.length > 0) {
      return results
    }

    // If direct search fails, try to discover playlists and fetch from them
    const playlistIds = await discoverEducationalPlaylists()

    if (playlistIds.length > 0) {
      // Get videos from the first few discovered playlists
      const playlistPromises = playlistIds.slice(0, 3).map((playlistId) => fetchPlaylistVideos(playlistId))

      const playlistResults = await Promise.allSettled(playlistPromises)

      // Flatten and deduplicate results, handling rejected promises
      const uniqueVideos = new Map()

      playlistResults.forEach((result) => {
        if (result.status === "fulfilled") {
          result.value.forEach((video) => {
            if (!uniqueVideos.has(video.id)) {
              uniqueVideos.set(video.id, video)
            }
          })
        }
      })

      return Array.from(uniqueVideos.values())
    }

    // Last resort: search for specific educational terms
    const fallbackResults = await searchYouTubeVideos("learn programming tutorial", "beginner")
    return fallbackResults
  } catch (error) {
    console.error("Error getting educational videos:", error)
    return []
  }
}

// Function to search for educational videos
export async function searchEducationalVideos(query: string): Promise<AggregatedVideo[]> {
  try {
    // Add educational context to the search query
    const educationalQuery = `${query} tutorial`

    // Search directly using YouTube's search
    const searchResults = await searchYouTubeVideos(educationalQuery)

    if (searchResults.length > 0) {
      return searchResults
    }

    // If no results, try a more general search
    return await searchYouTubeVideos(query)
  } catch (error) {
    console.error("Error searching educational videos:", error)
    return []
  }
}

// Get aggregated content with optional search and category filters
export async function getAggregatedContent(
  searchQuery?: string,
  category?: string,
  freeOnly = true,
): Promise<AggregatedVideo[]> {
  try {
    let videos: AggregatedVideo[] = []

    // Fetch content based on search query or category
    if (searchQuery) {
      videos = await searchEducationalVideos(searchQuery)
    } else if (category && category !== "all") {
      const categoryQuery = `${category} tutorial`
      videos = await searchEducationalVideos(categoryQuery)
    } else {
      videos = await getEducationalVideos()
    }

    // Filter by free content if requested
    if (freeOnly) {
      videos = videos.filter((video) => video.isFree)
    }

    // Sort by published date (newest first)
    return videos.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA
    })
  } catch (error) {
    console.error("Error aggregating content:", error)
    return []
  }
}

// Get trending content
export const getTrendingContent = async (freeOnly = true): Promise<AggregatedVideo[]> => {
  try {
    // Search for trending educational content
    const trendingVideos = await searchYouTubeVideos("trending educational", "tutorial")

    // Filter by free content if specified
    const filteredTrending = freeOnly ? trendingVideos.filter((video) => video.isFree) : trendingVideos

    // Sort by view count (highest first)
    return filteredTrending.sort((a, b) => {
      const viewsA = Number.parseInt(a.views.replace(/[^0-9]/g, "")) || 0
      const viewsB = Number.parseInt(b.views.replace(/[^0-9]/g, "")) || 0
      return viewsB - viewsA
    })
  } catch (error) {
    console.error("Error getting trending content:", error)
    return []
  }
}

// Get recommended content based on user preferences
export const getRecommendedContent = async (
  userPreferences: string[] = [],
  freeOnly = true,
): Promise<AggregatedVideo[]> => {
  try {
    let recommendedVideos: AggregatedVideo[] = []

    // Search for each preference
    if (userPreferences.length > 0) {
      const searchPromises = userPreferences.map((pref) => searchEducationalVideos(pref))
      const searchResults = await Promise.allSettled(searchPromises)

      // Flatten and deduplicate results, handling rejected promises
      const uniqueVideos = new Map()

      searchResults.forEach((result) => {
        if (result.status === "fulfilled") {
          result.value.forEach((video) => {
            if (!uniqueVideos.has(video.id)) {
              uniqueVideos.set(video.id, video)
            }
          })
        }
      })

      recommendedVideos = Array.from(uniqueVideos.values())
    } else {
      // If no preferences, get educational videos
      recommendedVideos = await getEducationalVideos()
    }

    // Filter by free content if specified
    if (freeOnly) {
      recommendedVideos = recommendedVideos.filter((video) => video.isFree)
    }

    // Sort by relevance (for now, just by published date)
    return recommendedVideos.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA
    })
  } catch (error) {
    console.error("Error getting recommended content:", error)
    return []
  }
}

// Function to fetch channel videos
export async function fetchChannelVideos(channelId: string): Promise<AggregatedVideo[]> {
  try {
    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20210721.00.00",
            },
          },
          browseId: channelId,
          params: "EgZ2aWRlb3M=", // This parameter tells YouTube to fetch videos
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch channel videos: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract videos from channel page
    const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || []
    const videosTab = tabs.find(
      (tab: any) =>
        tab.tabRenderer?.endpoint?.browseEndpoint?.params === "EgZ2aWRlb3M=" || tab.tabRenderer?.title === "Videos",
    )

    if (!videosTab) return []

    const gridRenderer =
      videosTab.tabRenderer?.content?.richGridRenderer ||
      videosTab.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]
        ?.gridRenderer

    if (!gridRenderer) return []

    const items = gridRenderer.contents || []

    const videoItems = items
      .filter((item: any) => item.richItemRenderer?.content?.videoRenderer || item.gridVideoRenderer)
      .map((item: any) => {
        const renderer = item.richItemRenderer?.content?.videoRenderer || item.gridVideoRenderer

        if (!renderer || !renderer.videoId) return null

        const videoId = renderer.videoId
        const title = renderer.title?.runs?.[0]?.text || ""
        const channelName = renderer.ownerText?.runs?.[0]?.text || ""

        const viewCountText =
          renderer.viewCountText?.simpleText || renderer.viewCountText?.runs?.map((run: any) => run.text).join("") || ""

        const lengthText = renderer.lengthText?.simpleText || ""
        const publishedTimeText = renderer.publishedTimeText?.simpleText || ""

        return {
          id: videoId,
          title,
          description: "",
          thumbnail: getThumbnailUrl(videoId),
          source: "embedded",
          videoUrl: getEmbeddedUrl(videoId),
          duration: lengthText,
          views: formatViewsFromText(viewCountText),
          publishedAt: estimatePublishDate(publishedTimeText),
          channelName,
          channelId,
          isFree: true,
        }
      })
      .filter(Boolean)

    return videoItems
  } catch (error) {
    console.error(`Error fetching channel videos for ${channelId}:`, error)
    return []
  }
}

// Function to discover educational channels
export async function discoverEducationalChannels(): Promise<{ name: string; channelId: string }[]> {
  try {
    // Search for educational channels
    const results = await searchYouTubeVideos("educational channel tutorial", "course")

    // Extract unique channels from search results
    const channels = new Map()

    results.forEach((video) => {
      if (video.channelId && video.channelName && !channels.has(video.channelId)) {
        channels.set(video.channelId, {
          name: video.channelName,
          channelId: video.channelId,
        })
      }
    })

    return Array.from(channels.values())
  } catch (error) {
    console.error("Error discovering educational channels:", error)
    return []
  }
}
