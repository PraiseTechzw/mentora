"use client"

import React, { useState, useRef, useEffect } from "react"
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
  Platform,
  ActivityIndicator
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { useRouter } from "expo-router"

import { SearchBar } from "../../components/SearchBar"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { 
  getAggregatedContent, 
  getTrendingContent, 
  getRecommendedContent,
  discoverEducationalChannels
} from "../../services/content-aggregator"
import { AggregatedVideo } from "../../types/videoag"

// Define category colors and icons
const CATEGORY_COLORS = [
  "#4361EE", "#3A0CA3", "#7209B7", "#F72585", 
  "#4CC9F0", "#F77F00", "#4D908E", "#F94144"
];

const CATEGORY_ICONS = [
  "laptop-code", "square-root-alt", "flask", "landmark", 
  "language", "paint-brush", "chart-line", "heartbeat"
];

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.8
const CARD_SPACING = 10

const getDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  return days[today];
};

export default function ExploreScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const scrollX = useRef(new Animated.Value(0)).current
  const [isLoading, setIsLoading] = useState(true)
  const [videos, setVideos] = useState<AggregatedVideo[]>([])
  const [featuredContent, setFeaturedContent] = useState<AggregatedVideo[]>([])
  const [trendingCourses, setTrendingCourses] = useState<AggregatedVideo[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<AggregatedVideo[]>([])
  const [learningPaths, setLearningPaths] = useState<any[]>([])
  const [popularChannels, setPopularChannels] = useState<any[]>([])
  const [userData, setUserData] = useState({
    streak: 0,
    points: 0
  })
  const [categories, setCategories] = useState<any[]>([])

  // Load all content when component mounts or when search/category changes
  useEffect(() => {
    const loadAllContent = async () => {
      setIsLoading(true)
      try {
        // Generate categories dynamically
        const categoryNames = ["Programming", "Mathematics", "Science", "History", 
                              "Languages", "Arts", "Business", "Health"];
        const categoriesData = categoryNames.map((name, index) => ({
          id: `${index + 1}`,
          name,
          icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        }));
        setCategories(categoriesData);
        
        // Load main videos based on search/category
        const mainContent = await getAggregatedContent(searchQuery, activeCategory)
        setVideos(mainContent)
        
        // Load featured content (trending educational videos)
        const featured = await getTrendingContent(true)
        setFeaturedContent(featured.slice(0, 5))
        
        // Load trending courses
        const trending = await getTrendingContent(true)
        setTrendingCourses(trending.slice(0, 3))
        
        // Load recently viewed (in a real app, this would come from local storage)
        // For now, we'll use recommended content as a placeholder
        const recent = await getRecommendedContent(["programming", "web development"], true)
        setRecentlyViewed(recent.slice(0, 5))
        
        // Load learning paths (in a real app, this would come from an API)
        // For now, we'll generate learning paths based on categories
        const learningPathsData = categoriesData.slice(0, 3).map((category, index) => ({
          id: `lp${index + 1}`,
          title: `${category.name} Path`,
          description: `Master ${category.name.toLowerCase()} concepts and skills`,
          icon: category.icon,
          duration: `${Math.floor(Math.random() * 6) + 3} months`,
          level: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
          courses: Math.floor(Math.random() * 10) + 5,
        }))
        setLearningPaths(learningPathsData)
        
        // Load popular channels
        const channels = await discoverEducationalChannels()
        setPopularChannels(channels.map(channel => ({
          ...channel,
          type: 'youtube',
          featured: true
        })))
        
        // Load user data (in a real app, this would come from a user service)
        // For now, we'll use random values
        setUserData({
          streak: Math.floor(Math.random() * 30) + 1,
          points: Math.floor(Math.random() * 5000) + 500
        })
      } catch (error) {
        console.error("Error loading content:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAllContent()
  }, [searchQuery, activeCategory])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      // Refresh all content
      const mainContent = await getAggregatedContent(searchQuery, activeCategory)
      setVideos(mainContent)
      
      const featured = await getTrendingContent(true)
      setFeaturedContent(featured.slice(0, 5))
      
      const trending = await getTrendingContent(true)
      setTrendingCourses(trending.slice(0, 3))
      
      const recent = await getRecommendedContent(["programming", "web development"], true)
      setRecentlyViewed(recent.slice(0, 5))
      
      const channels = await discoverEducationalChannels()
      setPopularChannels(channels.map(channel => ({
        ...channel,
        type: 'youtube',
        featured: true
      })))
    } catch (error) {
      console.error("Error refreshing content:", error)
    } finally {
      setRefreshing(false)
    }
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
      <Text style={styles.categoryCount}>{videos.filter(v => v.title.toLowerCase().includes(item.name.toLowerCase())).length} courses</Text>
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
              <Text style={styles.featuredCategoryText}>{item.source}</Text>
            </View>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredSubtitle}>{item.description}</Text>
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
    <TouchableOpacity 
      style={styles.trendingCourse}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <Image source={item.thumbnail} style={styles.courseThumbnail} contentFit="cover" />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.instructorName}>{item.channelName}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" solid size={14} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.rating || "4.5"} ({item.views} views)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderRecentlyViewed = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentlyViewedItem}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <View style={styles.recentlyViewedThumbnailContainer}>
        <Image source={item.thumbnail} style={styles.recentlyViewedThumbnail} contentFit="cover" />
        <View style={styles.recentlyViewedProgressContainer}>
          <View style={[styles.recentlyViewedProgress, { width: "65%" }]} />
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
        {popularChannels.length > 0 ? (
          <FlatList
            data={popularChannels}
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
        ) : (
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={styles.emptyStateText}>Loading channels...</Text>
          </View>
        )}
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
              <Text style={styles.greeting}>{getDayOfWeek()}</Text>
              <Text style={styles.subGreeting}>What would you like to learn today?</Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.userStatItem}>
                <FontAwesome5 name="fire" size={16} color="#FF6B6B" />
                <Text style={styles.userStatText}>{userData.streak} day streak</Text>
              </View>
              <View style={styles.userStatItem}>
                <FontAwesome5 name="star" size={16} color="#FFD700" />
                <Text style={styles.userStatText}>{userData.points} points</Text>
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
            {featuredContent.length > 0 ? (
              <>
                <Animated.FlatList
                  data={featuredContent}
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
                  {featuredContent.map((_, index) => {
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
              </>
            ) : (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color="#4361EE" />
                <Text style={styles.emptyStateText}>Loading featured content...</Text>
              </View>
            )}
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
              data={categories}
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
            {recentlyViewed.length > 0 ? (
              <FlatList
                data={recentlyViewed}
                renderItem={renderRecentlyViewed}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentlyViewedList}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color="#4361EE" />
                <Text style={styles.emptyStateText}>Loading recently viewed...</Text>
              </View>
            )}
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
              data={learningPaths}
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
            {trendingCourses.length > 0 ? (
              <FlatList
                data={trendingCourses}
                renderItem={renderTrendingCourse}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.trendingList}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color="#4361EE" />
                <Text style={styles.emptyStateText}>Loading trending courses...</Text>
              </View>
            )}
          </View>

          {/* Modern video cards */}
          <View style={styles.videosContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllButton}>See All</Text>
              </TouchableOpacity>
            </View>
            {videos.length > 0 ? (
              videos.map((video) => (
                <ModernVideoCard
                  key={video.id}
                  video={video}
                  onPress={() => router.push(`/video/${video.id}`)}
                  style={styles.videoCard}
                />
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color="#4361EE" />
                <Text style={styles.emptyStateText}>Loading recommendations...</Text>
              </View>
            )}
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
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
})

