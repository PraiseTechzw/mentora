import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Animated, Dimensions, Share, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { getAggregatedContent } from "../../services/content-aggregator"
import VideoPlayer from "../../components/ModernVideoPlayer"
import { FontAwesome5 } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Permissions from 'expo-permissions'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'

export default function VideoScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const [video, setVideo] = useState(null)
  const [relatedVideos, setRelatedVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const scrollY = useRef(new Animated.Value(0)).current
  const { width } = Dimensions.get('window')
  
  // State for interactive elements
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    loadVideoData()
  }, [params.id])

  const loadVideoData = async () => {
    try {
      const allVideos = await getAggregatedContent()
      const videoData = allVideos.find(v => v.id === params.id)

      if (videoData) {
        // Format video URL for YouTube embeds
        let videoUrl = videoData.videoUrl
        if (!videoUrl.includes('embed')) {
          const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()
          videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1`
        }
        
        // Set random like/dislike counts for demo
        setLikeCount(Math.floor(Math.random() * 10000))
        setDislikeCount(Math.floor(Math.random() * 1000))
        
        setVideo({ ...videoData, videoUrl })
        setRelatedVideos(allVideos.filter(v => v.id !== params.id).slice(0, 5))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [-50, 0],
    extrapolate: 'clamp',
  })

  // Handle like button press
  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      setIsLiked(true)
      setLikeCount(prev => prev + 1)
      // If previously disliked, remove dislike
      if (isDisliked) {
        setIsDisliked(false)
        setDislikeCount(prev => prev - 1)
      }
    }
  }

  // Handle dislike button press
  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false)
      setDislikeCount(prev => prev - 1)
    } else {
      setIsDisliked(true)
      setDislikeCount(prev => prev + 1)
      // If previously liked, remove like
      if (isLiked) {
        setIsLiked(false)
        setLikeCount(prev => prev - 1)
      }
    }
  }

  // Handle share button press
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this video: ${video?.title} - ${video?.videoUrl}`,
        title: video?.title,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared with activity type: ${result.activityType}`);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share the video');
    }
  }

  // Handle download button press
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant permission to download videos');
        setIsDownloading(false);
        return;
      }
      
      // Get video ID from URL
      let videoId = '';
      if (video?.videoUrl.includes('youtube.com/embed/')) {
        videoId = video.videoUrl.split('youtube.com/embed/')[1].split('?')[0];
      } else if (video?.videoUrl.includes('youtube.com/watch?v=')) {
        videoId = video.videoUrl.split('v=')[1].split('&')[0];
      } else if (video?.videoUrl.includes('youtu.be/')) {
        videoId = video.videoUrl.split('youtu.be/')[1].split('?')[0];
      }
      
      if (!videoId) {
        Alert.alert('Error', 'Could not extract video ID');
        setIsDownloading(false);
        return;
      }
      
      // Create a unique filename
      const timestamp = new Date().getTime();
      const filename = `${videoId}_${timestamp}.mp4`;
      
      // For demo purposes, we'll use a placeholder URL
      // In a real app, you would use a proper video download URL
      const downloadUrl = `https://example.com/download/${videoId}`;
      
      // Create a download directory if it doesn't exist
      const downloadDir = `${FileSystem.documentDirectory}downloads/`;
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }
      
      const fileUri = `${downloadDir}${filename}`;
      
      // Start the download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );
      
      // For demo purposes, we'll simulate a download since we can't actually download YouTube videos
      // In a real app, you would use the downloadResumable.downloadAsync() method
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        setDownloadProgress(progress);
        
        if (progress >= 1) {
          clearInterval(interval);
          
          // Save to media library
          MediaLibrary.saveToLibraryAsync(fileUri)
            .then(() => {
              setIsDownloading(false);
              setDownloadProgress(0);
              Alert.alert('Success', 'Video downloaded successfully');
            })
            .catch(error => {
              console.error('Error saving to media library:', error);
              Alert.alert('Error', 'Failed to save video to media library');
              setIsDownloading(false);
            });
        }
      }, 300);
      
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert('Error', 'Failed to download the video');
      setIsDownloading(false);
    }
  }

  // Handle subscribe button press
  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    Alert.alert(
      isSubscribed ? 'Unsubscribed' : 'Subscribed',
      isSubscribed 
        ? `You have unsubscribed from ${video?.channelName}` 
        : `You have subscribed to ${video?.channelName}`
    );
  }

  // Handle bookmark button press
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Removed from Bookmarks' : 'Added to Bookmarks',
      isBookmarked 
        ? `${video?.title} has been removed from your bookmarks` 
        : `${video?.title} has been added to your bookmarks`
    );
  }

  const renderHeader = () => {
    return (
      <Animated.View style={[
        styles.header,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }]
        }
      ]}>
        <BlurView intensity={80} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome5 name="arrow-left" size={18} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {video?.title || 'Video'}
            </Text>
            <TouchableOpacity style={styles.moreButton}>
              <FontAwesome5 name="ellipsis-v" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    )
  }

  const renderTabs = () => {
    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'info' && styles.activeTab]} 
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Info</Text>
          {activeTab === 'info' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'related' && styles.activeTab]} 
          onPress={() => setActiveTab('related')}
        >
          <Text style={[styles.tabText, activeTab === 'related' && styles.activeTabText]}>Related</Text>
          {activeTab === 'related' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'comments' && styles.activeTab]} 
          onPress={() => setActiveTab('comments')}
        >
          <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>Comments</Text>
          {activeTab === 'comments' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
    )
  }

  const renderInfoContent = () => {
    return (
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{video?.title}</Text>
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={handleBookmark}
          >
            <FontAwesome5 
              name={isBookmarked ? "bookmark" : "bookmark"} 
              size={18} 
              color={isBookmarked ? "#00E0FF" : "#AAA"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.channelRow}>
          <View style={styles.channelInfo}>
            <View style={styles.channelAvatar}>
              <Text style={styles.channelInitial}>{video?.channelName?.charAt(0) || 'C'}</Text>
            </View>
            <View>
              <Text style={styles.channelName}>{video?.channelName}</Text>
              <Text style={styles.subscriberCount}>1.2M subscribers</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[
              styles.subscribeButton,
              isSubscribed && styles.subscribedButton
            ]}
            onPress={handleSubscribe}
          >
            <Text style={[
              styles.subscribeText,
              isSubscribed && styles.subscribedText
            ]}>
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24.5K</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{likeCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dislikeCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Dislikes</Text>
          </View>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
          >
            <FontAwesome5 
              name="thumbs-up" 
              size={16} 
              color={isLiked ? "#00E0FF" : "#FFF"} 
            />
            <Text style={[
              styles.actionText,
              isLiked && styles.activeActionText
            ]}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDislike}
          >
            <FontAwesome5 
              name="thumbs-down" 
              size={16} 
              color={isDisliked ? "#FF6B6B" : "#FFF"} 
            />
            <Text style={[
              styles.actionText,
              isDisliked && styles.dislikeActionText
            ]}>Dislike</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <FontAwesome5 name="share" size={16} color="#FFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <View style={styles.downloadProgressContainer}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.downloadProgressText}>
                  {Math.round(downloadProgress * 100)}%
                </Text>
              </View>
            ) : (
              <FontAwesome5 name="download" size={16} color="#FFF" />
            )}
            <Text style={styles.actionText}>
              {isDownloading ? 'Downloading' : 'Download'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{video?.description || 'No description available.'}</Text>
        </View>
      </View>
    )
  }

  const renderRelatedContent = () => {
    return (
      <View style={styles.relatedContainer}>
        <Text style={styles.sectionTitle}>Related Videos</Text>
        {relatedVideos.map(video => (
          <ModernVideoCard
            key={video.id}
            video={video}
            onPress={() => router.push(`/video/${video.id}`)}
            style={styles.videoCard}
          />
        ))}
      </View>
    )
  }

  const renderCommentsContent = () => {
    return (
      <View style={styles.commentsContainer}>
        <View style={styles.commentInputContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>U</Text>
          </View>
          <View style={styles.commentInputWrapper}>
            <Text style={styles.commentInputPlaceholder}>Add a comment...</Text>
          </View>
        </View>
        
        <View style={styles.commentItem}>
          <View style={styles.commentAvatar}>
            <Text style={styles.userInitial}>J</Text>
          </View>
          <View style={styles.commentContent}>
            <Text style={styles.commentUsername}>John Doe</Text>
            <Text style={styles.commentText}>This video was really helpful! Thanks for sharing.</Text>
            <View style={styles.commentActions}>
              <Text style={styles.commentTime}>2 days ago</Text>
              <TouchableOpacity>
                <Text style={styles.commentAction}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.commentAction}>Like</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.commentItem}>
          <View style={styles.commentAvatar}>
            <Text style={styles.userInitial}>S</Text>
            </View>
                    <View style={styles.commentContent}>
            <Text style={styles.commentUsername}>Sarah Smith</Text>
            <Text style={styles.commentText}>I've been looking for this information for a long time. Great explanation!</Text>
                      <View style={styles.commentActions}>
              <Text style={styles.commentTime}>1 week ago</Text>
              <TouchableOpacity>
                <Text style={styles.commentAction}>Reply</Text>
                        </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.commentAction}>Like</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00E0FF" />
                </View>
    )
  }

  if (!video) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Video not found</Text>
              </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <VideoPlayer
          videoUrl={video.videoUrl}
          title={video.title}
          channelName={video.channelName}
          autoPlay={true}
        />
        
        {renderTabs()}
        
        {activeTab === 'info' && renderInfoContent()}
        {activeTab === 'related' && renderRelatedContent()}
        {activeTab === 'comments' && renderCommentsContent()}
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001E3C",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001E3C",
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 10,
  },
  headerBlur: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#002B4D',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00E0FF',
  },
  tabText: {
    color: '#AAA',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 3,
    backgroundColor: '#00E0FF',
    borderRadius: 1.5,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#002B4D",
    borderRadius: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
    marginRight: 16,
    letterSpacing: 0.5,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 224, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00E0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  channelInitial: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  channelName: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "500",
  },
  subscriberCount: {
    fontSize: 12,
    color: "#AAA",
  },
  subscribeButton: {
    backgroundColor: '#00E0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 6,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#FFF",
    lineHeight: 24,
    opacity: 0.9,
  },
  relatedContainer: {
    padding: 16,
    backgroundColor: "#002B4D",
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  videoCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    padding: 20,
  },
  commentsContainer: {
    padding: 16,
    backgroundColor: "#002B4D",
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00E0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentInputWrapper: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commentInputPlaceholder: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#14BF96',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    color: '#AAA',
    marginRight: 16,
  },
  commentAction: {
    fontSize: 12,
    color: '#AAA',
    marginRight: 16,
  },
  // Add new styles for interactive elements
  subscribedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscribedText: {
    color: '#FFF',
  },
  activeActionText: {
    color: '#00E0FF',
  },
  dislikeActionText: {
    color: '#FF6B6B',
  },
  downloadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadProgressText: {
    color: '#FFF',
    fontSize: 10,
    marginLeft: 4,
  },
})