"use client"

import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, Animated, Platform, TextInput, Share } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { SearchBar } from "../../components/SearchBar"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { getAggregatedContent, type AggregatedVideo } from "../../services/content-aggregator"
import * as UserService from "../../services/user-service"
import { getVideoDetails } from "../../services/content-aggregator"

// Mock user data
const USER = {
  name: "Alex",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  streak: 7,
  totalWatchTime: "42h",
  completedCourses: 12,
  achievements: 5,
  dailyGoal: 60, // minutes
  completedToday: 45,
  downloadedCourses: 3,
}

// Mock categories
const CATEGORIES = [
  { id: "1", name: "Web Development", icon: "code", count: 5 },
  { id: "2", name: "Mobile Apps", icon: "mobile-alt", count: 3 },
  { id: "3", name: "Data Science", icon: "chart-bar", count: 4 },
  { id: "4", name: "Design", icon: "paint-brush", count: 2 },
]

// Mock continue learning items
const CONTINUE_LEARNING = [
  {
    id: "cl1",
    title: "Advanced React Patterns",
    instructor: "Kent C. Dodds",
    thumbnail: "https://i.ytimg.com/vi/WV0UUcSPk-0/maxresdefault.jpg",
    progress: 45,
    lastWatched: "2 hours ago",
    nextLesson: "Custom Hooks",
  },
  {
    id: "cl2",
    title: "Data Structures & Algorithms",
    instructor: "Gayle Laakmann McDowell",
    thumbnail: "https://i.ytimg.com/vi/RBSGKlAvoiM/maxresdefault.jpg",
    progress: 72,
    lastWatched: "1 day ago",
    nextLesson: "Binary Trees",
  },
]

// Mock recommendations
const RECOMMENDATIONS = [
  {
    id: "r1",
    title: "React Native Mastery",
    instructor: "William Candillon",
    thumbnail: "https://i.ytimg.com/vi/0kYk9Jh7ZtY/maxresdefault.jpg",
    rating: 4.8,
    students: "12.5K",
    duration: "8h 30m",
  },
  {
    id: "r2",
    title: "TypeScript Deep Dive",
    instructor: "Matt Pocock",
    thumbnail: "https://i.ytimg.com/vi/30LWjhZzg50/maxresdefault.jpg",
    rating: 4.9,
    students: "8.2K",
    duration: "6h 45m",
  },
]

// Mock data for saved courses and history
const SAVED_COURSES = [
  {
    id: "1",
    title: "Advanced React Patterns",
    instructor: "Kent C. Dodds",
    thumbnail: "https://i.ytimg.com/vi/WV0UUcSPk-0/maxresdefault.jpg",
    progress: 45,
    lastWatched: "2 days ago",
  },
  {
    id: "2",
    title: "Data Structures & Algorithms",
    instructor: "Gayle Laakmann McDowell",
    thumbnail: "https://i.ytimg.com/vi/RBSGKlAvoiM/maxresdefault.jpg",
    progress: 72,
    lastWatched: "1 week ago",
  },
  {
    id: "3",
    title: "Quantum Computing Explained",
    instructor: "Dr. Quantum",
    thumbnail: "https://i.ytimg.com/vi/JhHMJCUmq28/maxresdefault.jpg",
    progress: 18,
    lastWatched: "3 days ago",
  },
]

const WATCH_HISTORY = [
  {
    id: "1",
    title: "How to Build a Neural Network from Scratch",
    thumbnail: "https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg",
    watchedOn: "2 hours ago",
    duration: "28:45",
    watchedDuration: "28:45",
    completed: true,
  },
  {
    id: "2",
    title: "The Complete Guide to CSS Grid",
    thumbnail: "https://i.ytimg.com/vi/9zBsdzdE4sM/maxresdefault.jpg",
    watchedOn: "Yesterday",
    duration: "42:18",
    watchedDuration: "15:22",
    completed: false,
  },
  {
    id: "3",
    title: "Understanding Blockchain Technology",
    thumbnail: "https://i.ytimg.com/vi/SSo_EIwHSd4/maxresdefault.jpg",
    watchedOn: "3 days ago",
    duration: "1:05:30",
    watchedDuration: "1:05:30",
    completed: true,
  },
]

