"use client"

import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  channelName?: string;
  style?: any;
  autoPlay?: boolean;
  showControlsInitially?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  style,
  autoPlay = false,
  onProgress,
  onComplete,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const playerRef = useRef(null);

  // Extract YouTube video ID from URL
  React.useEffect(() => {
    if (videoUrl) {
      try {
        console.log('Processing video URL:', videoUrl);
        let id = '';
        
        if (videoUrl.includes('youtube.com/embed/')) {
          id = videoUrl.split('youtube.com/embed/')[1].split('?')[0];
        } else if (videoUrl.includes('youtube.com/watch?v=')) {
          id = videoUrl.split('v=')[1].split('&')[0];
        } else if (videoUrl.includes('youtu.be/')) {
          id = videoUrl.split('youtu.be/')[1].split('?')[0];
        }
        
        console.log('Extracted video ID:', id);
        setVideoId(id);
      } catch (e) {
        console.error('Error extracting video ID:', e);
        setError('Invalid video URL format');
      }
    }
  }, [videoUrl]);

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!videoId) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E0FF" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <YoutubeIframe
        height={220}
        width={Dimensions.get('window').width}
        videoId={videoId}
        play={autoPlay}
        onChangeState={(state) => {
          console.log('Player state changed:', state);
          if (state === 'ended') {
            setIsLoading(false);
            onComplete?.();
          }
        }}
        onReady={() => {
          console.log('Player ready');
          setIsLoading(false);
        }}
        onError={(error) => {
          console.error('Player error:', error);
          setError(`Failed to load video: ${error}`);
        }}
        initialPlayerParams={{
          preventFullScreen: false,
          modestbranding: true,
          rel: false,
          controls: true,
        }}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00E0FF" />
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default VideoPlayer;
