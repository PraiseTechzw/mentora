import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface VideoPlayerProps {
  videoUrl: string;
  style?: any;
  autoPlay?: boolean;
  showControls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  style, 
  autoPlay = true,
  showControls = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<Video>(null);
  const { width } = Dimensions.get('window');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation
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

  useEffect(() => {
    const loadVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.loadAsync(
            { uri: videoUrl },
            { shouldPlay: autoPlay },
            false
          );
        } catch (error) {
          console.error('Error loading video:', error);
          setError('Failed to load video');
        }
      }
    };

    loadVideo();

    return () => {
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, [videoUrl, autoPlay]);

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

  const LoadingAnimation = () => (
    <BlurView intensity={20} style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingContent, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.loadingIconContainer}>
          <MaterialIcons name="play-circle-outline" size={60} color="#fff" />
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
        <Text style={styles.loadingText}>Loading video...</Text>
      </Animated.View>
    </BlurView>
  );

  if (isYouTubeEmbed) {
    return (
      <View style={[styles.container, style, isFullscreen && styles.fullscreen]}>
        <WebView
          source={{ uri: embeddedUrl }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(`WebView error: ${nativeEvent.description}`);
          }}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
          renderLoading={() => <LoadingAnimation />}
        />
        {isLoading && <LoadingAnimation />}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={40} color="#fff" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style, isFullscreen && styles.fullscreen]}>
      <Video
        ref={videoRef}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={showControls}
        isLooping={false}
        onLoadStart={() => setIsLoading(true)}
        onLoad={(status: AVPlaybackStatus) => {
          setIsLoading(false);
          if (status.isLoaded && autoPlay) {
            videoRef.current?.playAsync().catch(error => {
              console.error('Error playing video:', error);
              setError('Failed to play video');
            });
          }
        }}
        onError={() => {
          setError('Failed to load video');
        }}
      />
      {isLoading && <LoadingAnimation />}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={40} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
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
  },
  video: {
    width: '100%',
    height: '100%',
  },
  webview: {
    width: '100%',
    height: '100%',
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
}); 