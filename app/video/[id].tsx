import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Animated, Dimensions, StatusBar, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { getAggregatedContent } from "../../services/content-aggregator"
import VideoPlayer from "../../components/ModernVideoPlayer"
import { FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import * as ScreenOrientation from 'expo-screen-orientation'

export default function VideoScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const [video, setVideo] = useState(null)
  const [relatedVideos, setRelatedVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const scrollY = useRef(new Animated.Value(0)).current
  const { width, height } = Dimensions.get('window')

  useEffect(() => {
    loadVideoData()
    
    // Set initial orientation to portrait
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    
    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const isPortraitMode = window.width < window.height
      if (!isPortraitMode && !isFullscreen) {
        // If device is in landscape but not in fullscreen mode, update state
        setIsFullscreen(true)
      } else if (isPortraitMode && isFullscreen) {
        // If device is in portrait but in fullscreen mode, update state
        setIsFullscreen(false)
      }
    })
    
    return () => {
      subscription.remove()
      // Reset orientation to portrait when component unmounts
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    }
  }, [isFullscreen])

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

  const renderHeader = () => {
    if (isFullscreen) return null
    
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
    if (isFullscreen) return null
    
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
    if (isFullscreen) return null
    
    return (
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{video?.title}</Text>
          <TouchableOpacity style={styles.bookmarkButton}>
            <FontAwesome5 name="bookmark" size={18} color="#00E0FF" />
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
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24.5K</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1.2K</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="thumbs-up" size={16} color="#FFF" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="thumbs-down" size={16} color="#FFF" />
            <Text style={styles.actionText}>Dislike</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="share" size={16} color="#FFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="download" size={16} color="#FFF" />
            <Text style={styles.actionText}>Download</Text>
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
    if (isFullscreen) return null
    
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
    if (isFullscreen) return null
    
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
      <StatusBar 
        barStyle={isFullscreen ? "light-content" : "dark-content"} 
        backgroundColor={isFullscreen ? "#000" : "#001E3C"}
        hidden={isFullscreen}
      />
      {renderHeader()}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        scrollEnabled={!isFullscreen}
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
})