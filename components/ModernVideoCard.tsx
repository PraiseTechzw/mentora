"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Pressable, ActivityIndicator, Platform } from "react-native"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { AggregatedVideo } from "../types/videoag"

interface ModernVideoCardProps {
  video: AggregatedVideo
  onPress: () => void
  style?: object
}

export function ModernVideoCard({ video, onPress, style }: ModernVideoCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "youtube":
        return "youtube"
      case "udemy":
        return "chalkboard-teacher"
      case "coursera":
        return "graduation-cap"
      case "khan":
        return "university"
      case "edx":
        return "book"
      case "pluralsight":
        return "code"
      case "linkedin":
        return "linkedin"
      case "mit":
        return "flask"
      case "openlearn":
        return "open-book"
      case "futurelearn":
        return "rocket"
      case "alison":
        return "certificate"
      default:
        return "play-circle"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "youtube":
        return "#FF0000"
      case "udemy":
        return "#A435F0"
      case "coursera":
        return "#0056D2"
      case "khan":
        return "#14BF96"
      case "edx":
        return "#02262B"
      case "pluralsight":
        return "#F15B2A"
      case "linkedin":
        return "#0077B5"
      case "mit":
        return "#8A8B8C"
      case "openlearn":
        return "#2A73CC"
      case "futurelearn":
        return "#DE0A43"
      case "alison":
        return "#00A4A4"
      default:
        return "#FF6B6B"
    }
  }

  const handleLongPress = () => {
    setShowOptions(true)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (e) {
      return dateString
    }
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.container, isPressed && styles.pressed, style]}
    >
      <View style={styles.thumbnailContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        )}
        
        <Image 
          source={video.thumbnail} 
          style={[styles.thumbnail, imageLoading && styles.hiddenImage]} 
          contentFit="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
        />
        
        {!imageError && (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        )}
        
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <FontAwesome5 name="play" size={16} color="#FFF" />
          </View>
        </View>
        
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        
        <View style={[styles.sourceBadge, { backgroundColor: getSourceColor(video.source) }]}>
          <FontAwesome5 name={getSourceIcon(video.source)} size={10} color="#FFF" />
        </View>
        
        {video.isFree && (
          <View style={styles.freeBadge}>
            <FontAwesome5 name="gift" size={10} color="#FFF" />
            <Text style={styles.freeText}>FREE</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        
        <View style={styles.metadataRow}>
          <Text style={styles.channelName}>{video.channelName}</Text>
          
          {video.rating && (
            <View style={styles.ratingContainer}>
              <FontAwesome5 name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{video.rating}</Text>
            </View>
          )}
        </View>
        
        {(video.instructor || video.institution) && (
          <View style={styles.instructorRow}>
            {video.instructor && (
              <View style={styles.instructorContainer}>
                <FontAwesome5 name="user-tie" size={10} color="#666" />
                <Text style={styles.instructorText} numberOfLines={1}>{video.instructor}</Text>
              </View>
            )}
            
            {video.institution && (
              <View style={styles.institutionContainer}>
                <FontAwesome5 name="university" size={10} color="#666" />
                <Text style={styles.institutionText} numberOfLines={1}>{video.institution}</Text>
              </View>
            )}
          </View>
        )}
        
        <Text style={styles.metadata}>
          {video.views} views • {formatDate(video.publishedAt)}
        </Text>
        
        {video.categories && video.categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            {video.categories.slice(0, 2).map((category, index) => (
              <View key={index} style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
            {video.categories.length > 2 && (
              <Text style={styles.moreCategoriesText}>+{video.categories.length - 2}</Text>
            )}
          </View>
        )}
      </View>

      {showOptions && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.optionsOverlay}>
          <Pressable style={styles.overlayBackground} onPress={() => setShowOptions(false)}>
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton}>
                <FontAwesome5 name="clock" size={16} color="#333" />
                <Text style={styles.optionText}>Watch Later</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <FontAwesome5 name="list" size={16} color="#333" />
                <Text style={styles.optionText}>Add to Playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <FontAwesome5 name="download" size={16} color="#333" />
                <Text style={styles.optionText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <FontAwesome5 name="share" size={16} color="#333" />
                <Text style={styles.optionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <FontAwesome5 name="ban" size={16} color="#333" />
                <Text style={styles.optionText}>Not Interested</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </Pressable>
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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  thumbnailContainer: {
    position: "relative",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  hiddenImage: {
    opacity: 0,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  playButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 3,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  sourceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  freeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 3,
  },
  freeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
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
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  channelName: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  instructorRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    flex: 1,
  },
  instructorText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  institutionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  institutionText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  metadata: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: "#666",
  },
  moreCategoriesText: {
    fontSize: 10,
    color: "#999",
    alignSelf: "center",
  },
  optionsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: "80%",
    padding: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
  },
})
