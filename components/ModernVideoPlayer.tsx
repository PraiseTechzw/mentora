"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native"
import YoutubeIframe from "react-native-youtube-iframe"
import { Ionicons } from "@expo/vector-icons"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  channelName?: string
  style?: ViewStyle
  autoPlay?: boolean
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  channelName,
  style,
  autoPlay = false,
  onProgress,
  onComplete,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
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

  // Handle state changes
  const onStateChange = (state: string) => {
    console.log("Player state changed:", state)
    if (state === "ended") {
      onComplete?.()
    } else if (state === "playing") {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, style]}>
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
    )
  }

  if (!videoId) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#00E0FF" />
        <Text style={styles.loadingText}>Loading video...</Text>
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
          width={+(Dimensions.get("window").width)}
          videoId={videoId}
          play={autoPlay}
          onChangeState={onStateChange}
          onReady={() => {
            console.log("Player ready")
            setIsLoading(false)
          }}
          onError={(error) => {
            console.error("Player error:", error)
            setError(`Failed to load video: ${error}`)
          }}
          initialPlayerParams={{
            modestbranding: true,
            rel: false,
            controls: false,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 0
          }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
            javaScriptEnabled: true,
            domStorageEnabled: true,
            startInLoadingState: true,
            onShouldStartLoadWithRequest: () => true,
            onLoadEnd: () => {
              console.log("WebView loaded")
              setIsLoading(false)
            },
            androidLayerType: 'hardware',
            mixedContentMode: 'always',
            allowFileAccess: true,
            allowUniversalAccessFromFileURLs: true,
            style: {
              backgroundColor: 'transparent',
              opacity: 1
            } as ViewStyle
          }}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00E0FF" />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
  } as ViewStyle,
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  } as ViewStyle,
  titleContainer: {
    padding: 10,
    backgroundColor: "#111",
  } as ViewStyle,
  titleText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  } as TextStyle,
  channelText: {
    color: "#AAA",
    fontSize: 14,
    marginTop: 4,
  } as TextStyle,
  loadingContainer: {
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  } as ViewStyle,
  loadingText: {
    color: "#FFF",
    marginTop: 12,
    fontSize: 16,
  } as TextStyle,
  errorContainer: {
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  } as ViewStyle,
  errorText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  } as TextStyle,
  retryButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#00E0FF",
    borderRadius: 8,
  } as ViewStyle,
  retryText: {
    color: "#000",
    fontWeight: "bold",
  } as TextStyle,
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  } as ViewStyle,
})

export default VideoPlayer
