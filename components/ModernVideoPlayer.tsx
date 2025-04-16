import { useState, useRef, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform } from "react-native"
import Video, { VideoRef } from 'react-native-video'
import { FontAwesome5 } from "@expo/vector-icons"
import * as ScreenOrientation from "expo-screen-orientation"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { MotiView } from "moti"
import { Easing } from "react-native-reanimated"

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
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControlsOverlay, setShowControlsOverlay] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<VideoRef>(null)
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null)
  const controlsOpacity = useRef(new Animated.Value(1)).current
  const { width, height } = Dimensions.get('window')

  // Check if the URL is a YouTube embed URL
  const isYouTubeEmbed = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be')

  // Ensure the URL is in the correct embedded format for YouTube
  const getEmbeddedUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`;
    }
    
    return url;
  };

  const embeddedUrl = getEmbeddedUrl(videoUrl);

  const handleLoad = (data: any) => {
    setDuration(data.duration)
    setIsBuffering(false)
  }

  const handleProgress = (data: any) => {
    setPosition(data.currentTime)
    if (onProgress) {
      onProgress(data.currentTime / data.seekableDuration)
    }
  }

  const handleEnd = () => {
    setIsPlaying(false)
    if (onComplete) {
      onComplete()
    }
  }

  const handleError = (error: any) => {
    console.error('Video error:', error)
    setError(`Video error: ${error.error?.message || 'Unknown error'}`)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    showControlsTemporarily()
  }

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    }
    setIsFullscreen(!isFullscreen)
    showControlsTemporarily()
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    showControlsTemporarily()
  }

  const handleSliderValueChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.seek(value * duration)
    }
    showControlsTemporarily()
  }

  const showControlsTemporarily = () => {
    setShowControlsOverlay(true)
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }

    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowControlsOverlay(false)
        })
      }, 3000)
    }
  }

  const handleVideoPress = () => {
    if (showControlsOverlay) {
      if (isPlaying) {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowControlsOverlay(false)
        })
      }
    } else {
      showControlsTemporarily()
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    let result = ""
    if (hrs > 0) {
      result += `${hrs}:`
    }
    result += `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    return result
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer, style]}>
      <StatusBar hidden={isFullscreen} />
      <TouchableOpacity activeOpacity={1} onPress={handleVideoPress} style={styles.videoWrapper}>
        {videoUrl ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode="contain"
            paused={!isPlaying}
            muted={isMuted}
            volume={volume}
            onLoad={handleLoad}
            onProgress={handleProgress}
            onEnd={handleEnd}
            onError={handleError}
            onBuffer={() => setIsBuffering(true)}
            onLoadStart={() => setIsBuffering(true)}
            repeat={false}
            controls={false}
          />
        ) : (
          <View style={styles.errorContainer}>
            <BlurView intensity={70} style={styles.errorBlur}>
              <FontAwesome5 name="exclamation-triangle" size={30} color="#FF6B6B" style={styles.errorIcon} />
              <Text style={styles.errorText}>No video source available</Text>
            </BlurView>
          </View>
        )}

        {isBuffering && (
          <MotiView
            style={styles.bufferingContainer}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            }}
          >
            <BlurView intensity={50} style={styles.bufferingBlur}>
              <FontAwesome5 name="spinner" size={24} color="#FFF" style={styles.spinnerIcon} />
              <Text style={styles.bufferingText}>Loading...</Text>
            </BlurView>
          </MotiView>
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

        {showControlsOverlay && (
          <Animated.View style={[styles.controlsContainer, { opacity: controlsOpacity }]}>
            <LinearGradient
              colors={["rgba(0,0,0,0.8)", "transparent"]}
              style={styles.topGradient}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.bottomGradient}
            />
            <BlurView intensity={40} style={styles.controlsBlur}>
              <View style={styles.topControls}>
                <TouchableOpacity onPress={() => {}} style={styles.backButton}>
                  <FontAwesome5 name="arrow-left" size={16} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {title}
                  </Text>
                  {channelName && (
                    <Text style={styles.channelName} numberOfLines={1}>
                      {channelName}
                    </Text>
                  )}
                </View>
                <View style={styles.topRightControls}>
                  <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                    <FontAwesome5 name={isMuted ? "volume-mute" : "volume-up"} size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.centerControlsContainer}>
                <TouchableOpacity onPress={togglePlayPause} style={styles.centerButton}>
                  <MotiView
                    animate={{ scale: isPlaying ? 1 : 1.2 }}
                    transition={{
                      type: "timing",
                      duration: 200,
                      easing: Easing.inOut(Easing.ease),
                    }}
                  >
                    <FontAwesome5
                      name={isPlaying ? "pause" : "play"}
                      size={30}
                      color="#FFF"
                      style={isPlaying ? {} : { marginLeft: 4 }}
                    />
                  </MotiView>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomControls}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <TouchableOpacity
                  style={styles.progressBarContainer}
                  onPress={(e) => {
                    const { locationX } = e.nativeEvent;
                    const newProgress = locationX / width;
                    handleSliderValueChange(newProgress);
                  }}
                >
                  <View style={styles.progressBar}>
                    <View style={[styles.progress, { width: `${(position / duration) * 100}%` }]} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
                  <FontAwesome5 name={isFullscreen ? "compress" : "expand"} size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </TouchableOpacity>
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
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  bufferingBlur: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  spinnerIcon: {
    marginBottom: 10,
  },
  bufferingText: {
    color: "#FFF",
    fontSize: 16,
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
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  controlsBlur: {
    flex: 1,
    padding: 16,
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  videoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  channelName: {
    color: "#DDD",
    fontSize: 12,
    marginTop: 2,
  },
  topRightControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
  centerControlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    transform: [{ translateY: -25 }],
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 107, 107, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 30,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    width: 50,
    textAlign: "center",
  },
  progressBarContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  fullscreenButton: {
    padding: 8,
  },
});
