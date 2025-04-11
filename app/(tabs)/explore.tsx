"use client"

import { useState, useRef, useEffect } from "react"
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  Dimensions,
  Animated,
  Platform
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"

import { SearchBar } from "../../components/SearchBar"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { AggregatedVideo } from "../../services/content-aggregator"

// Mock user data
const USER = {
  name: "Alex",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  streak: 7,
  points: 1250,
}

// Mock categories with icons and course counts
const CATEGORIES = [
  { id: "1", name: "Programming", icon: "laptop-code", count: 245, color: "#4361EE" },
  { id: "2", name: "Mathematics", icon: "square-root-alt", count: 189, color: "#3A0CA3" },
  { id: "3", name: "Science", icon: "flask", count: 312, color: "#7209B7" },
  { id: "4", name: "History", icon: "landmark", count: 156, color: "#F72585" },
  { id: "5", name: "Languages", icon: "language", count: 201, color: "#4CC9F0" },
  { id: "6", name: "Arts", icon: "paint-brush", count: 124, color: "#F77F00" },
  { id: "7", name: "Business", icon: "chart-line", count: 178, color: "#4D908E" },
  { id: "8", name: "Health", icon: "heartbeat", count: 143, color: "#F94144" },
]

// Mock trending courses
const TRENDING_COURSES = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Andrew Smith",
    thumbnail: "https://i.ytimg.com/vi/NWONeJKn6kc/maxresdefault.jpg",
    rating: 4.8,
    students: 12453,
  },
  {
    id: "2",
    title: "Complete Web Development Bootcamp",
    instructor: "Jessica Chen",
    thumbnail: "https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
    rating: 4.9,
    students: 28941,
  },
  {
    id: "3",
    title: "Financial Literacy: Master Your Money",
    instructor: "Robert Kiyosaki",
    thumbnail: "https://i.ytimg.com/vi/KCzIfiLZK7w/maxresdefault.jpg",
    rating: 4.7,
    students: 9872,
  },
]

// Mock featured content
const FEATURED_CONTENT = [
  {
    id: "f1",
    title: "The Future of AI",
    subtitle: "Explore the latest developments in artificial intelligence",
    thumbnail: "https://i.ytimg.com/vi/NWONeJKn6kc/maxresdefault.jpg",
    category: "Programming",
    duration: "12:45",
    source: "youtube",
  },
  {
    id: "f2",
    title: "Quantum Computing Explained",
    subtitle: "Understanding the principles of quantum computing",
    thumbnail: "https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
    category: "Science",
    duration: "18:30",
    source: "coursera",
  },
  {
    id: "f3",
    title: "Financial Markets 2023",
    subtitle: "Analysis of current financial market trends",
    thumbnail: "https://i.ytimg.com/vi/KCzIfiLZK7w/maxresdefault.jpg",
    category: "Business",
    duration: "15:20",
    source: "udemy",
  },
]

// Mock recently viewed
const RECENTLY_VIEWED = [
  {
    id: "rv1",
    title: "Introduction to React Native",
    thumbnail: "https://i.ytimg.com/vi/NWONeJKn6kc/maxresdefault.jpg",
    progress: 0.65,
    duration: "45:30",
    source: "youtube",
  },
  {
    id: "rv2",
    title: "Advanced JavaScript Concepts",
    thumbnail: "https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
    progress: 0.30,
    duration: "32:15",
    source: "udemy",
  },
]

// Mock popular instructors
const POPULAR_INSTRUCTORS = [
  {
    id: "i1",
    name: "Dr. Sarah Johnson",
    specialty: "Data Science",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    followers: 125000,
  },
  {
    id: "i2",
    name: "Michael Chen",
    specialty: "Web Development",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    followers: 98000,
  },
  {
    id: "i3",
    name: "Emily Rodriguez",
    specialty: "UX Design",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    followers: 75000,
  },
]

// Mock learning paths
const LEARNING_PATHS = [
  {
    id: "lp1",
    title: "Full-Stack Developer",
    description: "Master front-end and back-end development",
    icon: "code",
    duration: "6 months",
    level: "Intermediate",
    courses: 12,
  },
  {
    id: "lp2",
    title: "Data Scientist",
    description: "Learn data analysis and machine learning",
    icon: "chart-bar",
    duration: "8 months",
    level: "Advanced",
    courses: 15,
  },
  {
    id: "lp3",
    title: "Digital Marketing",
    description: "Master online marketing strategies",
    icon: "bullhorn",
    duration: "4 months",
    level: "Beginner",
    courses: 8,
  },
]