const LibraryScreen = () => {
  const [user, setUser] = useState(null)
  const [watchHistory, setWatchHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("history")
  const [showDownloaded, setShowDownloaded] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const userData = await UserService.getUserData()
      setUser(userData)

      const completedVideos = userData.completedCourses || []
      
      // Fetch full video details for completed videos
      const completedDetails = await Promise.all(
        completedVideos.map(id => getVideoDetails(id))
      )

      setWatchHistory(completedDetails.filter(Boolean))
    } catch (error) {
      console.error("Error loading library data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleBookmarkToggle = async (videoId) => {
    try {
      if (watchHistory.some(course => course.id === videoId)) {
        await UserService.removeBookmark(videoId)
      } else {
        await UserService.bookmarkVideo(videoId)
      }
      await loadData() // Refresh data
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    }
  }

  const handleVideoPress = (videoId) => {
    router.push(`/video/${videoId}`)
  }

  const renderUserStats = () => (
    <View style={styles.userStatsContainer}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.userStatsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "User") }}
            style={styles.userAvatar}
            contentFit="cover"
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userSubtitle}>{user?.email || ""}</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.completedCourses?.length || 0}</Text>
            <Text style={styles.statLabel}>Courses Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.points || 0}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.bookmarkedVideos?.length || 0}</Text>
            <Text style={styles.statLabel}>Saved Videos</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require("../../assets/images/empty-library.jpg")}
        style={styles.emptyStateImage}
        contentFit="contain"
      />
      <Text style={styles.emptyStateTitle}>
        {activeTab === "history" ? "No Watch History" : "No Downloaded Videos"}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeTab === "history"
          ? "Your watch history will appear here once you start watching videos"
          : "Start downloading videos to watch them later"}
      </Text>
      <TouchableOpacity style={styles.exploreButton} onPress={() => router.push("/explore")}>
        <Text style={styles.exploreButtonText}>Explore Courses</Text>
      </TouchableOpacity>
    </View>
  )

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((key) => (
        <View key={key} style={styles.skeletonItem}>
          <View style={styles.skeletonThumbnail} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonProgress} />
          </View>
        </View>
      ))}
    </View>
  )

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleVideoPress(item.id)}>
      <Image source={{ uri: item.thumbnail }} style={styles.historyThumbnail} contentFit="cover" />
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.historyMeta}>Watched {item.watchedOn || "recently"}</Text>
        <View style={styles.historyProgress}>
          <Text style={styles.historyDuration}>
            {item.completed ? "Completed" : `Watched ${item.watchedDuration || "0:00"} of ${item.duration}`}
          </Text>
          {!item.completed && (
            <TouchableOpacity style={styles.resumeButton} onPress={() => handleVideoPress(item.id)}>
              <Text style={styles.resumeText}>Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {renderUserStats()}
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <FontAwesome5 name="history" size={16} color={activeTab === "history" ? "#FF6B6B" : "#666"} />
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>Watch History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, showDownloaded && styles.activeTab]}
          onPress={() => setShowDownloaded(!showDownloaded)}
        >
          <FontAwesome5 name="download" size={16} color={showDownloaded ? "#FF6B6B" : "#666"} />
          <Text style={[styles.tabText, showDownloaded && styles.activeTabText]}>Downloaded</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        renderSkeletonLoader()
      ) : (
        <FlatList
          data={watchHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#EAEAEA",
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFF",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  courseItem: {
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
  thumbnail: {
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
  instructorName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#EAEAEA",
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  lastWatched: {
    fontSize: 12,
    color: "#999",
  },
  historyItem: {
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
  historyThumbnail: {
    width: 120,
    height: 90,
  },
  historyInfo: {
    flex: 1,
    padding: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  historyProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyDuration: {
    fontSize: 12,
    color: "#666",
  },
  resumeButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resumeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  userStatsContainer: {
    marginBottom: 20,
  },
  userStatsGradient: {
    borderRadius: 16,
    padding: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchTextInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStateImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  skeletonThumbnail: {
    width: 120,
    height: 90,
    backgroundColor: "#EAEAEA",
  },
  skeletonContent: {
    flex: 1,
    padding: 12,
  },
  skeletonTitle: {
    width: "80%",
    height: 16,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText: {
    width: "60%",
    height: 14,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonProgress: {
    width: "100%",
    height: 4,
    backgroundColor: "#EAEAEA",
    borderRadius: 2,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedCategory: {
    backgroundColor: "#FF6B6B",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: "#FFF",
  },
  categoryCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  continueLearningContainer: {
    marginBottom: 20,
  },
  continueLearningCard: {
    width: 300,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  continueLearningThumbnail: {
    width: "100%",
    height: 150,
  },
  continueLearningInfo: {
    padding: 12,
  },
  continueLearningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  continueLearningInstructor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  continueLearningProgress: {
    marginBottom: 8,
  },
  continueLearningList: {
    paddingHorizontal: 16,
  },
  nextLesson: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationCard: {
    width: 250,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  recommendationThumbnail: {
    width: "100%",
    height: 120,
  },
  recommendationInfo: {
    padding: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  recommendationInstructor: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  recommendationMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  studentsText: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  durationText: {
    fontSize: 12,
    color: "#666",
  },
  learningGoalContainer: {
    marginBottom: 20,
  },
  learningGoalGradient: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
  },
  learningGoalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  learningGoalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  learningGoalProgress: {
    marginBottom: 8,
  },
  learningGoalBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginBottom: 8,
  },
  learningGoalFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 4,
  },
  learningGoalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  learningGoalSubtext: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllButton: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  recommendationsList: {
    paddingHorizontal: 16,
  },
})

export default LibraryScreen
