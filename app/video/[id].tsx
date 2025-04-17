"use client"

import { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import Animated, {
  SlideInUp,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"

import { ModernVideoCard } from "../../components/ModernVideoCard"
import { addToWatchHistory } from "../../services/content-service"
import type { AggregatedVideo } from "../../types/videoag"
import { getAggregatedContent } from "../../services/content-aggregator"
import { VideoPlayer } from "../../components/ModernVideoPlayer"

export default function VideoScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const [video, setVideo] = useState<AggregatedVideo | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<AggregatedVideo[]>([])
  const [comments, setComments] = useState([
    {
      id: "1",
      author: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "This video is absolutely amazing! I learned so much from it.",
      time: "2 days ago",
      likes: 24,
    },
    {
      id: "2",
      author: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "Great explanation! Could you make a follow-up video on this topic?",
      time: "1 week ago",
      likes: 56,
    },
    {
      id: "3",
      author: "Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      text: "I've been looking for content like this for ages. Thanks for sharing!",
      time: "3 days ago",
      likes: 18,
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [likeStatus, setLikeStatus] = useState<"none" | "liked" | "disliked">("none")
  const [progress, setProgress] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [activeTab, setActiveTab] = useState<"related" | "comments">("related")

  // Animated values
  const headerOpacity = useSharedValue(0)
  const contentTranslateY = useSharedValue(0)
  const tabIndicatorPosition = useSharedValue(0)

  const scrollViewRef = useRef<ScrollView>(null)
  const scrollY = useSharedValue(0)

  // Get window dimensions
  const { width } = Dimensions.get('window')

  useEffect(() => {
    loadVideoData()
  }, [params.id])

  const loadVideoData = async () => {
    setIsLoading(true)
    try {
      const allVideos = await getAggregatedContent()
      const videoData = allVideos.find((v) => v.id === params.id)

      if (videoData) {
        setVideo(videoData)
        addToWatchHistory(
          {
            id: videoData.id,
            title: videoData.title,
            channelTitle: videoData.channelName,
            viewCount: videoData.views,
            duration: videoData.duration,
            thumbnail: videoData.thumbnail,
            description: videoData.description,
            publishedAt: videoData.publishedAt,
            channelId: videoData.channelId,
          },
          "0:00",
        )

        const related = allVideos.filter((v) => v.id !== params.id).slice(0, 5)
        setRelatedVideos(related)
      }
    } catch (error) {
      console.error("Error loading video data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (likeStatus === "liked") {
      setLikeStatus("none")
    } else {
      setLikeStatus("liked")
    }
  }

  const handleDislike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (likeStatus === "disliked") {
      setLikeStatus("none")
    } else {
      setLikeStatus("disliked")
    }
  }

  const handleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsSubscribed(!isSubscribed)
  }

  const handleVideoProgress = (progress: number) => {
    setProgress(progress)
    if (video) {
      const currentTime = Math.floor(progress * Number.parseInt(video.duration))
      addToWatchHistory(
        {
          id: video.id,
          title: video.title,
          channelTitle: video.channelName,
          viewCount: video.views,
          duration: video.duration,
          thumbnail: video.thumbnail,
          description: video.description,
          publishedAt: video.publishedAt,
          channelId: video.channelId,
        },
        `${currentTime}`,
      )
    }
  }

  const handleVideoComplete = () => {
    if (video) {
      addToWatchHistory(
        {
          id: video.id,
          title: video.title,
          channelTitle: video.channelName,
          viewCount: video.views,
          duration: video.duration,
          thumbnail: video.thumbnail,
          description: video.description,
          publishedAt: video.publishedAt,
          channelId: video.channelId,
        },
        video.duration,
      )
      setProgress(1)
    }
  }

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y
    scrollY.value = offsetY

    // Update header opacity based on scroll position
    if (offsetY > 50) {
      headerOpacity.value = withTiming(1, { duration: 200 })
    } else {
      headerOpacity.value = withTiming(0, { duration: 200 })
    }

    // Update content translation for parallax effect
    contentTranslateY.value = -offsetY * 0.2

    setIsScrolling(offsetY > 100)
  }

  const handleTabChange = (tab: "related" | "comments") => {
    setActiveTab(tab)
    tabIndicatorPosition.value = withTiming(tab === "related" ? 0 : 1, { duration: 300 })

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [-20, 0], Extrapolate.CLAMP) }],
    }
  })

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: contentTranslateY.value }],
    }
  })

  const tabIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            tabIndicatorPosition.value,
            [0, 1],
            [0, width / 2],
            Extrapolate.CLAMP,
          ),
        },
      ],
    }
  })

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, headerAnimatedStyle]}>
        <LinearGradient colors={["rgba(0,30,60,0.95)", "rgba(0,30,60,0.8)"]} style={styles.headerGradient}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {video?.title || "Loading..."}
          </Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00E0FF" />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          ) : video?.videoUrl ? (
            <VideoPlayer
              videoUrl={video.videoUrl}
              thumbnailUrl={video.thumbnail}
              title={video.title}
              channelName={video.channelName}
              autoPlay={true}
              showControlsInitially={true}
              onProgress={handleVideoProgress}
              onComplete={handleVideoComplete}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={36} color="#00E0FF" />
              <Text style={styles.errorText}>Video not available</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          {/* Video Info */}
          <View style={styles.videoInfoContainer}>
            <Text style={styles.videoTitle}>{video?.title || "Loading..."}</Text>
            <View style={styles.videoMetaContainer}>
              <Text style={styles.videoMeta}>{video?.views || "0"} views</Text>
              <Text style={styles.videoMetaDot}>•</Text>
              <Text style={styles.videoMeta}>{video?.publishedAt || "Recently"}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, likeStatus === "liked" && styles.activeActionButton]}
              onPress={handleLike}
            >
              <Ionicons name="thumbs-up" size={22} color={likeStatus === "liked" ? "#00E0FF" : "#FFF"} />
              <Text style={[styles.actionText, likeStatus === "liked" && styles.activeActionText]}>
                {video?.rating || video?.views || "0"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, likeStatus === "disliked" && styles.activeActionButton]}
              onPress={handleDislike}
            >
              <Ionicons name="thumbs-down" size={22} color={likeStatus === "disliked" ? "#00E0FF" : "#FFF"} />
              <Text style={[styles.actionText, likeStatus === "disliked" && styles.activeActionText]}>Dislike</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social" size={22} color="#FFF" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download" size={22} color="#FFF" />
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>
          </View>

          {/* Channel Info */}
          <View style={styles.channelContainer}>
            <Image
              source={video?.thumbnail || "https://randomuser.me/api/portraits/men/32.jpg"}
              style={styles.channelAvatar}
              contentFit="cover"
            />
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{video?.channelName || "Channel"}</Text>
              <Text style={styles.subscriberCount}>{video?.views || "0"} subscribers</Text>
            </View>
            <TouchableOpacity
              style={[styles.subscribeButton, isSubscribed && styles.subscribedButton]}
              onPress={handleSubscribe}
            >
              <Text style={[styles.subscribeText, isSubscribed && styles.subscribedText]}>
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Pressable
            style={styles.descriptionContainer}
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <BlurView intensity={20} style={styles.descriptionBlur}>
              <Text style={styles.description} numberOfLines={isDescriptionExpanded ? undefined : 3}>
                {video?.description || "No description available."}
              </Text>
              <Text style={styles.showMoreText}>{isDescriptionExpanded ? "Show less" : "Show more"}</Text>
            </BlurView>
          </Pressable>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <View style={styles.tabsHeader}>
              <Pressable
                style={[styles.tabButton, activeTab === "related" && styles.activeTabButton]}
                onPress={() => handleTabChange("related")}
              >
                <Text style={[styles.tabText, activeTab === "related" && styles.activeTabText]}>Related</Text>
              </Pressable>
              <Pressable
                style={[styles.tabButton, activeTab === "comments" && styles.activeTabButton]}
                onPress={() => handleTabChange("comments")}
              >
                <Text style={[styles.tabText, activeTab === "comments" && styles.activeTabText]}>Comments</Text>
              </Pressable>
              <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === "related" ? (
                <View style={styles.relatedContainer}>
                  {relatedVideos.map((relatedVideo) => (
                    <ModernVideoCard
                      key={`${relatedVideo.source}-${relatedVideo.id}`}
                      video={relatedVideo}
                      onPress={() => router.push(`/video/${relatedVideo.id}`)}
                      style={styles.relatedVideoCard}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.commentsContainer}>
                  <View style={styles.commentInputContainer}>
                    <Image
                      source="https://randomuser.me/api/portraits/men/32.jpg"
                      style={styles.commentAvatar}
                      contentFit="cover"
                    />
                    <View style={styles.commentInput}>
                      <Text style={styles.commentInputPlaceholder}>Add a comment...</Text>
                    </View>
                  </View>

                  <View style={styles.commentsList}>
                    {comments.map((comment) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <Image source={comment.avatar} style={styles.commentAvatar} contentFit="cover" />
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentAuthor}>{comment.author}</Text>
                            <Text style={styles.commentTime}>{comment.time}</Text>
                          </View>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <View style={styles.commentActions}>
                            <TouchableOpacity style={styles.commentAction}>
                              <Ionicons name="thumbs-up-outline" size={16} color="#AAA" />
                              <Text style={styles.commentActionText}>{comment.likes}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentAction}>
                              <Ionicons name="thumbs-down-outline" size={16} color="#AAA" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.commentAction}>
                              <Text style={styles.commentActionText}>Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      {isScrolling && (
        <Animated.View
          entering={SlideInUp.duration(300)}
          exiting={SlideOutDown.duration(300)}
          style={styles.floatingButton}
        >
          <TouchableOpacity
            style={styles.upButton}
            onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Ionicons name="chevron-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001E3C",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 224, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 224, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  contentContainer: {
    padding: 16,
  },
  videoInfoContainer: {
    marginBottom: 16,
    backgroundColor: "rgba(0, 224, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  videoMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoMeta: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  videoMetaDot: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginHorizontal: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "rgba(0, 224, 255, 0.1)",
    borderRadius: 16,
    padding: 8,
  },
  actionButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    flex: 1,
  },
  activeActionButton: {
    backgroundColor: "rgba(0, 224, 255, 0.2)",
  },
  actionText: {
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
  },
  activeActionText: {
    color: "#00E0FF",
  },
  channelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(0, 224, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#00E0FF",
  },
  channelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  channelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  subscriberCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  subscribeButton: {
    backgroundColor: "#00E0FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribedButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  subscribeText: {
    color: "#001E3C",
    fontSize: 14,
    fontWeight: "500",
  },
  subscribedText: {
    color: "#FFF",
  },
  descriptionContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  descriptionBlur: {
    padding: 16,
    borderRadius: 16,
  },
  description: {
    fontSize: 14,
    color: "#FFF",
    lineHeight: 20,
  },
  showMoreText: {
    color: "#00E0FF",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsHeader: {
    flexDirection: "row",
    marginBottom: 16,
    position: "relative",
    backgroundColor: "rgba(0, 224, 255, 0.05)",
    borderRadius: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeTabText: {
    color: "#FFF",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "50%",
    height: 3,
    backgroundColor: "#00E0FF",
    borderRadius: 1.5,
  },
  tabContent: {
    minHeight: 300,
  },
  relatedContainer: {
    marginBottom: 16,
  },
  relatedVideoCard: {
    marginBottom: 16,
    backgroundColor: "rgba(0, 224, 255, 0.05)",
    borderRadius: 16,
    overflow: "hidden",
  },
  commentsContainer: {
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(0, 224, 255, 0.1)",
    borderRadius: 24,
    padding: 8,
  },
  commentInput: {
    flex: 1,
    marginLeft: 12,
    height: 40,
    justifyContent: "center",
  },
  commentInputPlaceholder: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
  commentsList: {
    backgroundColor: "rgba(0, 224, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  commentTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    color: "#FFF",
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: "#AAA",
    marginLeft: 4,
  },
  loadingContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "#FFF",
    marginTop: 12,
    fontSize: 16,
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  upButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00E0FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
})
