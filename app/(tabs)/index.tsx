"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { StyleSheet, FlatList, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

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
  const [videos, setVideos] = useState<AggregatedVideo[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("For You")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const flatListRef = useRef<FlatList>(null)

  const loadContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let content: AggregatedVideo[] = []
      if (searchQuery) {
        content = await getAggregatedContent(searchQuery)
      } else if (activeTab === "Trending") {
        content = await getTrendingContent()
      } else if (activeTab === "Recommended") {
        const preferences = profile?.preferences as { categories?: string[]; tags?: string[] } | null
        content = await getRecommendedContent({
          categories: preferences?.categories || [],
          tags: preferences?.tags || [],
        })
      } else {
        content = await getAggregatedContent(undefined, selectedCategory)
      }

      // If no content is returned, use mock data
      if (content.length === 0) {
        setVideos([])
        return
      }

      setVideos(content)
    } catch (err) {
      console.error("Error loading content:", err)
      setError("Unable to load content. Please try again later.")
      // Set empty videos array to trigger the empty state
      setVideos([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [searchQuery, selectedCategory, activeTab, profile?.preferences])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    loadContent()
  }, [loadContent])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
  }, [])

  const handleVideoPress = useCallback((video: AggregatedVideo) => {
    router.push({
      pathname: "/video/[id]",
      params: { 
        id: video.id,
        source: video.source,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnail,
        title: video.title,
        channelName: video.channelName,
        channelId: video.channelId,
        description: video.description,
        duration: video.duration,
        views: video.views,
        publishedAt: video.publishedAt,
        isFree: video.isFree ? "true" : "false",
        instructor: video.instructor,
        institution: video.institution,
        rating: video.rating,
        price: video.price
      },
    })
  }, [router])

  const getActiveVideos = () => {
    return videos
  }

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.duration(500).delay(100)}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="graduation-cap" size={24} color="#4c669f" />
          <Text style={styles.logoText}>Mentora</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/notifications" as any)}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/profile" as any)}
          >
            {userLoading ? (
              <ActivityIndicator size="small" color="#4c669f" />
            ) : profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={24} color="#666" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search for courses..."
        />
      </View>

      <CategoryPills
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <View style={styles.tabsContainer}>
        {["For You", "Trending", "Recommended"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => handleTabChange(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  )

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4c669f" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <FontAwesome5 name="exclamation-circle" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadContent}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (videos.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <FontAwesome5 name="search" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No content found</Text>
          <Text style={styles.emptySubtext}>Try changing your search or category</Text>
        </View>
      )
    }

    return (
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={({ item, index }) => (
          <Animated.View 
            entering={FadeInRight.duration(400).delay(index * 100)}
            style={styles.videoCardContainer}
          >
            <ModernVideoCard
              video={item}
              onPress={() => handleVideoPress(item)}
            />
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.videoList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={["#4c669f"]}
            tintColor="#4c669f"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4c669f",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarPlaceholder: {
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#4c669f",
    fontWeight: "600",
  },
  videoList: {
    padding: 16,
  },
  videoCardContainer: {
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff4444",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#4c669f",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
})
