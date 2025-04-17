"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity } from "react-native"
import YoutubeIframe from "react-native-youtube-iframe"
import { Ionicons } from "@expo/vector-icons"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  channelName?: string
  style?: any
  autoPlay?: boolean
  showControlsInitially?: boolean
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  channelName,
  style,
  autoPlay = false,
  showControlsInitially = true,
  onProgress,
  onComplete,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef(null)

  // Extract YouTube video ID from URL
  useEffect(() => {
    if (videoUrl) {
      try {
        console.log("Processing video URL:", videoUrl)
        let id = ""

        if (videoUrl.includes("youtube.com/embed/")) {
          id = videoUrl.split("youtube.com/embed/")[1].split("?")[0]
        } else if (videoUrl.includes("youtube.com/watch?v=")) {
          id = videoUrl.split("v=")[1].split("&")[0]
        } else if (videoUrl.includes("youtu.be/")) {
          id = videoUrl.split("youtu.be/")[1].split("?")[0]
        } else {
          // If the input is just the video ID
          const idRegex = /^[a-zA-Z0-9_-]{11}$/
          if (idRegex.test(videoUrl)) {
            id = videoUrl
          }
        }

        if (id) {
          console.log("Extracted video ID:", id)
          setVideoId(id)
        } else {
          setError("Could not extract video ID from URL")
        }
      } catch (e) {
        console.error("Error extracting video ID:", e)
        setError("Invalid video URL format")
      }
    }
  }, [videoUrl])

  // Handle progress updates
  const onStateChange = (state: string) => {
    console.log("Player state changed:", state)
    if (state === "ended") {
      setPlaying(false)
      onComplete?.()
    } else if (state === "playing") {
      setIsLoading(false)
    } else if (state === "paused") {
      setPlaying(false)
    }
  }

  // Track video progress
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null

    if (playing && playerRef.current && onProgress) {
      progressInterval = setInterval(async () => {
        try {
          // @ts-ignore - getCurrentTime exists on the ref but TypeScript doesn't know about it
          const currentTime = await playerRef.current?.getCurrentTime()
          if (currentTime) {
            setCurrentTime(currentTime)
            onProgress(currentTime)
          }
        } catch (e) {
          console.error("Error getting current time:", e)
        }
      }, 1000)
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [playing, onProgress])

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null)
              setIsLoading(true)
              // Re-attempt to process the URL
              if (videoUrl) {
                try {
                  let id = ""
                  if (videoUrl.includes("youtube.com/embed/")) {
                    id = videoUrl.split("youtube.com/embed/")[1].split("?")[0]
                  } else if (videoUrl.includes("youtube.com/watch?v=")) {
                    id = videoUrl.split("v=")[1].split("&")[0]
                  } else if (videoUrl.includes("youtu.be/")) {
                    id = videoUrl.split("youtu.be/")[1].split("?")[0]
                  }

                  if (id) {
                    setVideoId(id)
                  } else {
                    setError("Could not extract video ID from URL")
                  }
                } catch (e) {
                  setError("Invalid video URL format")
                }
              }
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!videoId) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E0FF" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {channelName && <Text style={styles.channelText}>{channelName}</Text>}
        </View>
      )}

      <View style={styles.playerContainer}>
        <YoutubeIframe
          ref={playerRef}
          height={220}
          width={Dimensions.get("window").width - (style?.padding || 0) * 2}
          videoId={videoId}
          play={playing}
          onChangeState={onStateChange}
          onReady={() => {
            console.log("Player ready")
            setIsLoading(false)
            if (autoPlay) {
              setPlaying(true)
            }
          }}
          onError={(error) => {
            console.error("Player error:", error)
            setError(`Failed to load video: ${error}`)
          }}
          initialPlayerParams={{
            modestbranding: true,
            rel: false,
            controls: showControlsInitially
          }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: !autoPlay,
            javaScriptEnabled: true,
            domStorageEnabled: true,
            startInLoadingState: true,
            renderLoading: () => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#00E0FF" />
              </View>
            ),
          }}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00E0FF" />
          </View>
        )}
      </View>

      {/* Custom controls could be added here if needed */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  },
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  titleContainer: {
    padding: 10,
    backgroundColor: "#111",
  },
  titleText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  channelText: {
    color: "#AAA",
    fontSize: 14,
    marginTop: 4,
  },
  loadingContainer: {
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
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#00E0FF",
    borderRadius: 8,
  },
  retryText: {
    color: "#000",
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
})

export default VideoPlayer
