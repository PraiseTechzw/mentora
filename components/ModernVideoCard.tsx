"use client"

import React, { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Pressable, ActivityIndicator, Platform } from "react-native"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated"
import { AggregatedVideo } from "../types/videoag"
import { BlurView } from "expo-blur"

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
  const [isHovered, setIsHovered] = useState(false)
  const scaleAnim = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isHovered ? 1.02 : 1) }]
  }))

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

  const handlePress = () => {
    console.log('Video card pressed:', {
      id: video.id,
      title: video.title,
      source: video.source,
      videoUrl: video.videoUrl
    });
    onPress?.();
  };

  const handleLongPress = () => {
    console.log('Video card long pressed:', {
      id: video.id,
      title: video.title
    });
    setShowOptions(true)
  }

  const handleImageLoad = () => {
    console.log('Thumbnail loaded:', {
      id: video.id,
      thumbnail: video.thumbnail
    });
    setImageLoading(false)
  }

  const handleImageError = () => {
    console.error('Thumbnail load failed:', {
      id: video.id,
      thumbnail: video.thumbnail
    });
    setImageError(true)
    setImageLoading(false)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch (e) {
      return dateString
    }
  }

  const formatViews = (views: string) => {
    const num = parseInt(views)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return views
  }

  return (
    <Animated.View style={[scaleAnim]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={() => {
          setIsPressed(true)
          setIsHovered(true)
        }}
        onPressOut={() => {
          setIsPressed(false)
          setIsHovered(false)
        }}
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
            onLoadEnd={handleImageLoad}
            onError={handleImageError}
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
            <Animated.View 
              style={[
                styles.playButton,
                { transform: [{ scale: isHovered ? 1.1 : 1 }] }
              ]}
            >
              <FontAwesome5 name="play" size={16} color="#FFF" />
            </Animated.View>
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
          
          <View style={styles.metadataContainer}>
            <Text style={styles.metadata}>
              {formatViews(video.views)} views • {formatDate(video.publishedAt)}
            </Text>
            {video.price && (
              <Text style={styles.priceText}>
                {video.isFree ? "Free" : `$${video.price}`}
              </Text>
            )}
          </View>
          
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
          <Animated.View 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(200)} 
            style={styles.optionsOverlay}
          >
            <BlurView intensity={50} style={styles.overlayBackground}>
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
            </BlurView>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#002B4D",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: "#001E3C",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
  hiddenImage: {
    opacity: 0,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001E3C",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  playButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 224, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00E0FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  durationBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  sourceBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  freeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#14BF96",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#14BF96",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  freeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 4,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 22,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  channelName: {
    color: "#AAA",
    fontSize: 14,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  instructorRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  instructorText: {
    color: "#AAA",
    fontSize: 12,
    marginLeft: 4,
  },
  institutionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  institutionText: {
    color: "#AAA",
    fontSize: 12,
    marginLeft: 4,
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metadata: {
    color: "#AAA",
    fontSize: 12,
  },
  priceText: {
    color: "#14BF96",
    fontSize: 14,
    fontWeight: "bold",
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
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    width: "80%",
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
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
