"use client"

import React, { useState, useRef, useEffect } from "react"
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity, ViewStyle, TextStyle, Platform, StatusBar } from "react-native"
import YoutubeIframe from "react-native-youtube-iframe"
import { Ionicons } from "@expo/vector-icons"
import * as ScreenOrientation from 'expo-screen-orientation'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FontAwesome5 } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'

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
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const playerRef = useRef(null)
  const insets = useSafeAreaInsets()
  const { width, height } = Dimensions.get('window')

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
      const isPortraitMode = window.width < window.height
      setIsPortrait(isPortraitMode)
      
      if (!isPortraitMode && !isFullscreen) {
        // If device is in landscape but not in fullscreen mode, update state
        setIsFullscreen(true)
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
      } else if (isPortraitMode && isFullscreen) {
        // If device is in portrait but in fullscreen mode, update state
        setIsFullscreen(false)
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
      }
    })

    return () => {
      subscription.remove()
      // Reset orientation to portrait when component unmounts
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    }
  }, [isFullscreen])

  // Handle state changes
  const onStateChange = (state: string) => {
    console.log("Player state changed:", state)
    if (state === "ended") {
      onComplete?.()
      setIsPlaying(false)
    } else if (state === "playing") {
      setIsLoading(false)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleFullscreenToggle = () => {
    if (isFullscreen) {
      setIsFullscreen(false)
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    } else {
      setIsFullscreen(true)
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    }
  }

  const handleError = (error: string) => {
    console.error('Video player error:', error)
    setError(error)
  }

  const handleReady = () => {
    setIsLoading(false)
  }

  const playerHeight = isFullscreen ? height : width * 0.5625 // 16:9 aspect ratio

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
                  // Re-attempt to load the video
                  setIsLoading(true)
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
          height={playerHeight}
          width={isFullscreen ? width : width}
          videoId={videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}
          play={isPlaying}
          onChangeState={onStateChange}
          onReady={handleReady}
          onError={handleError}
          initialPlayerParams={{
            modestbranding: true,
            rel: false,
            showinfo: false,
            fs: 0,
            controls: false,
            playsinline: 1,
            enablejsapi: 1,
          }}
          webViewProps={{
            allowsFullscreenVideo: false,
          }}
        />
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00E0FF" />
          </View>
        )}
        
        {!isFullscreen && (
          <BlurView intensity={80} style={styles.controlsContainer}>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
                <FontAwesome5 name={isPlaying ? 'pause' : 'play'} size={16} color="#FFF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={handleFullscreenToggle}>
                <FontAwesome5 name="expand" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </BlurView>
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
    borderRadius: 0,
    zIndex: 999,
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
    width: '100%',
    height: '100%',
    aspectRatio: undefined,
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
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default VideoPlayer
