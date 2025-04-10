import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { Image } from "expo-image"

interface VideoCardProps {
  video: {
    id: string
    title: string
    thumbnail: string
    channel: string
    views: string
    date: string
    duration: string
  }
  onPress: () => void
}

export function VideoCard({ video, onPress }: VideoCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        <Image source={video.thumbnail} style={styles.thumbnail} contentFit="cover" />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.channelName}>{video.channel}</Text>
        <Text style={styles.metadata}>
          {video.views} views • {video.date}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginBottom: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  channelName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  metadata: {
    fontSize: 12,
    color: "#999",
  },
})
