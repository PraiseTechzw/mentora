// Service for aggregating content from multiple sources

import { searchVideos, getPopularEducationalVideos, getVideosByCategory } from "./youtube-api"

// Define a common interface for all video sources
export interface AggregatedVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  channelId?: string
  publishedAt: string
  viewCount: string
  duration: string
  source: "youtube" | "udemy" | "coursera" | "khan-academy" | "edx" | "custom"
  sourceUrl: string
  videoUrl: string
}

// Mock data for other platforms (in a real app, these would be API calls)
const UDEMY_COURSES = [
  {
    id: "udemy-1",
    title: "Complete Python Bootcamp: From Zero to Hero in Python",
    description:
      "Learn Python like a Professional! Start from the basics and go all the way to creating your own applications and games!",
    thumbnail: "https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg",
    instructor: "Jose Portilla",
    publishedAt: "2021-05-15",
    students: "1.2M",
    rating: "4.6",
    duration: "22h 30m",
    price: "$13.99",
    url: "https://www.udemy.com/course/complete-python-bootcamp/",
  },
  {
    id: "udemy-2",
    title: "The Complete 2023 Web Development Bootcamp",
    description:
      "Become a Full-Stack Web Developer with just ONE course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps",
    thumbnail: "https://i.ytimg.com/vi/l1EssrLxt7E/maxresdefault.jpg",
    instructor: "Dr. Angela Yu",
    publishedAt: "2022-01-10",
    students: "850K",
    rating: "4.7",
    duration: "65h 15m",
    price: "$15.99",
    url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
  },
]

const COURSERA_COURSES = [
  {
    id: "coursera-1",
    title: "Machine Learning",
    description:
      "This course provides a broad introduction to machine learning, datamining, and statistical pattern recognition.",
    thumbnail: "https://i.ytimg.com/vi/qeHZOdmJvFU/maxresdefault.jpg",
    instructor: "Andrew Ng",
    institution: "Stanford University",
    publishedAt: "2022-03-20",
    students: "4.8M",
    rating: "4.9",
    duration: "11 weeks",
    url: "https://www.coursera.org/learn/machine-learning",
  },
  {
    id: "coursera-2",
    title: "Learning How to Learn",
    description:
      "This course gives you easy access to the invaluable learning techniques used by experts in art, music, literature, math, science, sports, and many other disciplines.",
    thumbnail: "https://i.ytimg.com/vi/O96fE1E-rf8/maxresdefault.jpg",
    instructor: "Dr. Barbara Oakley",
    institution: "Deep Teaching Solutions",
    publishedAt: "2021-11-05",
    students: "3.2M",
    rating: "4.8",
    duration: "4 weeks",
    url: "https://www.coursera.org/learn/learning-how-to-learn",
  },
]

const KHAN_ACADEMY_COURSES = [
  {
    id: "khan-1",
    title: "Algebra 1",
    description: "Learn algebra 1 for free—linear equations, functions, polynomials, factoring, and more.",
    thumbnail: "https://i.ytimg.com/vi/NybHckSEQBI/maxresdefault.jpg",
    instructor: "Sal Khan",
    publishedAt: "2022-08-15",
    students: "10M+",
    duration: "Self-paced",
    url: "https://www.khanacademy.org/math/algebra",
  },
  {
    id: "khan-2",
    title: "Physics - Mechanics",
    description:
      "Learn about the physics of motion, forces, energy, and momentum. Prepare for AP® Physics 1 or introductory college mechanics.",
    thumbnail: "https://i.ytimg.com/vi/ZM8ECpBuQYE/maxresdefault.jpg",
    instructor: "Sal Khan",
    publishedAt: "2022-06-10",
    students: "5M+",
    duration: "Self-paced",
    url: "https://www.khanacademy.org/science/physics",
  },
]

// Convert platform-specific data to our common format
function convertUdemyToAggregated(course: (typeof UDEMY_COURSES)[0]): AggregatedVideo {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    channelTitle: course.instructor,
    publishedAt: course.publishedAt,
    viewCount: course.students,
    duration: course.duration,
    source: "udemy",
    sourceUrl: course.url,
    videoUrl: course.url, // In a real app, this would be a preview video URL
  }
}

function convertCourseraToAggregated(course: (typeof COURSERA_COURSES)[0]): AggregatedVideo {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    channelTitle: `${course.instructor} (${course.institution})`,
    publishedAt: course.publishedAt,
    viewCount: course.students,
    duration: course.duration,
    source: "coursera",
    sourceUrl: course.url,
    videoUrl: course.url, // In a real app, this would be a preview video URL
  }
}

function convertKhanAcademyToAggregated(course: (typeof KHAN_ACADEMY_COURSES)[0]): AggregatedVideo {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    channelTitle: course.instructor,
    publishedAt: course.publishedAt,
    viewCount: course.students,
    duration: course.duration,
    source: "khan-academy",
    sourceUrl: course.url,
    videoUrl: course.url, // In a real app, this would be a preview video URL
  }
}

