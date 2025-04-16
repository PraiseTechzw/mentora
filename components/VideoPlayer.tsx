import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { VideoView, useVideoPlayer } from 'expo-video';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoPlayerProps {
  videoUrl: string;
  style?: any;
  autoPlay?: boolean;
  showControls?: boolean;
  title?: string;
  channelName?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  style, 
  autoPlay = true,
  showControls = true,
  title = "Video Title",
  channelName = "Channel Name"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const player = useVideoPlayer(videoUrl, (player) => {
    if (autoPlay) {
      player.play();
    }
  });

  const { width, height } = Dimensions.get('window');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for loading state
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoading]);

  // Auto-hide controls after a delay
  useEffect(() => {
    if (isPlaying && showControlsOverlay) {
      controlsTimeoutRef.current = setTimeout(() => {
        fadeOutControls();
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControlsOverlay]);

  // Handle fullscreen changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      const { width, height } = Dimensions.get('window');
      setIsFullscreen(width > height);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Fade out controls animation
  const fadeOutControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowControlsOverlay(false);
    });
  };

  // Fade in controls animation
  const fadeInControls = () => {
    setShowControlsOverlay(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Reset the auto-hide timer
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        fadeOutControls();
      }, 3000);
    }
  };

  // Toggle controls visibility
  const toggleControls = () => {
    if (showControlsOverlay) {
      fadeOutControls();
    } else {
      fadeInControls();
    }
  };

  // Format time (seconds) to MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Ensure the URL is in the correct embedded format
  const getEmbeddedUrl = (url: string): string => {
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=${autoPlay ? 1 : 0}&modestbranding=1&rel=0`;
    }
    
    return url;
  };

  const embeddedUrl = getEmbeddedUrl(videoUrl);
  const isYouTubeEmbed = embeddedUrl.includes('youtube.com/embed');

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    // Send message to iframe to play/pause
    if (videoRef.current && isYouTubeEmbed) {
      const message = isPlaying
        ? '{"event":"command","func":"pauseVideo","args":[]}'
        : '{"event":"command","func":"playVideo","args":[]}';
      
      // @ts-ignore
      videoRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage('${message}');
        true;
      `);
    }
    
    fadeInControls();
  };

  // Handle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Send message to iframe to mute/unmute
    if (videoRef.current && isYouTubeEmbed) {
      const message = isMuted
        ? '{"event":"command","func":"unMute","args":[]}'
        : '{"event":"command","func":"mute","args":[]}';
      
      // @ts-ignore
      videoRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage('${message}');
        true;
      `);
    }
    
    fadeInControls();
  };

  // Handle volume change
  const changeVolume = (level: number) => {
    setVolumeLevel(level);
    
    // Send message to iframe to change volume
    if (videoRef.current && isYouTubeEmbed) {
      const message = `{"event":"command","func":"setVolume","args":[${level * 100}]}`;
      
      // @ts-ignore
      videoRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage('${message}');
        true;
      `);
    }
    
    // If volume is set to 0, mute the video
    if (level === 0 && !isMuted) {
      setIsMuted(true);
    } else if (level > 0 && isMuted) {
      setIsMuted(false);
    }
    
    fadeInControls();
  };

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    if (videoRef.current && isYouTubeEmbed) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      const message = `{"event":"command","func":"seekTo","args":[${newTime}, true]}`;
      
      // @ts-ignore
      videoRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage('${message}');
        true;
      `);
      
      setCurrentTime(newTime);
    }
    
    fadeInControls();
  };

  // Handle WebView messages from YouTube iframe
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.event === "onStateChange") {
        // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering
        setIsPlaying(data.info === 1);
        setIsLoading(data.info === 3);
        if (data.info === 0) {
          setIsPlaying(false);
          fadeInControls();
        }
      } else if (data.event === "onReady") {
        setIsLoading(false);
        
        // Get duration
        if (videoRef.current) {
          // @ts-ignore
          videoRef.current.injectJavaScript(`
            const player = document.querySelector('iframe').contentWindow;
            player.postMessage('{"event":"command","func":"getDuration","args":[]}', '*');
            true;
          `);
        }
      } else if (data.event === "getDuration") {
        setDuration(data.value);
      } else if (data.event === "getCurrentTime") {
        setCurrentTime(data.value);
        if (duration > 0) {
          setProgress(data.value / duration);
        }
      } else if (data.event === "onError") {
        setError(`Video error: ${data.info}`);
      }
    } catch (e) {
      // Not a JSON message or not from YouTube iframe
    }
  };

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

  const LoadingAnimation = () => (
    <BlurView intensity={20} style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingContent, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.loadingIconContainer}>
          <MaterialIcons name="play-circle-outline" size={60} color="#fff" />
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
        <Text style={styles.loadingText}>Loading video...</Text>
      </Animated.View>
    </BlurView>
  );

  // Custom video controls
  const VideoControls = () => (
    <Animated.View 
      style={[
        styles.controlsContainer, 
        { opacity: fadeAnim }
      ]}
      pointerEvents={showControlsOverlay ? 'auto' : 'none'}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
        style={styles.controlsGradient}
      >
        {/* Top controls */}
        <View style={styles.topControls}>
          <View style={styles.titleContainer}>
            <Text style={styles.videoTitle} numberOfLines={1}>{title}</Text>
            {channelName && <Text style={styles.channelName}>{channelName}</Text>}
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsFullscreen(!isFullscreen)}>
            <MaterialIcons name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Center play/pause button */}
        <View style={styles.centerControls}>
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => skipTime(-10)}
          >
            <MaterialIcons name="replay-10" size={36} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.playPauseButton} 
            onPress={togglePlay}
          >
            <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={50} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => skipTime(10)}
          >
            <MaterialIcons name="forward-10" size={36} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
          </View>
          
          <View style={styles.timeControls}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={togglePlay}>
              <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.volumeContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleMute}>
                <MaterialIcons 
                  name={isMuted || volumeLevel === 0 ? "volume-off" : volumeLevel < 0.5 ? "volume-down" : "volume-up"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              <View style={styles.volumeSlider}>
                <View style={styles.volumeSliderBackground} />
                <View style={[styles.volumeSliderFill, { width: `${volumeLevel * 100}%` }]} />
                <TouchableOpacity 
                  style={[styles.volumeSliderThumb, { left: `${volumeLevel * 100}%` }]}
                  onPress={() => {}}
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.iconButton} onPress={() => setIsFullscreen(!isFullscreen)}>
              <MaterialIcons name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (isYouTubeEmbed) {
    return (
      <View style={[styles.container, style, isFullscreen && styles.fullscreen]}>
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.videoContainer}
          onPress={toggleControls}
        >
          <WebView
            ref={videoRef}
            source={{ html: youtubeHTML }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
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
            renderLoading={() => <ActivityIndicator size="large" color="#fff" />}
          />
          
          {isLoading && <LoadingAnimation />}
          
          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={40} color="#fff" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {showControls && <VideoControls />}
        </TouchableOpacity>
      </View>
    );
  }

  // For non-YouTube videos
  return (
    <View style={[styles.container, style, isFullscreen && styles.fullscreen]}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.videoContainer}
        onPress={toggleControls}
      >
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={showControls}
          onError={(error) => {
            console.error('Video error:', error);
            setError(`Video error: ${error.message}`);
          }}
        />
        
        {isLoading && <LoadingAnimation />}
        
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={40} color="#fff" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {showControls && <VideoControls />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    width: '100%',
    height: '100%',
    aspectRatio: undefined,
    borderRadius: 0,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.9,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  controlsGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  channelName: {
    color: '#ddd',
    fontSize: 12,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  skipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    width: '100%',
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    marginBottom: 10,
  },
  progressBarBackground: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressBar: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FF0000',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginLeft: -6,
    transform: [{ translateY: -4 }],
  },
  timeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    width: 80,
    height: 20,
    justifyContent: 'center',
    marginLeft: 5,
  },
  volumeSliderBackground: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
  },
  volumeSliderFill: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 1.5,
  },
  volumeSliderThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginLeft: -5,
  },
});