"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity, ViewStyle, TextStyle, Platform, StatusBar } from "react-native"
import YoutubeIframe from "react-native-youtube-iframe"
import { Ionicons } from "@expo/vector-icons"
import * as ScreenOrientation from 'expo-screen-orientation'
import { useRouter } from "expo-router"

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(true)
  const playerRef = useRef(null)
  const { width, height } = Dimensions.get('window')
  const router = useRouter()

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

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const isPortraitMode = window.width < window.height;
      setIsPortrait(isPortraitMode);
      
      if (isFullscreen && !isPortraitMode) {
        // In landscape and fullscreen, lock to landscape
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } else if (isFullscreen && isPortraitMode) {
        // In portrait and fullscreen, unlock to allow rotation
        ScreenOrientation.unlockAsync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isFullscreen]);

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (isFullscreen) {
      // Exit fullscreen
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      setIsFullscreen(false);
    } else {
      // Enter fullscreen
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
    }
  };

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
    <View style={[
      styles.container, 
      style,
      isFullscreen && styles.fullscreenContainer
    ]}>
      {title && !isFullscreen && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          {channelName && <Text style={styles.channelText}>{channelName}</Text>}
        </View>
      )}

      <View style={[
        styles.playerContainer,
        isFullscreen && styles.fullscreenPlayer
      ]}>
        <YoutubeIframe
          ref={playerRef}
          height={isFullscreen ? height : 220}
          width={isFullscreen ? width : +(Dimensions.get("window").width)}
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
            controls: false
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

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color="#FFF"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.fullscreenButton}
          onPress={toggleFullscreen}
        >
          <Ionicons 
            name={isFullscreen ? "contract" : "expand"} 
            size={24} 
            color="#FFF"
          />
        </TouchableOpacity>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    borderRadius: 0,
  } as ViewStyle,
  playerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  } as ViewStyle,
  fullscreenPlayer: {
    aspectRatio: undefined,
    height: '100%',
    width: '100%',
  } as ViewStyle,
  titleContainer: {
    padding: 16,
    backgroundColor: "#111",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  } as ViewStyle,
  titleText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  } as TextStyle,
  channelText: {
    color: "#AAA",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "500",
  } as TextStyle,
  loadingContainer: {
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  } as ViewStyle,
  loadingText: {
    color: "#FFF",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  } as TextStyle,
  errorContainer: {
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 24,
  } as ViewStyle,
  errorText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
  } as TextStyle,
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#00E0FF",
    borderRadius: 12,
    shadowColor: "#00E0FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,
  retryText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  } as TextStyle,
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(4px)",
  } as ViewStyle,
  fullscreenButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  } as ViewStyle,
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  } as ViewStyle,
})

export default VideoPlayer
