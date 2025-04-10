"use client"

import { useState, useRef, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated } from "react-native"
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av"
import { FontAwesome5 } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import * as ScreenOrientation from "expo-screen-orientation"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"

interface ModernVideoPlayerProps {
  videoUrl: string
  thumbnailUrl: string
  title: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export function ModernVideoPlayer({ videoUrl, thumbnailUrl, title, onProgress, onComplete }: ModernVideoPlayerProps) {
  const videoRef = useRef<Video>(null)
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showSpeedOptions, setShowSpeedOptions] = useState(false)

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
    if (!videoRef.current) return

    if (isPlaying) {
      await videoRef.current.pauseAsync()
    } else {
      await videoRef.current.playAsync()
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
    if (!videoRef.current) return
    await videoRef.current.setIsMutedAsync(!isMuted)
    setIsMuted(!isMuted)
    showControlsTemporarily()
  }

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return

    setStatus(status)
    setIsPlaying(status.isPlaying)
    setIsBuffering(status.isBuffering)

    if (status.durationMillis) {
      setDuration(status.durationMillis / 1000)
    }

    if (status.positionMillis) {
      setPosition(status.positionMillis / 1000)
      if (onProgress) {
        onProgress(status.positionMillis / (status.durationMillis || 1))
      }
    }

    if (status.didJustFinish && onComplete) {
      onComplete()
    }
  }

  const handleSliderValueChange = async (value: number) => {
    if (!videoRef.current) return
    const newPosition = value * duration
    await videoRef.current.setPositionAsync(newPosition * 1000)
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
    if (!videoRef.current) return
    await videoRef.current.setRateAsync(rate, true)
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
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
          posterSource={{ uri: thumbnailUrl }}
          posterStyle={styles.poster}
          usePoster={true}
        />

        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <BlurView intensity={50} style={styles.bufferingBlur}>
              <FontAwesome5 name="spinner" size={24} color="#FFF" style={styles.spinnerIcon} />
              <Text style={styles.bufferingText}>Loading...</Text>
            </BlurView>
          </View>
        )}

        {showControls && (
          <Animated.View style={[styles.controlsContainer, { opacity: controlsOpacity }]}>
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
                <View style={styles.speedOptionsContainer}>
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
                </View>
              )}

              {/* Center play/pause button */}
              <TouchableOpacity onPress={togglePlayPause} style={styles.centerButton}>
                <FontAwesome5
                  name={isPlaying ? "pause" : "play"}
                  size={30}
                  color="#FFF"
                  style={isPlaying ? {} : { marginLeft: 4 }}
                />
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

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  fullscreenContainer: {
    width: height,
    height: width,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
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
  poster: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 16,
  },
  controlsBlur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 16,
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  backButton: {
    padding: 8,
  },
  videoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginHorizontal: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    fontWeight: "600",
  },
  speedOptionsContainer: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  activeSpeedOption: {
    backgroundColor: "#FF6B6B",
  },
  speedOptionText: {
    color: "#FFF",
    fontSize: 14,
  },
  activeSpeedOptionText: {
    fontWeight: "600",
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
    height: 40,
  },
  fullscreenButton: {
    padding: 8,
    marginLeft: 8,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  bufferingBlur: {
    width: 120,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bufferingText: {
    color: "#FFF",
    marginTop: 8,
    fontSize: 14,
  },
  spinnerIcon: {
    transform: [{ rotate: "0deg" }],
  },
})
