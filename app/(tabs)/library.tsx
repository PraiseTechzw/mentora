"use client"

import { useState, useCallback, useEffect } from "react"
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, Animated, Platform, TextInput, Share } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { SearchBar } from "../../components/SearchBar"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { getAggregatedContent, type AggregatedVideo } from "../../services/content-aggregator"

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

export default function LibraryScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("saved")
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showDownloaded, setShowDownloaded] = useState(false)
  const [videos, setVideos] = useState<AggregatedVideo[]>([])

  // Load content when component mounts or when search/category changes
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true)
      try {
        const content = await getAggregatedContent(searchQuery, selectedCategory)
        setVideos(content)
      } catch (error) {
        console.error("Error loading content:", error)
        setVideos([])
      } finally {
        setIsLoading(false)
      }
    }
    loadContent()
  }, [searchQuery, selectedCategory])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const content = await getAggregatedContent()
      setVideos(content)
    } catch (error) {
      console.error("Error refreshing content:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleShare = async (video: AggregatedVideo) => {
    try {
      await Share.share({
        message: `Check out this amazing video: ${video.title}`,
        url: video.videoUrl,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const renderUserStats = () => (
    <View style={styles.userStatsContainer}>
      <LinearGradient
        colors={["#FF6B6B", "#FF8E8E"]}
        style={styles.userStatsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.userInfo}>
          <Image source={USER.avatar} style={styles.userAvatar} contentFit="cover" />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Hello, {USER.name}! 👋</Text>
            <Text style={styles.userSubtitle}>Keep up the great work!</Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <FontAwesome5 name="fire" size={20} color="#FFF" />
            <Text style={styles.statValue}>{USER.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome5 name="clock" size={20} color="#FFF" />
            <Text style={styles.statValue}>{USER.totalWatchTime}</Text>
            <Text style={styles.statLabel}>Watch Time</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome5 name="certificate" size={20} color="#FFF" />
            <Text style={styles.statValue}>{USER.completedCourses}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome5 name="trophy" size={20} color="#FFF" />
            <Text style={styles.statValue}>{USER.achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInput}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchTextInput}
          placeholder="Search your library..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.filterButton}>
        <Ionicons name="options-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {/* <Image
        source={require("../../assets/images/empty-library.png")}
        style={styles.emptyStateImage}
        contentFit="contain"
      /> */}
      <Text style={styles.emptyStateTitle}>Your library is empty</Text>
      <Text style={styles.emptyStateText}>
        Start exploring courses and save them to your library to continue learning
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push("/explore")}
      >
        <Text style={styles.exploreButtonText}>Explore Courses</Text>
      </TouchableOpacity>
    </View>
  )

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonItem}>
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

  const renderSavedCourse = ({ item }) => (
    <TouchableOpacity style={styles.courseItem} onPress={() => router.push(`/video/${item.id}`)}>
      <Image source={item.thumbnail} style={styles.thumbnail} contentFit="cover" />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}% completed</Text>
        </View>
        <Text style={styles.lastWatched}>Last watched {item.lastWatched}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => router.push(`/video/${item.id}`)}>
      <Image source={item.thumbnail} style={styles.historyThumbnail} contentFit="cover" />
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.historyMeta}>Watched {item.watchedOn}</Text>
        <View style={styles.historyProgress}>
          <Text style={styles.historyDuration}>
            {item.completed ? "Completed" : `Watched ${item.watchedDuration} of ${item.duration}`}
          </Text>
          {!item.completed && (
            <TouchableOpacity style={styles.resumeButton}>
              <Text style={styles.resumeText}>Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        horizontal
        data={CATEGORIES}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              selectedCategory === item.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <FontAwesome5 name={item.icon} size={20} color={selectedCategory === item.id ? "#FFF" : "#666"} />
            <Text style={[styles.categoryName, selectedCategory === item.id && styles.selectedCategoryText]}>
              {item.name}
            </Text>
            <Text style={[styles.categoryCount, selectedCategory === item.id && styles.selectedCategoryText]}>
              {item.count}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  )

  const renderContinueLearning = () => (
    <View style={styles.continueLearningContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Continue Learning</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllButton}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={CONTINUE_LEARNING}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.continueLearningCard}
            onPress={() => router.push(`/video/${item.id}`)}
          >
            <Image source={item.thumbnail} style={styles.continueLearningThumbnail} contentFit="cover" />
            <View style={styles.continueLearningInfo}>
              <Text style={styles.continueLearningTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.continueLearningInstructor}>{item.instructor}</Text>
              <View style={styles.continueLearningProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progress}% completed</Text>
              </View>
              <Text style={styles.nextLesson}>Next: {item.nextLesson}</Text>
              <Text style={styles.lastWatched}>Last watched {item.lastWatched}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.continueLearningList}
      />
    </View>
  )

  const renderRecommendations = () => (
    <View style={styles.recommendationsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllButton}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={RECOMMENDATIONS}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recommendationCard}
            onPress={() => router.push(`/video/${item.id}`)}
          >
            <Image source={item.thumbnail} style={styles.recommendationThumbnail} contentFit="cover" />
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.recommendationInstructor}>{item.instructor}</Text>
              <View style={styles.recommendationMeta}>
                <View style={styles.ratingContainer}>
                  <FontAwesome5 name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                <Text style={styles.studentsText}>{item.students} students</Text>
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recommendationsList}
      />
    </View>
  )

  const renderLearningGoal = () => (
    <View style={styles.learningGoalContainer}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.learningGoalGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.learningGoalHeader}>
          <Text style={styles.learningGoalTitle}>Daily Learning Goal</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.learningGoalProgress}>
          <View style={styles.learningGoalBar}>
            <View
              style={[
                styles.learningGoalFill,
                { width: `${(USER.completedToday / USER.dailyGoal) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.learningGoalText}>
            {USER.completedToday} of {USER.dailyGoal} minutes
          </Text>
        </View>
        <Text style={styles.learningGoalSubtext}>
          {USER.dailyGoal - USER.completedToday} minutes left today
        </Text>
      </LinearGradient>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {renderUserStats()}
      {renderLearningGoal()}
      {renderSearchBar()}
      {renderCategories()}
      {renderContinueLearning()}
      {renderRecommendations()}
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "saved" && styles.activeTab]}
          onPress={() => setActiveTab("saved")}
        >
          <FontAwesome5
            name="bookmark"
            size={16}
            color={activeTab === "saved" ? "#FF6B6B" : "#666"}
            solid={activeTab === "saved"}
          />
          <Text style={[styles.tabText, activeTab === "saved" && styles.activeTabText]}>Saved Courses</Text>
        </TouchableOpacity>

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
      ) : activeTab === "saved" ? (
        <FlatList
          data={SAVED_COURSES}
          renderItem={renderSavedCourse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        <FlatList
          data={WATCH_HISTORY}
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
