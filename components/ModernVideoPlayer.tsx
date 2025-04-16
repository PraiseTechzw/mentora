"use client"

import { useState, useRef, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform, ViewStyle, TextStyle } from "react-native"
import { VideoView, useVideoPlayer } from "expo-video"
import { FontAwesome5 } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import * as ScreenOrientation from "expo-screen-orientation"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { MotiView } from "moti"
import { Easing } from "react-native-reanimated"

interface ModernVideoPlayerProps {
  videoUrl: string
  thumbnailUrl: string
  title: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

interface Styles {
  container: ViewStyle
  fullscreenContainer: ViewStyle
  videoWrapper: ViewStyle
  video: ViewStyle
  bufferingContainer: ViewStyle
  bufferingBlur: ViewStyle
  spinnerIcon: ViewStyle
  bufferingText: TextStyle
  controlsContainer: ViewStyle
  topGradient: ViewStyle
  bottomGradient: ViewStyle
  controlsBlur: ViewStyle
  topControls: ViewStyle
  backButton: ViewStyle
  videoTitle: TextStyle
  topRightControls: ViewStyle
  controlButton: ViewStyle
  speedText: TextStyle
  speedOptionsContainer: ViewStyle
  speedOption: ViewStyle
  activeSpeedOption: ViewStyle
  speedOptionText: TextStyle
  activeSpeedOptionText: TextStyle
  centerButton: ViewStyle
  bottomControls: ViewStyle
  timeText: TextStyle
  slider: ViewStyle
  fullscreenButton: ViewStyle
}

const styles = StyleSheet.create<Styles>({
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
  videoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginHorizontal: 16,
  },
  topRightControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
  speedText: {
    color: "#FFF",
    fontSize: 14,
  },
  speedOptionsContainer: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    padding: 8,
  },
  speedOption: {
    padding: 8,
  },
  activeSpeedOption: {
    backgroundColor: "rgba(255, 107, 107, 0.3)",
    borderRadius: 4,
  },
  speedOptionText: {
    color: "#FFF",
    fontSize: 14,
  },
  activeSpeedOptionText: {
    color: "#FF6B6B",
  },
  centerButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    width: 50,
    textAlign: "center",
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  fullscreenButton: {
    padding: 8,
  },
})

export function ModernVideoPlayer({ videoUrl, thumbnailUrl, title, onProgress, onComplete }: ModernVideoPlayerProps) {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false
    player.volume = 1
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showSpeedOptions, setShowSpeedOptions] = useState(false)
  const [volume, setVolume] = useState(1)

  const controlsOpacity = useRef(new Animated.Value(1)).current
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [])

  const togglePlayPause = async () => {
    if (isPlaying) {
      player.pause()
    } else {
      player.play()
    }
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

  const toggleMute = async () => {
    const newVolume = isMuted ? volume : 0
    player.volume = newVolume
    setIsMuted(!isMuted)
    showControlsTemporarily()
  }

  const handlePlaybackStatusUpdate = (status: any) => {
    if (!status) return

    setIsPlaying(status.isPlaying)
    setIsBuffering(status.isBuffering)

    if (status.duration) {
      setDuration(status.duration)
    }

    if (status.position) {
      setPosition(status.position)
      if (onProgress) {
        onProgress(status.position / (status.duration || 1))
      }
    }

    if (status.didJustFinish && onComplete) {
      onComplete()
    }
  }

  const handleSliderValueChange = async (value: number) => {
    const newPosition = value * duration
    player.currentTime = newPosition
    setPosition(newPosition)
    showControlsTemporarily()
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
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
          setShowControls(false)
        })
      }, 3000)
    }
  }

  const handleVideoPress = () => {
    if (showControls) {
      if (isPlaying) {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowControls(false)
        })
      }
    } else {
      showControlsTemporarily()
    }
  }

  const setPlaybackRate = async (rate: number) => {
    player.playbackRate = rate
    setPlaybackSpeed(rate)
    setShowSpeedOptions(false)
    showControlsTemporarily()
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
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar hidden={isFullscreen} />
      <TouchableOpacity activeOpacity={1} onPress={handleVideoPress} style={styles.videoWrapper}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
          onFullscreenEnter={() => setIsFullscreen(true)}
          onFullscreenExit={() => setIsFullscreen(false)}
        />

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

        {showControls && (
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
              {/* Top controls */}
              <View style={styles.topControls}>
                <TouchableOpacity onPress={() => {}} style={styles.backButton}>
                  <FontAwesome5 name="arrow-left" size={16} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {title}
                </Text>
                <View style={styles.topRightControls}>
                  <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                    <FontAwesome5 name={isMuted ? "volume-mute" : "volume-up"} size={16} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowSpeedOptions(!showSpeedOptions)} style={styles.controlButton}>
                    <Text style={styles.speedText}>{playbackSpeed}x</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Speed options */}
              {showSpeedOptions && (
                <MotiView
                  style={styles.speedOptionsContainer}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "timing",
                    duration: 200,
                    easing: Easing.inOut(Easing.ease),
                  }}
                >
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[styles.speedOption, playbackSpeed === speed && styles.activeSpeedOption]}
                      onPress={() => setPlaybackRate(speed)}
                    >
                      <Text style={[styles.speedOptionText, playbackSpeed === speed && styles.activeSpeedOptionText]}>
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </MotiView>
              )}

              {/* Center play/pause button */}
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

              {/* Bottom controls */}
              <View style={styles.bottomControls}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={duration > 0 ? position / duration : 0}
                  onValueChange={handleSliderValueChange}
                  minimumTrackTintColor="#FF6B6B"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="#FF6B6B"
                />
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
