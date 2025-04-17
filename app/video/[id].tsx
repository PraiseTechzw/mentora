
import { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ModernVideoCard } from "../../components/ModernVideoCard"
import { getAggregatedContent } from "../../services/content-aggregator"
import VideoPlayer from "../../components/ModernVideoPlayer"

export default function VideoScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const [video, setVideo] = useState(null)
  const [relatedVideos, setRelatedVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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
          videoUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1`
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
      <ScrollView>
        <VideoPlayer
          videoUrl={video.videoUrl}
          title={video.title}
          channelName={video.channelName}
          autoPlay={true}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.channelName}>{video.channelName}</Text>
          <Text style={styles.description}>{video.description}</Text>
        </View>

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
      </ScrollView>
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
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  channelName: {
    fontSize: 14,
    color: "#AAA",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#FFF",
    lineHeight: 20,
  },
  relatedContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  videoCard: {
    marginBottom: 16,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
  },
})