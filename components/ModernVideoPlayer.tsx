import React, { useState, useRef, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, Animated, PanResponder } from "react-native"
import { WebView } from 'react-native-webview'
import { FontAwesome5 } from "@expo/vector-icons"
import * as ScreenOrientation from "expo-screen-orientation"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"

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
  const [showControlsOverlay, setShowControlsOverlay] = useState(true)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [brightness, setBrightness] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)

  const controlsTimeout = useRef<NodeJS.Timeout>()
  const fadeAnim = useRef(new Animated.Value(1)).current
  const { width, height } = Dimensions.get('window')

  // Gesture controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setShowControlsOverlay(true)
        fadeInControls()
      },
      onPanResponderMove: (_, gestureState) => {
        // Handle volume and brightness gestures
        if (gestureState.moveX < width / 3) {
          // Left side: brightness control
          const newBrightness = Math.max(0, Math.min(1, brightness + gestureState.dy / 200))
          setBrightness(newBrightness)
        } else if (gestureState.moveX > (width * 2) / 3) {
          // Right side: volume control
          const newVolume = Math.max(0, Math.min(1, volume + gestureState.dy / 200))
          setVolume(newVolume)
        }
      },
      onPanResponderRelease: () => {
        fadeOutControls()
      },
    })
  ).current

  const fadeInControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }

  const fadeOutControls = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }
    controlsTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start()
    }, 3000)
  }

  useEffect(() => {
    fadeOutControls()
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    setShowControlsOverlay(true)
    fadeInControls()
  }

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    }
    setIsFullscreen(!isFullscreen)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setShowControlsOverlay(true)
    fadeInControls()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Handle video progress
  const handleProgress = (event: any) => {
    if (event.nativeEvent.progress) {
      const progress = event.nativeEvent.progress
      setCurrentTime(progress * duration)
      onProgress?.(progress)
    }
  }

  // Handle video loaded
  const handleLoaded = (event: any) => {
    if (event.nativeEvent.duration) {
      setDuration(event.nativeEvent.duration)
    }
  }

  // Handle video ended
  const handleEnded = () => {
    setIsPlaying(false)
    onComplete?.()
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer, style]}>
      <StatusBar hidden={isFullscreen} />
      <View style={styles.videoWrapper} {...panResponder.panHandlers}>
        <WebView
          source={{ uri: videoUrl }}
          style={styles.video}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(`WebView error: ${nativeEvent.description}`);
          }}
          onLoad={handleLoaded}
          onProgress={handleProgress}
          onEnded={handleEnded}
        />

        {/* Floating Controls Overlay */}
        <Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradient}
          >
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity onPress={() => setIsFullscreen(false)}>
                <FontAwesome5 name="chevron-down" size={20} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              <TouchableOpacity onPress={toggleFullscreen}>
                <FontAwesome5 name="expand" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity onPress={() => {/* Seek backward */}}>
                <FontAwesome5 name="step-backward" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <FontAwesome5 name={isPlaying ? "pause" : "play"} size={32} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {/* Seek forward */}}>
                <FontAwesome5 name="step-forward" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${(currentTime / duration) * 100}%` }]} />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
              <TouchableOpacity onPress={toggleMute}>
                <FontAwesome5 name={isMuted ? "volume-mute" : "volume-up"} size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Gesture Indicators */}
        <View style={styles.gestureIndicators}>
          <View style={styles.brightnessIndicator}>
            <FontAwesome5 name="sun" size={20} color="#FFF" />
            <View style={styles.indicatorBar}>
              <View style={[styles.indicatorFill, { height: `${brightness * 100}%` }]} />
            </View>
          </View>
          <View style={styles.volumeIndicator}>
            <FontAwesome5 name="volume-up" size={20} color="#FFF" />
            <View style={styles.indicatorBar}>
              <View style={[styles.indicatorFill, { height: `${volume * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Error State */}
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
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 40 : 16,
  },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginHorizontal: 16,
  },
  centerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 32,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
  },
  timeText: {
    color: "#FFF",
    fontSize: 14,
    marginHorizontal: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progress: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 2,
  },
  gestureIndicators: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    pointerEvents: "none",
  },
  brightnessIndicator: {
    alignItems: "center",
  },
  volumeIndicator: {
    alignItems: "center",
  },
  indicatorBar: {
    width: 4,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginTop: 8,
  },
  indicatorFill: {
    width: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 2,
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
})