// Get content from all sources
export async function getAggregatedContent(query?: string, category?: string): Promise<AggregatedVideo[]> {
  let youtubeVideos = []

  try {
    // Get YouTube videos based on query or category
    if (query) {
      youtubeVideos = await searchVideos(query)
    } else if (category) {
      youtubeVideos = await getVideosByCategory(category)
    } else {
      youtubeVideos = await getPopularEducationalVideos()
    }

    // Convert YouTube videos to our common format
    const formattedYoutubeVideos: AggregatedVideo[] = youtubeVideos.map((video) => ({
      ...video,
      source: "youtube",
      sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
    }))

    // Get content from other platforms
    // In a real app, these would be filtered by query/category
    const udemyVideos = UDEMY_COURSES.map(convertUdemyToAggregated)
    const courseraVideos = COURSERA_COURSES.map(convertCourseraToAggregated)
    const khanVideos = KHAN_ACADEMY_COURSES.map(convertKhanAcademyToAggregated)

    // Combine all sources
    const allVideos = [...formattedYoutubeVideos, ...udemyVideos, ...courseraVideos, ...khanVideos]

    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase()
      return allVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(lowerQuery) || video.description.toLowerCase().includes(lowerQuery),
      )
    }

    // Filter by category if provided
    if (category && category !== "All") {
      const categoryMap: Record<string, string[]> = {
        Programming: ["programming", "coding", "developer", "software", "web development"],
        Mathematics: ["math", "mathematics", "algebra", "calculus", "geometry"],
        Science: ["science", "physics", "chemistry", "biology", "astronomy"],
        History: ["history", "historical", "ancient", "medieval", "modern history"],
        Languages: ["language", "english", "spanish", "french", "german", "japanese"],
        Arts: ["art", "drawing", "painting", "music", "design"],
        Business: ["business", "marketing", "finance", "entrepreneurship", "management"],
      }

      const keywords = categoryMap[category] || [category.toLowerCase()]
      return allVideos.filter((video) => {
        const lowerTitle = video.title.toLowerCase()
        const lowerDesc = video.description.toLowerCase()
        return keywords.some((keyword) => lowerTitle.includes(keyword) || lowerDesc.includes(keyword))
      })
    }

    return allVideos
  } catch (error) {
    console.error("Error aggregating content:", error)
    return []
  }
}

// Get trending content from all sources
export async function getTrendingContent(): Promise<AggregatedVideo[]> {
  try {
    const youtubeVideos = await getPopularEducationalVideos(undefined, 5)
    const formattedYoutubeVideos: AggregatedVideo[] = youtubeVideos.map((video) => ({
      ...video,
      source: "youtube",
      sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
    }))

    // Get a selection from other platforms
    const udemyVideos = UDEMY_COURSES.slice(0, 2).map(convertUdemyToAggregated)
    const courseraVideos = COURSERA_COURSES.slice(0, 2).map(convertCourseraToAggregated)
    const khanVideos = KHAN_ACADEMY_COURSES.slice(0, 1).map(convertKhanAcademyToAggregated)

    // Combine and shuffle
    const allVideos = [...formattedYoutubeVideos, ...udemyVideos, ...courseraVideos, ...khanVideos]
    return shuffleArray(allVideos)
  } catch (error) {
    console.error("Error getting trending content:", error)
    return []
  }
}

// Get recommended content based on user preferences
export async function getRecommendedContent(
  userPreferences: { categories: string[]; tags: string[] } = { categories: [], tags: [] },
): Promise<AggregatedVideo[]> {
  try {
    const recommendedVideos: AggregatedVideo[] = []

    // Get videos for each preferred category
    for (const category of userPreferences.categories) {
      const categoryVideos = await getVideosByCategory(category, 3)
      const formattedVideos: AggregatedVideo[] = categoryVideos.map((video) => ({
        ...video,
        source: "youtube",
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      }))
      recommendedVideos.push(...formattedVideos)
    }

    // Get videos for each preferred tag
    for (const tag of userPreferences.tags) {
      const tagVideos = await searchVideos(tag, 2)
      const formattedVideos: AggregatedVideo[] = tagVideos.map((video) => ({
        ...video,
        source: "youtube",
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      }))
      recommendedVideos.push(...formattedVideos)
    }

    // If no preferences, get popular videos
    if (recommendedVideos.length === 0) {
      const popularVideos = await getPopularEducationalVideos()
      const formattedVideos: AggregatedVideo[] = popularVideos.map((video) => ({
        ...video,
        source: "youtube",
        sourceUrl: `https://www.youtube.com/watch?v=${video.id}`,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      }))
      recommendedVideos.push(...formattedVideos)
    }

    // Add some content from other platforms
    recommendedVideos.push(...UDEMY_COURSES.map(convertUdemyToAggregated))
    recommendedVideos.push(...COURSERA_COURSES.map(convertCourseraToAggregated))
    recommendedVideos.push(...KHAN_ACADEMY_COURSES.map(convertKhanAcademyToAggregated))

    // Remove duplicates and shuffle
    const uniqueVideos = removeDuplicates(recommendedVideos, "id")
    return shuffleArray(uniqueVideos)
  } catch (error) {
    console.error("Error getting recommended content:", error)
    return []
  }
}

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Helper function to remove duplicates from an array based on a key
function removeDuplicates<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter((item) => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}
