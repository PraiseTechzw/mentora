"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, PanResponder, Pressable, ActivityIndicator } from "react-native"
import { WebView } from "react-native-webview"
import { Ionicons } from "@expo/vector-icons"
import * as ScreenOrientation from "expo-screen-orientation"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated"

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
  thumbnailUrl,
  title = "Video Title",
  channelName = "",
  style,
  autoPlay = true,
  showControlsInitially = true,
  onProgress,
  onComplete,
}): JSX.Element => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showControlsOverlay, setShowControlsOverlay] = useState(showControlsInitially)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [brightness, setBrightness] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const [doubleTapSide, setDoubleTapSide] = useState<"left" | "right" | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Animated values
  const controlsOpacity = useSharedValue(1)
  const progressWidth = useSharedValue(0)
  const volumeHeight = useSharedValue(volume * 100)
  const brightnessHeight = useSharedValue(brightness * 100)
  const doubleTapOpacity = useSharedValue(0)
  const doubleTapScale = useSharedValue(1)
  const bufferingOpacity = useSharedValue(0)

  const controlsTimeout = useRef<NodeJS.Timeout>()
  const doubleTapTimeout = useRef<NodeJS.Timeout>()
  const lastTap = useRef<number>(0)
  const webViewRef = useRef<WebView>(null)
  const { width } = Dimensions.get("window")

  // Double tap handler for seeking
  const handleDoubleTap = (x: number) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (x < width / 2) {
        // Left side - seek backward
        setDoubleTapSide("left")
        handleSeek(-10)
      } else {
        // Right side - seek forward
        setDoubleTapSide("right")
        handleSeek(10)
      }

      // Animate double tap indicator
      doubleTapOpacity.value = withTiming(1, { duration: 200 })
      doubleTapScale.value = withSpring(1.2)

      // Hide after animation
      if (doubleTapTimeout.current) {
        clearTimeout(doubleTapTimeout.current)
      }

      doubleTapTimeout.current = setTimeout(() => {
        doubleTapOpacity.value = withTiming(0, { duration: 300 })
        doubleTapScale.value = withTiming(1)
      }, 800)
    }

    lastTap.current = now
  }

  // Gesture controls
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures for volume/brightness
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
      },
      onPanResponderGrant: () => {
        showControls()
      },
      onPanResponderMove: (_, gestureState) => {
        // Handle volume and brightness gestures
        if (gestureState.moveX < width / 3) {
          // Left side: brightness control
          const newBrightness = Math.max(0, Math.min(1, brightness - gestureState.dy / 200))
          setBrightness(newBrightness)
          brightnessHeight.value = newBrightness * 100
        } else if (gestureState.moveX > (width * 2) / 3) {
          // Right side: volume control
          const newVolume = Math.max(0, Math.min(1, volume - gestureState.dy / 200))
          setVolume(newVolume)
          volumeHeight.value = newVolume * 100
        }
      },
      onPanResponderRelease: () => {
        hideControlsWithDelay()
      },
    }),
  ).current

  // Tap handler for showing/hiding controls
  const handleTap = () => {
    if (showControlsOverlay) {
      hideControls()
    } else {
      showControls()
    }
  }

  // Show controls
  const showControls = () => {
    setShowControlsOverlay(true)
    controlsOpacity.value = withTiming(1, { duration: 200 })

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }
  }

  // Hide controls
  const hideControls = () => {
    setShowControlsOverlay(false)
    controlsOpacity.value = withTiming(0, { duration: 300 })
  }

  // Hide controls with delay
  const hideControlsWithDelay = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current)
    }

    controlsTimeout.current = setTimeout(() => {
      hideControls()
    }, 3000)
  }

  // Handle seeking
  const handleSeek = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    setCurrentTime(newTime)

    // Update progress
    progressWidth.value = (newTime / duration) * 100

    // Send command to WebView
    const seekCommand = `
      var video = document.querySelector('video');
      if (video) {
        video.currentTime = ${newTime};
      }
      true;
    `
    webViewRef.current?.injectJavaScript(seekCommand)
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    showControls()

    // Send command to WebView
    const playPauseCommand = `
      var video = document.querySelector('video');
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
      true;
    `
    webViewRef.current?.injectJavaScript(playPauseCommand)
  }

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    }
    setIsFullscreen(!isFullscreen)
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
    showControls()

    // Send command to WebView
    const muteCommand = `
      var video = document.querySelector('video');
      if (video) {
        video.muted = ${!isMuted};
      }
      true;
    `
    webViewRef.current?.injectJavaScript(muteCommand)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Handle video loaded
  const handleLoaded = (event: any) => {
    console.log('Video loaded:', {
      duration: event.nativeEvent.duration,
      title,
      channelName
    });
    if (event.nativeEvent.duration) {
      setDuration(event.nativeEvent.duration)
    }
    setIsBuffering(false)
    bufferingOpacity.value = withTiming(0)
  }

  // Handle video progress
  const handleProgress = (event: any) => {
    const progress = event.nativeEvent.progress;
    if (progress !== null && progress !== undefined && !isNaN(progress)) {
      const currentTime = progress * duration;
      console.log('Video progress:', {
        progress,
        currentTime,
        duration,
        title
      });
      setCurrentTime(currentTime);
      progressWidth.value = progress * 100;
      onProgress?.(progress);
    } else {
      console.warn('Invalid progress value received:', progress);
    }
  }

  // Handle video ended
  const handleEnded = () => {
    console.log('Video ended:', {
      title,
      channelName,
      duration
    });
    setIsPlaying(false)
    onComplete?.()
  }

  // Handle buffering
  const handleBufferingStart = () => {
    console.log('Video buffering started:', {
      title,
      currentTime
    });
    setIsBuffering(true)
    bufferingOpacity.value = withTiming(1)
  }

  const handleBufferingEnd = () => {
    console.log('Video buffering ended:', {
      title,
      currentTime
    });
    setIsBuffering(false)
    bufferingOpacity.value = withTiming(0)
  }

  // Animated styles
  const controlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    }
  })

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    }
  })

  const volumeIndicatorStyle = useAnimatedStyle(() => {
    return {
      height: `${volumeHeight.value}%`,
    }
  })

  const brightnessIndicatorStyle = useAnimatedStyle(() => {
    return {
      height: `${brightnessHeight.value}%`,
    }
  })

  const doubleTapAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: doubleTapOpacity.value,
      transform: [{ scale: doubleTapScale.value }],
    }
  })

  const bufferingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: bufferingOpacity.value,
    }
  })

  // Initialize controls timeout
  useEffect(() => {
    if (showControlsInitially) {
      hideControlsWithDelay()
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
      if (doubleTapTimeout.current) {
        clearTimeout(doubleTapTimeout.current)
      }
    }
  }, [])

  // Handle WebView messages
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      console.log('WebView message received:', data);

      switch (data.type) {
        case "loaded":
          handleLoaded({ nativeEvent: { duration: data.duration } })
          setError(null) // Clear any previous errors on successful load
          break
        case "progress":
          handleProgress({ nativeEvent: { progress: data.progress } })
          break
        case "ended":
          handleEnded()
          break
        case "buffering_start":
          handleBufferingStart()
          break
        case "buffering_end":
          handleBufferingEnd()
          break
        case "error":
          handleError(data.message)
          break
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (e) {
      console.error("Error parsing WebView message:", e)
      handleError("Failed to parse video data")
    }
  }

  const handleError = (message: string) => {
    console.error('Video error:', {
      message,
      title,
      videoUrl,
      currentTime,
      retryCount
    });
    
    // More descriptive error messages
    let errorMessage = message;
    if (message.includes('Failed to load')) {
      errorMessage = 'Video failed to load. Please check your internet connection.';
    } else if (message.includes('not found')) {
      errorMessage = 'Video not found. Please try another video.';
    } else if (message.includes('format')) {
      errorMessage = 'Video format not supported. Please try another video.';
    }
    
    setError(errorMessage)
    setIsBuffering(false)
    bufferingOpacity.value = withTiming(0)
  }

  const handleRetry = async () => {
    if (retryCount >= 3) {
      console.error('Max retry attempts reached:', {
        title,
        videoUrl,
        retryCount
      });
      setError("Maximum retry attempts reached. Please try again later.")
      return
    }

    console.log('Retrying video playback:', {
      title,
      retryCount: retryCount + 1
    });

    setIsRetrying(true)
    setError(null)
    
    try {
      webViewRef.current?.reload()
      setRetryCount(prev => prev + 1)
    } catch (e) {
      console.error('Retry failed:', {
        error: e,
        title,
        videoUrl
      });
      handleError("Failed to retry video playback")
    } finally {
      setIsRetrying(false)
    }
  }

  // Update the injected HTML to include better error handling
  const injectedHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
          }
          .video-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }
          .loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="video-container">
          <iframe
            src="${videoUrl}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <div class="loading">Loading video...</div>
        </div>
        <script>
          const video = document.querySelector('iframe');
          const loading = document.querySelector('.loading');
          const progressBar = document.querySelector('.progress-bar');
          const timeDisplay = document.querySelector('.time');
          const playPauseButton = document.querySelector('.play-pause');
          
          function handleVideoLoaded() {
            console.log('Video loaded');
            loading.style.display = 'none';
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'loaded',
              duration: video.duration
            }));
            updateTimeDisplay();
          }
          
          function handleTimeUpdate() {
            const progress = (video.currentTime / video.duration) * 100;
            progressBar.style.width = progress + '%';
            updateTimeDisplay();
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'progress',
              progress: video.currentTime / video.duration
            }));
          }
          
          function handleVideoEnded() {
            console.log('Video ended');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ended'
            }));
          }
          
          function handleVideoError() {
            console.error('Video error:', video.error);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'Failed to load video: ' + (video.error ? video.error.message : 'Unknown error')
            }));
          }
          
          function togglePlayPause() {
            if (video.paused) {
              video.src = video.src;
              playPauseButton.textContent = '⏸';
            } else {
              video.src = video.src;
              playPauseButton.textContent = '▶';
            }
          }
          
          function seek(event) {
            const progress = document.querySelector('.progress');
            const rect = progress.getBoundingClientRect();
            const pos = (event.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
          }
          
          function updateTimeDisplay() {
            const currentMinutes = Math.floor(video.currentTime / 60);
            const currentSeconds = Math.floor(video.currentTime % 60);
            const durationMinutes = Math.floor(video.duration / 60);
            const durationSeconds = Math.floor(video.duration % 60);
            
            timeDisplay.textContent = 
              currentMinutes + ':' + (currentSeconds < 10 ? '0' : '') + currentSeconds + ' / ' +
              durationMinutes + ':' + (durationSeconds < 10 ? '0' : '') + durationSeconds;
          }
          
          // Check if video is playing after a delay
          setTimeout(() => {
            if (video.readyState >= 2) {
              loading.style.display = 'none';
            }
          }, 3000);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer, style]}>
      <StatusBar hidden={isFullscreen} />

      {/* Video Player */}
      <View style={styles.videoWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: injectedHTML }}
          style={styles.video}
          allowsFullscreenVideo={false} // We handle fullscreen ourselves
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(`WebView error: ${nativeEvent.description}`);
          }}
        />

        {/* Tap Handler */}
        <Pressable
          style={styles.tapHandler}
          onPress={handleTap}
          onLongPress={togglePlayPause}
          delayLongPress={500}
          onTouchEnd={(e) => handleDoubleTap(e.nativeEvent.locationX)}
        />

        {/* Gesture Handler */}
        <View style={styles.gestureHandler} {...panResponder.panHandlers} />

        {/* Controls Overlay */}
        <Animated.View style={[styles.controlsOverlay, controlsAnimatedStyle]}>
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent", "transparent", "rgba(0,0,0,0.7)"]}
            style={styles.gradient}
          >
            {/* Top Controls */}
            <View style={styles.topControls}>
              {isFullscreen && (
                <TouchableOpacity style={styles.backButton} onPress={() => setIsFullscreen(false)}>
                  <Ionicons name="chevron-down" size={24} color="#FFF" />
                </TouchableOpacity>
              )}
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <TouchableOpacity style={styles.iconButton} onPress={toggleFullscreen}>
                <Ionicons name={isFullscreen ? "contract" : "expand"} size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity style={styles.seekButton} onPress={() => handleSeek(-10)}>
                <Ionicons name="play-back" size={22} color="#FFF" />
                <Text style={styles.seekText}>10s</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={isPlaying ? 32 : 28}
                  color="#FFF"
                  style={isPlaying ? {} : { marginLeft: 4 }}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.seekButton} onPress={() => handleSeek(10)}>
                <Text style={styles.seekText}>10s</Text>
                <Ionicons name="play-forward" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progress, progressAnimatedStyle]} />
                </View>

                {/* Progress Thumb */}
                <Animated.View style={[styles.progressThumb, { left: (currentTime / duration) * 100 + '%' }]} />
              </View>

              <Text style={styles.timeText}>{formatTime(duration)}</Text>

              <TouchableOpacity style={styles.iconButton} onPress={toggleMute}>
                <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Double Tap Indicators */}
        {doubleTapSide === "left" && (
          <Animated.View style={[styles.doubleTapIndicator, styles.leftIndicator, doubleTapAnimatedStyle]}>
            <View style={styles.doubleTapIconContainer}>
              <Ionicons name="play-back" size={28} color="#FFF" />
              <Text style={styles.doubleTapText}>10s</Text>
            </View>
          </Animated.View>
        )}

        {doubleTapSide === "right" && (
          <Animated.View style={[styles.doubleTapIndicator, styles.rightIndicator, doubleTapAnimatedStyle]}>
            <View style={styles.doubleTapIconContainer}>
              <Ionicons name="play-forward" size={28} color="#FFF" />
              <Text style={styles.doubleTapText}>10s</Text>
            </View>
          </Animated.View>
        )}

        {/* Gesture Indicators */}
        <View style={styles.gestureIndicators}>
          {/* Brightness Indicator */}
          <View style={styles.indicatorContainer}>
            <Ionicons name="sunny" size={20} color="#FFF" />
            <View style={styles.indicatorBar}>
              <Animated.View style={[styles.indicatorFill, brightnessIndicatorStyle]} />
            </View>
          </View>

          {/* Volume Indicator */}
          <View style={styles.indicatorContainer}>
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={20} color="#FFF" />
            <View style={styles.indicatorBar}>
              <Animated.View style={[styles.indicatorFill, volumeIndicatorStyle]} />
            </View>
          </View>
        </View>

        {/* Buffering Indicator */}
        <Animated.View style={[styles.bufferingContainer, bufferingAnimatedStyle]}>
          <BlurView intensity={40} style={styles.bufferingBlur}>
            <View style={styles.bufferingContent}>
              <View style={styles.spinner} />
              <Text style={styles.bufferingText}>Buffering...</Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <BlurView intensity={70} style={styles.errorBlur}>
              <Ionicons name="alert-circle" size={36} color="#00E0FF" style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]} 
                onPress={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.retryText}>Retry ({3 - retryCount} attempts left)</Text>
                )}
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  retryButtonDisabled: {
    backgroundColor: '#666',
  },
  retryCount: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  tapHandler: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gestureHandler: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  iconButton: {
    padding: 5,
  },
  centerControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  seekText: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 5,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  progress: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    top: -4,
  },
  doubleTapIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 10,
  },
  leftIndicator: {
    left: 20,
  },
  rightIndicator: {
    right: 20,
  },
  doubleTapIconContainer: {
    alignItems: 'center',
  },
  doubleTapText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  gestureIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  indicatorContainer: {
    width: 40,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'space-between',
  },
  indicatorBar: {
    flex: 1,
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 10,
  },
  indicatorFill: {
    width: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  bufferingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingBlur: {
    padding: 20,
    borderRadius: 10,
  },
  bufferingContent: {
    alignItems: 'center',
  },
  spinner: {
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: '#2196F3',
    borderTopColor: 'transparent',
    borderRadius: 15,
  },
  bufferingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  errorBlur: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default VideoPlayer;
