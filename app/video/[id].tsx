"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"

import { ModernVideoPlayer } from "../../components/ModernVideoPlayer"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { getAggregatedContent, type AggregatedVideo } from "../../services/content-aggregator"
import { addToWatchHistory } from "../../services/content-service"

// Mock comments data
const COMMENTS = [
  {
    id: "1",
    author: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    time: "2 days ago",
    text: "This was incredibly helpful! I've been struggling with this concept and this cleared up a lot of my confusion.",
    likes: 45,
    replies: 3,
  },
  {
    id: "2",
    author: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    time: "1 week ago",
    text: "Great explanation! Could you make a follow-up video on more advanced topics in this area?",
    likes: 23,
    replies: 1,
  },
  {
    id: "3",
    author: "Jessica Williams",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    time: "3 weeks ago",
    text: "I've watched many tutorials on this subject, but yours is by far the clearest and most comprehensive. Thank you!",
    likes: 87,
    replies: 5,
  },
]

export default function VideoScreen() {
  const { id, source, videoUrl, thumbnailUrl } = useLocalSearchParams()
  const router = useRouter()
  const [video, setVideo] = useState<AggregatedVideo | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<AggregatedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [likeStatus, setLikeStatus] = useState<"none" | "liked" | "disliked">("none")
  const [progress, setProgress] = useState(0)

  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    loadVideoData()
  }, [id])

  const loadVideoData = async () => {
    setIsLoading(true)
    try {
      // In a real app, you would fetch the specific video by ID
      // For now, we'll get a list and find the one with matching ID
      const allVideos = await getAggregatedContent()
      const videoData = allVideos.find((v) => v.id === id)

      if (videoData) {
        setVideo(videoData)

        // Record in watch history
        addToWatchHistory(videoData, "0:00")

        // Get related videos
        const related = allVideos.filter((v) => v.id !== id).slice(0, 5)
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
  }

  const handleVideoComplete = () => {
    if (video) {
      addToWatchHistory(video, video.duration)
    }
  }

  const handleCommentPress = () => {
    setShowComments(!showComments)
    if (!showComments) {
      // Scroll to comments section
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 500, animated: true })
      }, 100)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <ModernVideoPlayer
            videoUrl={(videoUrl as string) || "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4"}
            thumbnailUrl={(thumbnailUrl as string) || "https://i.ytimg.com/vi/0-S5a0eXPoc/maxresdefault.jpg"}
            title={video?.title || "Loading..."}
            onProgress={handleVideoProgress}
            onComplete={handleVideoComplete}
          />
        </View>

        <View style={styles.contentContainer}>
          {/* Video Title and Meta */}
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={styles.videoTitle}>{video?.title || "Loading..."}</Text>
            <Text style={styles.videoMeta}>
              {video?.viewCount || "0"} views • {video?.publishedAt || "Recently"}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <FontAwesome5
                  name="thumbs-up"
                  size={20}
                  color={likeStatus === "liked" ? "#FF6B6B" : "#333"}
                  solid={likeStatus === "liked"}
                />
                <Text style={[styles.actionText, likeStatus === "liked" && styles.activeActionText]}>
                  {video?.likes || "0"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleDislike}>
                <FontAwesome5
                  name="thumbs-down"
                  size={20}
                  color={likeStatus === "disliked" ? "#FF6B6B" : "#333"}
                  solid={likeStatus === "disliked"}
                />
                <Text style={[styles.actionText, likeStatus === "disliked" && styles.activeActionText]}>Dislike</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="share" size={20} color="#333" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="download" size={20} color="#333" />
                <Text style={styles.actionText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="bookmark" size={20} color="#333" />
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Channel Info */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.channelContainer}>
            <Image
              source={video?.channelAvatar || "https://randomuser.me/api/portraits/men/32.jpg"}
              style={styles.channelAvatar}
              contentFit="cover"
            />
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>{video?.channelTitle || "Channel"}</Text>
              <Text style={styles.subscriberCount}>{video?.subscribers || "0"} subscribers</Text>
            </View>
            <TouchableOpacity
              style={[styles.subscribeButton, isSubscribed && styles.subscribedButton]}
              onPress={handleSubscribe}
            >
              <Text style={[styles.subscribeText, isSubscribed && styles.subscribedText]}>
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Text>
              {isSubscribed && <FontAwesome5 name="check" size={12} color="#333" style={styles.subscribedIcon} />}
            </TouchableOpacity>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.descriptionContainer}>
            <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
              <Text style={styles.description} numberOfLines={isDescriptionExpanded ? undefined : 3}>
                {video?.description || "No description available."}
              </Text>
              <Text style={styles.showMoreText}>{isDescriptionExpanded ? "Show less" : "Show more"}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Comments Section */}
          <Animated.View entering={FadeInUp.duration(400).delay(300)}>
            <TouchableOpacity style={styles.commentsHeader} onPress={handleCommentPress}>
              <Text style={styles.commentsTitle}>Comments (124)</Text>
              <FontAwesome5 name={showComments ? "chevron-up" : "chevron-down"} size={16} color="#666" />
            </TouchableOpacity>

            {showComments && (
              <View style={styles.commentsContainer}>
                {COMMENTS.map((comment) => (
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
                          <FontAwesome5 name="thumbs-up" size={14} color="#666" />
                          <Text style={styles.commentActionText}>{comment.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.commentAction}>
                          <FontAwesome5 name="thumbs-down" size={14} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.commentAction}>
                          <Text style={styles.commentActionText}>Reply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Add Comment Input */}
                <View style={styles.addCommentContainer}>
                  <Image
                    source="https://randomuser.me/api/portraits/men/32.jpg"
                    style={styles.commentAvatar}
                    contentFit="cover"
                  />
                  <TouchableOpacity style={styles.commentInput}>
                    <Text style={styles.commentInputText}>Add a comment...</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Related Videos */}
          <Animated.View entering={FadeInUp.duration(400).delay(400)}>
            <Text style={styles.relatedTitle}>Related Videos</Text>
            {relatedVideos.map((relatedVideo) => (
              <ModernVideoCard
                key={`${relatedVideo.source}-${relatedVideo.id}`}
                video={relatedVideo}
                onPress={() => router.push(`/video/${relatedVideo.id}`)}
                style={styles.relatedVideoCard}
              />
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Progress Bar */}
      {progress > 0 && progress < 1 && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      )}

      {/* Floating Back Button */}
      <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
        <BlurView intensity={80} style={styles.blurButton}>
          <FontAwesome5 name="arrow-left" size={16} color="#FFF" />
        </BlurView>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  contentContainer: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  videoMeta: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
  },
  activeActionText: {
    color: "#FF6B6B",
  },
  channelContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  channelInfo: {
    marginLeft: 12,
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subscriberCount: {
    fontSize: 14,
    color: "#666",
  },
  subscribeButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  subscribedButton: {
    backgroundColor: "#F0F0F0",
  },
  subscribeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  subscribedText: {
    color: "#333",
  },
  subscribedIcon: {
    marginLeft: 4,
  },
  descriptionContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  showMoreText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  commentsContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
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
    color: "#333",
  },
  commentTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 8,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  commentInput: {
    flex: 1,
    marginLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    paddingVertical: 8,
  },
  commentInputText: {
    color: "#999",
    fontSize: 14,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 16,
  },
  relatedVideoCard: {
    marginBottom: 12,
  },
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    zIndex: 100,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF6B6B",
  },
  floatingBackButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 16,
    zIndex: 100,
  },
  blurButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
})
