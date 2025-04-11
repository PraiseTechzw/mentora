"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, FlatList, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated"

import { SearchBar } from "../../components/SearchBar"
import { CategoryPills } from "../../components/CategoryPills"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { useUser } from "../../contexts/UserContext"
import {
  getAggregatedContent,
  getTrendingContent,
  getRecommendedContent,
  type AggregatedVideo,
} from "../../services/content-aggregator"

const CATEGORIES = ["All", "Programming", "Mathematics", "Science", "History", "Languages", "Arts", "Business"]

export default function HomeScreen() {
  const router = useRouter()
  const { user, profile, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [videos, setVideos] = useState<AggregatedVideo[]>([])
  const [trendingVideos, setTrendingVideos] = useState<AggregatedVideo[]>([])
  const [recommendedVideos, setRecommendedVideos] = useState<AggregatedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<"foryou" | "trending" | "recommended">("foryou")

  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadContent()
  }, [selectedCategory])

  const loadContent = async () => {
    setIsLoading(true)
    try {
      // Load content for all tabs
      const forYouContent = await getAggregatedContent(
        searchQuery,
        selectedCategory !== "All" ? selectedCategory : undefined,
      )
      const trendingContent = await getTrendingContent()
      const recommendedContent = await getRecommendedContent({
        categories: ["Programming", "Science"], // Mock user preferences
        tags: ["beginner", "tutorial"],
      })

      setVideos(forYouContent)
      setTrendingVideos(trendingContent)
      setRecommendedVideos(recommendedContent)
    } catch (error) {
      console.error("Error loading content:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadContent()
  }

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true)
      try {
        const searchResults = await getAggregatedContent(searchQuery)
        setVideos(searchResults)
        setActiveTab("foryou")
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setSearchQuery("")
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  const handleVideoPress = (video: AggregatedVideo) => {
    router.push({
      pathname: `/video/${video.id}`,
      params: {
        source: video.source,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnail,
      },
    })
  }

  const getActiveVideos = () => {
    switch (activeTab) {
      case "trending":
        return trendingVideos
      case "recommended":
        return recommendedVideos
      default:
        return videos
    }
  }

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500).delay(100)}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="graduation-cap" size={24} color="#FF6B6B" />
          <Text style={styles.logoText}>Mentora</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/instructor/upload")}>
            <FontAwesome5 name="plus" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/profile")}>
            {userLoading ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : profile?.avatar_url ? (
              <Image source={profile.avatar_url} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome5 name="user" size={18} color="#666" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} />

      <CategoryPills
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "foryou" && styles.activeTab]}
          onPress={() => setActiveTab("foryou")}
        >
          <Text style={[styles.tabText, activeTab === "foryou" && styles.activeTabText]}>For You</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "trending" && styles.activeTab]}
          onPress={() => setActiveTab("trending")}
        >
          <Text style={[styles.tabText, activeTab === "trending" && styles.activeTabText]}>Trending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "recommended" && styles.activeTab]}
          onPress={() => setActiveTab("recommended")}
        >
          <Text style={[styles.tabText, activeTab === "recommended" && styles.activeTabText]}>Recommended</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF6B6B" />
      ) : (
        <>
          <FontAwesome5 name="search" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No videos found</Text>
          <Text style={styles.emptySubtext}>Try a different search or category</Text>
        </>
      )}
    </View>
  )

  const renderVideoItem = ({ item, index }: { item: AggregatedVideo; index: number }) => (
    <Animated.View entering={FadeInRight.duration(400).delay(index * 100)}>
      <ModernVideoCard video={item} onPress={() => handleVideoPress(item)} />
    </Animated.View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={getActiveVideos()}
        keyExtractor={(item) => `${item.source}-${item.id}`}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.videoList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#FF6B6B"]} />}
      />
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  videoList: {
    padding: 12,
    paddingTop: 0,
  },
  tabsContainer: {
    flexDirection: "row",
    marginVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: "#EAEAEA",
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#FF6B6B",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
})