// Mock aggregated videos for ModernVideoCard
const AGGREGATED_VIDEOS: AggregatedVideo[] = [
  {
    id: "v1",
    title: "Complete React Native Tutorial",
    description: "Learn React Native from scratch",
    thumbnail: "https://i.ytimg.com/vi/0kYk9Jh7ZtY/maxresdefault.jpg",
    channelTitle: "Traversy Media",
    publishedAt: "2024-03-15T10:00:00Z",
    viewCount: "150K",
    duration: "2:30:00",
    source: "youtube" as const,
    sourceUrl: "https://youtube.com/watch?v=0kYk9Jh7ZtY",
    videoUrl: "https://youtube.com/watch?v=0kYk9Jh7ZtY",
    rating: 4.8,
  },
  {
    id: "v2",
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into JavaScript advanced features",
    thumbnail: "https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
    channelTitle: "JavaScript Academy",
    publishedAt: "2023-06-20T14:15:00Z",
    viewCount: "98,000",
    duration: "18:30",
    source: "udemy",
    sourceUrl: "https://udemy.com/course/example2",
    videoUrl: "https://udemy.com/course/example2",
    rating: 4.7,
  },
]

// Mock popular channels and sources
const POPULAR_CHANNELS = [
  {
    id: "c1",
    name: "Traversy Media",
    type: "youtube",
    subscribers: "1.8M",
    description: "Web development tutorials and courses",
    avatar: "https://yt3.googleusercontent.com/ytc/APkrFKZWeMCsx4rzNfxYYwZlnZUFr4DZt1h9JQJ8H6B4=s176-c-k-c0x00ffffff-no-rj",
    featured: true,
  },
  {
    id: "c2",
    name: "freeCodeCamp",
    type: "youtube",
    subscribers: "7.2M",
    description: "Learn to code for free",
    avatar: "https://yt3.googleusercontent.com/ytc/APkrFKa_8ZIz9JXQps8PpMkqNk3hOKJHKXJbJZQJ8JZQ=s176-c-k-c0x00ffffff-no-rj",
    featured: true,
  },
  {
    id: "c3",
    name: "Coursera",
    type: "platform",
    description: "Online learning platform with university courses",
    logo: "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera.s3.amazonaws.com/media/coursera-logo-square.png",
    featured: true,
  },
  {
    id: "c4",
    name: "Udemy",
    type: "platform",
    description: "Learn anything, anywhere",
    logo: "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg",
    featured: true,
  },
]

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.8
const CARD_SPACING = 10

