// Service for aggregating embedded educational content

// Define a common interface for embedded videos
export interface AggregatedVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  source: "embedded"
  videoUrl: string
  duration: string
  views: string
  publishedAt: string
  channelName: string
  channelId: string
  isFree: boolean
}

// Function to extract video ID from YouTube URL
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Function to get embedded URL from YouTube video ID
function getEmbeddedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// Function to get thumbnail URL from YouTube video ID
function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Curated list of educational YouTube channels and playlists
const educationalChannels = [
  {
    name: "freeCodeCamp",
    channelId: "UC8butISFwT-Wl7EV0hUK0BQ",
    playlists: [
      {
        name: "JavaScript Algorithms and Data Structures",
        playlistId: "PLWKjhJtqVAbkmRvnFmOd4KhDdlK1oI9zk"
      },
      {
        name: "React.js Full Course",
        playlistId: "PLWKjhJtqVAbknyJ9nS9h-9tCrLyOb2qZR"
      }
    ]
  },
  {
    name: "Traversy Media",
    channelId: "UC29ju8bIPH5as8OGnQzwJyA",
    playlists: [
      {
        name: "React JS Crash Course",
        playlistId: "PLillGF-RfqbbRA-CIUxlxkUpbq0IFkX60"
      },
      {
        name: "Modern JavaScript",
        playlistId: "PLillGF-Rfqbb4ZOnsFCI4Trkso1FvWrJ2"
      }
    ]
  },
  {
    name: "The Net Ninja",
    channelId: "UCW5YeuERMylnzY0B_3Fw1gQ",
    playlists: [
      {
        name: "React JS Tutorial",
        playlistId: "PL4cUxeGkcC9gMfjbM1Q8YfHk1ZQ6aR5t"
      },
      {
        name: "Node.js Tutorial",
        playlistId: "PL4cUxeGkcC9gcy9l1xQYgJHnZT4dsP6bm"
      }
    ]
  },
  {
    name: "Academind",
    channelId: "UCSJbGtTmKr8zjfRtmPPsQtA",
    playlists: [
      {
        name: "React JS Tutorial",
        playlistId: "PL55RiY5tL51oyA8cyS04iwjTUktH4kdB_"
      },
      {
        name: "JavaScript Tutorial",
        playlistId: "PL55RiY5tL51q4D-KXw9IRX7Cy8xJ2w6gK"
      }
    ]
  },
  {
    name: "Fireship",
    channelId: "UCsBjURrPoezykLs9EqgamOA",
    playlists: [
      {
        name: "Web Dev",
        playlistId: "PL0vfts4VybNiQauuPqpxFzWrYkCFhS0QR"
      },
      {
        name: "React",
        playlistId: "PL0vfts4VybNxR7u8kDl0HjqoNkm3ddjgi"
      }
    ]
  }
];

