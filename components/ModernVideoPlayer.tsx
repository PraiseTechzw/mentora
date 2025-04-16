import { useState, useRef, useEffect } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, Platform, ViewStyle, TextStyle } from "react-native"
import { VideoView, useVideoPlayer } from "expo-video"
import { WebView } from "react-native-webview"
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
  // For direct video playback
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false
    player.volume = 1
  })

  // State variables
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControlsOverlay, setShowControlsOverlay] = useState(true)
  const [isBuffering, setIsBuffering] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [showSpeedOptions, setShowSpeedOptions] = useState(false)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Refs
  const videoRef = useRef<WebView>(null)
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null)
  const controlsOpacity = useRef(new Animated.Value(1)).current
  const { width, height } = Dimensions.get('window')

  // Check if the URL is a YouTube embed URL
  const isYouTubeEmbed = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')

  // Ensure the URL is in the correct embedded format for YouTube
  const getEmbeddedUrl = (url: string): string => {
    // If it's already an embedded URL, return it
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      // Return embedded URL with parameters
      return `https://www.youtube.com/embed/${match[2]}?autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`;
    }
    
    // If we can't extract an ID, return the original URL
    return url;
  };

  const embeddedUrl = isYouTubeEmbed ? getEmbeddedUrl(videoUrl) : videoUrl;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [])

  // Handle YouTube iframe API messages
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      
      if (data.event === "onStateChange") {
        // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering
        setIsPlaying(data.info === 1)
        setIsBuffering(data.info === 3)
        if (data.info === 0 && onComplete) {
          onComplete()
        }
      } else if (data.event === "onReady") {
        setIsBuffering(false)
        
        // Get duration
        if (videoRef.current) {
          // @ts-ignore
          videoRef.current.injectJavaScript(`
            const player = document.querySelector('iframe').contentWindow;
            player.postMessage('{"event":"command","func":"getDuration","args":[]}', '*');
            true;
          `)
        }
      } else if (data.event === "getDuration") {
        setDuration(data.value)
      } else if (data.event === "getCurrentTime") {
        setPosition(data.value)
        if (onProgress && duration > 0) {
          onProgress(data.value / duration)
        }
      } else if (data.event === "onError") {
        setError(`Video error: ${data.info}`)
      }
    } catch (e) {
      // Not a JSON message or not from YouTube iframe
    }
  }

  // YouTube iframe API initialization script
  const youtubeIframeScript = `
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    var player;
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        events: {
          'onReady': function(event) {
            window.ReactNativeWebView.postMessage(JSON.stringify({event: 'onReady'}));
            ${autoPlay ? 'event.target.playVideo();' : ''}
          },
          'onStateChange': function(event) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              event: 'onStateChange',
              info: event.data
            }));
          },
          'onError': function(event) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              event: 'onError',
              info: event.data
            }));
          }
        }
      });
    }
    
    // Set up message listener for getCurrentTime and getDuration
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'command') {
          if (data.func === 'getCurrentTime' && player && player.getCurrentTime) {
            const currentTime = player.getCurrentTime();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              event: 'getCurrentTime',
              value: currentTime
            }));
          } else if (data.func === 'getDuration' && player && player.getDuration) {
            const duration = player.getDuration();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              event: 'getDuration',
              value: duration
            }));
          } else if (data.func === 'playVideo' && player && player.playVideo) {
            player.playVideo();
          } else if (data.func === 'pauseVideo' && player && player.pauseVideo) {
            player.pauseVideo();
          } else if (data.func === 'mute' && player && player.mute) {
            player.mute();
          } else if (data.func === 'unMute' && player && player.unMute) {
            player.unMute();
          } else if (data.func === 'setVolume' && player && player.setVolume) {
            player.setVolume(data.args[0]);
          } else if (data.func === 'seekTo' && player && player.seekTo) {
            player.seekTo(data.args[0], true);
          } else if (data.func === 'setPlaybackRate' && player && player.setPlaybackRate) {
            player.setPlaybackRate(data.args[0]);
          }
        }
      } catch (e) {
        // Not a JSON message
      }
    });
    
    // Update current time periodically
    setInterval(function() {
      if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          event: 'getCurrentTime',
          value: currentTime
        }));
      }
    }, 1000);
    
    true;
  `;

  // HTML content for WebView
  const youtubeHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #000;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe 
          id="player" 
          src="${embeddedUrl}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isYouTubeEmbed) {
      if (videoRef.current) {
        const message = isPlaying
          ? '{"event":"command","func":"pauseVideo","args":[]}'
          : '{"event":"command","func":"playVideo","args":[]}';
        
        // @ts-ignore
        videoRef.current.injectJavaScript(`
          const player = document.querySelector('iframe').contentWindow;
          player.postMessage(${message}, '*');
          true;
        `);
      }
    } else {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
    
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    setIsFullscreen(!isFullscreen);
    showControlsTemporarily();
  };

  // Toggle mute
  const toggleMute = () => {
    if (isYouTubeEmbed) {
      if (videoRef.current) {
        const message = isMuted
          ? '{"event":"command","func":"unMute","args":[]}'
          : '{"event":"command","func":"mute","args":[]}';
        
        // @ts-ignore
        videoRef.current.injectJavaScript(`
          const player = document.querySelector('iframe').contentWindow;
          player.postMessage(${message}, '*');
          true;
        `);
      }
    } else {
      player.volume = isMuted ? volume : 0;
    }
    
    setIsMuted(!isMuted);
    showControlsTemporarily();
  };

  // Set playback rate
  const setPlaybackRate = (rate: number) => {
    if (isYouTubeEmbed) {
      if (videoRef.current) {
        const message = `{"event":"command","func":"setPlaybackRate","args":[${rate}]}`;
        
        // @ts-ignore
        videoRef.current.injectJavaScript(`
          const player = document.querySelector('iframe').contentWindow;
          player.postMessage(${message}, '*');
          true;
        `);
      }
    } else {
      player.playbackRate = rate;
    }
    
    setPlaybackSpeed(rate);
    setShowSpeedOptions(false);
    showControlsTemporarily();
  };

  // Handle slider value change
  const handleSliderValueChange = (value: number) => {
    const newPosition = value * duration;
    
    if (isYouTubeEmbed) {
      if (videoRef.current) {
        const message = `{"event":"command","func":"seekTo","args":[${newPosition}, true]}`;
        
        // @ts-ignore
        videoRef.current.injectJavaScript(`
          const player = document.querySelector('iframe').contentWindow;
          player.postMessage(${message}, '*');
          true;
        `);
      }
    } else {
      player.currentTime = newPosition;
    }
    
    setPosition(newPosition);
    showControlsTemporarily();
  };

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    const newPosition = Math.max(0, Math.min(duration, position + seconds));
    
    if (isYouTubeEmbed) {
      if (videoRef.current) {
        const message = `{"event":"command","func":"seekTo","args":[${newPosition}, true]}`;
        
        // @ts-ignore
        videoRef.current.injectJavaScript(`
          const player = document.querySelector('iframe').contentWindow;
          player.postMessage(${message}, '*');
          true;
        `);
      }
    } else {
      player.currentTime = newPosition;
    }
    
    setPosition(newPosition);
    showControlsTemporarily();
  };

  // Show controls temporarily
  const showControlsTemporarily = () => {
    setShowControlsOverlay(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowControlsOverlay(false);
        });
      }, 3000);
    }
  };

  // Handle video press
  const handleVideoPress = () => {
    if (showControlsOverlay) {
      if (isPlaying) {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowControlsOverlay(false);
        });
      }
    } else {
      showControlsTemporarily();
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let result = "";
    if (hrs > 0) {
      result += `${hrs}:`;
    }
    result += `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return result;
  };

  // Handle playback status update for direct video playback
  const handlePlaybackStatusUpdate = (status: any) => {
    if (!status) return;

    setIsPlaying(status.isPlaying);
    setIsBuffering(status.isBuffering);

    if (status.duration) {
      setDuration(status.duration);
    }

    if (status.position) {
      setPosition(status.position);
      if (onProgress) {
        onProgress(status.position / (status.duration || 1));
      }
    }

    if (status.didJustFinish && onComplete) {
      onComplete();
    }
  };

  // Replace the Slider component with a custom progress bar
  const ProgressBar = ({ progress, onSeek }: { progress: number; onSeek: (value: number) => void }) => {
    return (
      <TouchableOpacity
        style={styles.progressBarContainer}
        onPress={(e) => {
          const { locationX } = e.nativeEvent;
          const newProgress = locationX / Dimensions.get('window').width;
          onSeek(newProgress);
        }}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${progress * 100}%` }]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer, style]}>
      <StatusBar hidden={isFullscreen} />
      <TouchableOpacity activeOpacity={1} onPress={handleVideoPress} style={styles.videoWrapper}>
        {isYouTubeEmbed ? (
          <WebView
            ref={videoRef}
            source={{ html: youtubeHTML }}
            style={styles.video}
            onLoadStart={() => setIsBuffering(true)}
            onLoadEnd={() => setIsBuffering(false)}
            onMessage={handleWebViewMessage}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              setError(`WebView error: ${nativeEvent.description}`);
              console.error('WebView error:', nativeEvent);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            injectedJavaScript={youtubeIframeScript}
            startInLoadingState={true}
          />
        ) : (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
            onError={(error) => {
              console.error('Video error:', error)
              setError(`Video error: ${error.message}`)
            }}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
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
              {/* Top controls */}
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

              {/* Center controls */}
              <View style={styles.centerControlsContainer}>
                <TouchableOpacity onPress={() => skipTime(-10)} style={styles.skipButton}>
                  <MotiView
                    animate={{ scale: 1 }}
                    transition={{
                      type: "timing",
                      duration: 100,
                      easing: Easing.inOut(Easing.ease),
                    }}
                  >
                    <FontAwesome5 name="backward" size={20} color="#FFF" />
                    <Text style={styles.skipText}>10s</Text>
                  </MotiView>
                </TouchableOpacity>

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

                <TouchableOpacity onPress={() => skipTime(10)} style={styles.skipButton}>
                  <MotiView
                    animate={{ scale: 1 }}
                    transition={{
                      type: "timing",
                      duration: 100,
                      easing: Easing.inOut(Easing.ease),
                    }}
                  >
                    <FontAwesome5 name="forward" size={20} color="#FFF" />
                    <Text style={styles.skipText}>10s</Text>
                  </MotiView>
                </TouchableOpacity>
              </View>

              {/* Bottom controls */}
              <View style={styles.bottomControls}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <ProgressBar
                  progress={duration > 0 ? position / duration : 0}
                  onSeek={handleSliderValueChange}
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
  );
};

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
    zIndex: 10,
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
  skipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: {
    color: "#FFF",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
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