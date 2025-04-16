import React, { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from "react-native"
import { WebView } from 'react-native-webview'
import { FontAwesome5 } from "@expo/vector-icons"
import * as ScreenOrientation from "expo-screen-orientation"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  title?: string
  channelName?: string
  style?: any
  autoPlay?: boolean
  showControls?: boolean
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  thumbnailUrl,
  title = "Video Title",
  channelName = "",
  style, 
  autoPlay = false,
  showControls = true,
  onProgress,
  onComplete
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { width, height } = Dimensions.get('window')

  // Check if the URL is a YouTube embed URL
  const isYouTubeEmbed = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be')
  console.log('Video URL analysis:', {
    originalUrl: videoUrl,
    isYouTubeEmbed,
    urlType: typeof videoUrl,
    isEmpty: videoUrl === "",
    isNullOrUndefined: videoUrl == null
  })

  // Ensure the URL is in the correct embedded format for YouTube
  const getEmbeddedUrl = (url: string | undefined): string => {
    if (!url || url.trim() === "") return '';
    
    try {
      // Extract video ID from various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`
      }
      
      return url;
    } catch (e) {
      console.error('Error processing video URL:', e)
      return url;
    }
  };

  const embeddedUrl = getEmbeddedUrl(videoUrl)
  console.log('Final embedded URL:', embeddedUrl)

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    }
    setIsFullscreen(!isFullscreen)
  }

  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false
    const trimmedUrl = url.trim()
    return trimmedUrl !== "" && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer, style]}>
      <StatusBar hidden={isFullscreen} />
      <View style={styles.videoWrapper}>
        {isValidUrl(videoUrl) ? (
          <WebView
            source={{ uri: embeddedUrl }}
            style={styles.video}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setError(`WebView error: ${nativeEvent.description}`);
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <BlurView intensity={70} style={styles.errorBlur}>
              <FontAwesome5 name="exclamation-triangle" size={30} color="#FF6B6B" style={styles.errorIcon} />
              <Text style={styles.errorText}>
                {!videoUrl ? "No video source available" : 
                 videoUrl.trim() === "" ? "Video URL is empty" : 
                 "Invalid video URL"}
              </Text>
            </BlurView>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <BlurView intensity={70} style={styles.errorBlur}>
              <FontAwesome5 name="exclamation-triangle" size={30} color="#FF6B6B" style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => setError(null)}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 0,
  },
  videoWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  errorBlur: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  errorIcon: {
    marginBottom: 10,
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