// Function to fetch videos from a YouTube playlist
async function fetchPlaylistVideos(playlistId: string): Promise<AggregatedVideo[]> {
  try {
    // Use a public YouTube playlist API that doesn't require an API key
    const response = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist videos: ${response.statusText}`);
    }
    
    // Extract video IDs from the playlist page
    const html = await response.text();
    const videoIdRegex = /"videoId":"([^"]+)"/g;
    const matches = [...html.matchAll(videoIdRegex)];
    
    if (matches.length === 0) {
      return [];
    }
    
    // Create video objects from the extracted IDs
    return matches.map((match, index) => {
      const videoId = match[1];
  return {
        id: videoId,
        title: `Video ${index + 1} from playlist`,
        description: "Educational video from curated playlist",
        thumbnail: getThumbnailUrl(videoId),
        source: "embedded",
        videoUrl: getEmbeddedUrl(videoId),
        duration: "10:00", // Default duration
        views: "1000", // Default views
        publishedAt: new Date().toISOString(),
        channelName: "Educational Channel",
        channelId: "channel1",
        isFree: true,
      };
    });
  } catch (error) {
    console.error(`Error fetching playlist videos for ${playlistId}:`, error);
    return [];
  }
}

// Function to get educational videos from curated playlists
async function getEducationalVideos(): Promise<AggregatedVideo[]> {
  try {
    // Get videos from the first playlist of each channel
    const playlistPromises = educationalChannels.map(channel => 
      fetchPlaylistVideos(channel.playlists[0].playlistId)
    );
    
    const playlistResults = await Promise.all(playlistPromises);
    
    // Flatten and deduplicate results
    const uniqueVideos = new Map();
    playlistResults.flat().forEach(video => {
      if (!uniqueVideos.has(video.id)) {
        uniqueVideos.set(video.id, video);
      }
    });
    
    return Array.from(uniqueVideos.values());
  } catch (error) {
    console.error("Error getting educational videos:", error);
    return [];
  }
}

// Function to search for educational videos
async function searchEducationalVideos(query: string): Promise<AggregatedVideo[]> {
  try {
    // For now, we'll return videos from our curated playlists
    // In a real app, you would implement a proper search mechanism
    const allVideos = await getEducationalVideos();
    
    // Filter videos based on the search query
    const searchQuery = query.toLowerCase();
    return allVideos.filter(video => 
      video.title.toLowerCase().includes(searchQuery) ||
      video.description.toLowerCase().includes(searchQuery)
    );
  } catch (error) {
    console.error("Error searching educational videos:", error);
    return [];
  }
}

// Get aggregated content with optional search and category filters
export async function getAggregatedContent(
  searchQuery?: string,
  category?: string,
  freeOnly: boolean = true
): Promise<AggregatedVideo[]> {
  try {
    let videos: AggregatedVideo[] = [];
    
    // Fetch content based on search query or category
    if (searchQuery) {
      videos = await searchEducationalVideos(searchQuery);
    } else if (category && category !== "all") {
      const categoryQuery = `${category} tutorial`;
      videos = await searchEducationalVideos(categoryQuery);
    } else {
      videos = await getEducationalVideos();
    }
    
    // Filter by free content if requested
    if (freeOnly) {
      videos = videos.filter(video => video.isFree);
    }
    
    // Sort by published date (newest first)
    return videos.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error("Error aggregating content:", error);
    return [];
  }
}

// Get trending content
export const getTrendingContent = async (freeOnly: boolean = true): Promise<AggregatedVideo[]> => {
  try {
    // Get educational videos from curated playlists
    const trendingVideos = await getEducationalVideos();
    
    // Filter by free content if specified
    const filteredTrending = freeOnly 
      ? trendingVideos.filter(video => video.isFree)
      : trendingVideos;
    
    // Sort by view count (highest first)
    return filteredTrending.sort((a, b) => {
      const viewsA = parseInt(a.views.replace(/,/g, "")) || 0;
      const viewsB = parseInt(b.views.replace(/,/g, "")) || 0;
      return viewsB - viewsA;
    });
  } catch (error) {
    console.error("Error getting trending content:", error);
    return [];
  }
};

// Get recommended content based on user preferences
export const getRecommendedContent = async (
  userPreferences: string[] = [],
  freeOnly: boolean = true
): Promise<AggregatedVideo[]> => {
  try {
    let recommendedVideos: AggregatedVideo[] = [];
    
    // Search for each preference
    if (userPreferences.length > 0) {
      const searchResults = await Promise.all(
        userPreferences.map(pref => searchEducationalVideos(pref))
      );
      
      // Flatten and deduplicate results
      const uniqueVideos = new Map();
      searchResults.flat().forEach(video => {
        if (!uniqueVideos.has(video.id)) {
          uniqueVideos.set(video.id, video);
        }
      });
      
      recommendedVideos = Array.from(uniqueVideos.values());
    } else {
      // If no preferences, get educational videos
      recommendedVideos = await getEducationalVideos();
    }
    
    // Filter by free content if specified
    if (freeOnly) {
      recommendedVideos = recommendedVideos.filter(video => video.isFree);
    }
    
    // Sort by relevance (for now, just by published date)
    return recommendedVideos.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } catch (error) {
    console.error("Error getting recommended content:", error);
    return [];
  }
};
