import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  // Handle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
    fadeInControls();
  };

  // Handle mute/unmute
  const toggleMute = () => {
    player.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    player.setVolumeAsync(value);
    setVolumeLevel(value);
    setIsMuted(value === 0);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle progress bar press
  const handleProgressPress = (event: any) => {
    if (!player) return;
    
    const { locationX } = event.nativeEvent;
    const progressBarWidth = progressBarRef.current?.clientWidth || 0;
    const newProgress = locationX / progressBarWidth;
    const newTime = duration * newProgress;
    
    player.setPositionAsync(newTime);
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />
      
      {showControls && (
        <TouchableOpacity
          style={styles.controlsOverlay}
          onPress={toggleControls}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.controlsContainer,
              { opacity: fadeAnim }
            ]}
          >
            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View
                ref={progressBarRef}
                style={styles.progressBar}
                onTouchEnd={handleProgressPress}
              >
                <View style={[styles.progress, { width: `${progress * 100}%` }]} />
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={togglePlay}>
                <MaterialIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </View>

              <TouchableOpacity onPress={toggleMute}>
                <MaterialIcons
                  name={isMuted ? "volume-off" : "volume-up"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleFullscreen}>
                <MaterialIcons
                  name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  progress: {
    height: '100%',
    backgroundColor: '#ff0000',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    padding: 20,
  },
});