export default function ExploreScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const scrollX = useRef(new Animated.Value(0)).current
  const [isLoading, setIsLoading] = useState(false)

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  const getSourceIcon = (source) => {
    switch (source) {
      case "youtube":
        return "youtube"
      case "udemy":
        return "chalkboard-teacher"
      case "coursera":
        return "graduation-cap"
      default:
        return "play-circle"
    }
  }

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        activeCategory === item.name.toLowerCase() && styles.activeCategoryItem
      ]}
      onPress={() => setActiveCategory(item.name.toLowerCase())}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <FontAwesome5 name={item.icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count} courses</Text>
    </TouchableOpacity>
  )

  const renderFeaturedItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ]

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    })

    return (
      <Animated.View 
        style={[
          styles.featuredCard,
          { 
            transform: [{ scale }],
            opacity,
          }
        ]}
      >
        <Image source={item.thumbnail} style={styles.featuredThumbnail} contentFit="cover" />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredCategory}>
              <Text style={styles.featuredCategoryText}>{item.category}</Text>
            </View>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredSubtitle}>{item.subtitle}</Text>
            <View style={styles.featuredMeta}>
              <View style={styles.featuredMetaItem}>
                <FontAwesome5 name="clock" size={12} color="#FFF" />
                <Text style={styles.featuredMetaText}>{item.duration}</Text>
              </View>
              <View style={styles.featuredMetaItem}>
                <FontAwesome5 name={getSourceIcon(item.source)} size={12} color="#FFF" />
                <Text style={styles.featuredMetaText}>{item.source}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  const renderTrendingCourse = ({ item }) => (
    <TouchableOpacity style={styles.trendingCourse}>
      <Image source={item.thumbnail} style={styles.courseThumbnail} contentFit="cover" />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" solid size={14} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.students.toLocaleString()} students)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderRecentlyViewed = ({ item }) => (
    <TouchableOpacity style={styles.recentlyViewedItem}>
      <View style={styles.recentlyViewedThumbnailContainer}>
        <Image source={item.thumbnail} style={styles.recentlyViewedThumbnail} contentFit="cover" />
        <View style={styles.recentlyViewedProgressContainer}>
          <View style={[styles.recentlyViewedProgress, { width: `${item.progress * 100}%` }]} />
        </View>
        <View style={styles.recentlyViewedDuration}>
          <Text style={styles.recentlyViewedDurationText}>{item.duration}</Text>
        </View>
      </View>
      <Text style={styles.recentlyViewedTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  )

  const renderInstructor = ({ item }) => (
    <TouchableOpacity style={styles.instructorCard}>
      <Image source={item.avatar} style={styles.instructorAvatar} contentFit="cover" />
      <View style={styles.instructorInfo}>
        <Text style={styles.instructorName}>{item.name}</Text>
        <Text style={styles.instructorSpecialty}>{item.specialty}</Text>
        <View style={styles.instructorFollowers}>
          <FontAwesome5 name="users" size={12} color="#666" />
          <Text style={styles.instructorFollowersText}>
            {item.followers.toLocaleString()} followers
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderLearningPath = ({ item }) => (
    <TouchableOpacity style={styles.learningPathCard}>
      <View style={styles.learningPathIconContainer}>
        <FontAwesome5 name={item.icon} size={24} color="#4361EE" />
      </View>
      <View style={styles.learningPathInfo}>
        <Text style={styles.learningPathTitle}>{item.title}</Text>
        <Text style={styles.learningPathDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.learningPathMeta}>
          <View style={styles.learningPathMetaItem}>
            <FontAwesome5 name="clock" size={12} color="#666" />
            <Text style={styles.learningPathMetaText}>{item.duration}</Text>
          </View>
          <View style={styles.learningPathMetaItem}>
            <FontAwesome5 name="signal" size={12} color="#666" />
            <Text style={styles.learningPathMetaText}>{item.level}</Text>
          </View>
          <View style={styles.learningPathMetaItem}>
            <FontAwesome5 name="book" size={12} color="#666" />
            <Text style={styles.learningPathMetaText}>{item.courses} courses</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader} />
      <View style={styles.skeletonSearch} />
      <View style={styles.skeletonCategories}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.skeletonCategory} />
        ))}
      </View>
      <View style={styles.skeletonFeatured} />
      <View style={styles.skeletonTrending}>
        {[1, 2].map((item) => (
          <View key={item} style={styles.skeletonTrendingItem} />
        ))}
      </View>
    </View>
  )

  const renderPopularChannels = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Channels</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={POPULAR_CHANNELS}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.channelCard}>
              <Image
                source={{ uri: item.type === 'youtube' ? item.avatar : item.logo }}
                style={styles.channelAvatar}
              />
              <View style={styles.channelInfo}>
                <Text style={styles.channelName}>{item.name}</Text>
                <Text style={styles.channelDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.type === 'youtube' && (
                  <Text style={styles.subscriberCount}>{item.subscribers} subscribers</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        renderSkeletonLoader()
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header with greeting */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, Alex! 👋</Text>
              <Text style={styles.subGreeting}>What would you like to learn today?</Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.userStatItem}>
                <FontAwesome5 name="fire" size={16} color="#FF6B6B" />
                <Text style={styles.userStatText}>7 day streak</Text>
              </View>
              <View style={styles.userStatItem}>
                <FontAwesome5 name="star" size={16} color="#FFD700" />
                <Text style={styles.userStatText}>1250 points</Text>
              </View>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search for topics, courses, or instructors"
      />
            <TouchableOpacity style={styles.filterButton}>
              <FontAwesome5 name="sliders-h" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Featured content carousel */}
          <View style={styles.featuredContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <Animated.FlatList
              data={FEATURED_CONTENT}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.featuredList}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            />
            <View style={styles.paginationContainer}>
              {FEATURED_CONTENT.map((_, index) => {
                const inputRange = [
                  (index - 1) * CARD_WIDTH,
                  index * CARD_WIDTH,
                  (index + 1) * CARD_WIDTH,
                ]

                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [8, 16, 8],
                  extrapolate: "clamp",
                })

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.4, 1, 0.4],
                  extrapolate: "clamp",
                })

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.paginationDot,
                      { width: dotWidth, opacity },
                    ]}
                  />
                )
              })}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Browse Categories</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
          </View>

          {/* Recently viewed */}
          <View style={styles.recentlyViewedContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={RECENTLY_VIEWED}
              renderItem={renderRecentlyViewed}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentlyViewedList}
            />
          </View>

          {/* Popular instructors */}
          <View style={styles.instructorsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Instructors</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={POPULAR_INSTRUCTORS}
              renderItem={renderInstructor}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.instructorsList}
            />
          </View>

          {/* Learning paths */}
          <View style={styles.learningPathsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Learning Paths</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={LEARNING_PATHS}
              renderItem={renderLearningPath}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.learningPathsList}
            />
          </View>

          {/* Trending courses */}
          <View style={styles.trendingContainer}>
            <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Trending Courses</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
      <FlatList
        data={TRENDING_COURSES}
        renderItem={renderTrendingCourse}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.trendingList}
              scrollEnabled={false}
            />
          </View>

          {/* Modern video cards */}
          <View style={styles.videosContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            {AGGREGATED_VIDEOS.map((video) => (
              <ModernVideoCard
                key={video.id}
                video={video}
                onPress={() => router.push(`/video/${video.id}`)}
                style={styles.videoCard}
              />
            ))}
          </View>

          {renderPopularChannels()}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  userStats: {
    flexDirection: "row",
  },
  userStatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userStatText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllButton: {
    fontSize: 14,
    color: "#4361EE",
    fontWeight: "600",
  },
  featuredContainer: {
    marginBottom: 24,
  },
  featuredList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: CARD_SPACING,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredThumbnail: {
    width: "100%",
    height: "100%",
  },
  featuredGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    padding: 16,
  },
  featuredContent: {
    width: "100%",
  },
  featuredCategory: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  featuredCategoryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  featuredSubtitle: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: "row",
  },
  featuredMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  featuredMetaText: {
    color: "#FFF",
    fontSize: 12,
    marginLeft: 4,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4361EE",
    marginHorizontal: 4,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryItem: {
    width: 120,
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCategoryItem: {
    borderWidth: 2,
    borderColor: "#4361EE",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: "#666",
  },
  recentlyViewedContainer: {
    marginBottom: 24,
  },
  recentlyViewedList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recentlyViewedItem: {
    width: 160,
    marginRight: 12,
  },
  recentlyViewedThumbnailContainer: {
    position: "relative",
    width: "100%",
    height: 90,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  recentlyViewedThumbnail: {
    width: "100%",
    height: "100%",
  },
  recentlyViewedProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  recentlyViewedProgress: {
    height: "100%",
    backgroundColor: "#4361EE",
  },
  recentlyViewedDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recentlyViewedDurationText: {
    color: "#FFF",
    fontSize: 10,
  },
  recentlyViewedTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  instructorsContainer: {
    marginBottom: 24,
  },
  instructorsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  instructorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  instructorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  instructorSpecialty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  instructorFollowers: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructorFollowersText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: "#4361EE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  followButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  learningPathsContainer: {
    marginBottom: 24,
  },
  learningPathsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  learningPathCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  learningPathIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(67, 97, 238, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  learningPathInfo: {
    flex: 1,
  },
  learningPathTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  learningPathDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  learningPathMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  learningPathMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  learningPathMetaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  trendingContainer: {
    marginBottom: 24,
  },
  trendingList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trendingCourse: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseThumbnail: {
    width: 120,
    height: 90,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  videosContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  videoCard: {
    marginBottom: 16,
  },
  // Skeleton loader styles
  skeletonContainer: {
    flex: 1,
    padding: 16,
  },
  skeletonHeader: {
    height: 60,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonSearch: {
    height: 50,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    marginBottom: 24,
  },
  skeletonCategories: {
    flexDirection: "row",
    marginBottom: 24,
  },
  skeletonCategory: {
    width: 100,
    height: 100,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    marginRight: 12,
  },
  skeletonFeatured: {
    height: 200,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    marginBottom: 24,
  },
  skeletonTrending: {
    marginBottom: 24,
  },
  skeletonTrendingItem: {
    height: 100,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  channelCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  channelAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  channelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subscriberCount: {
    fontSize: 12,
    color: '#888',
  },
})
