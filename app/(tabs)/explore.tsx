"use client"

import { useState } from "react"
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"

import { SearchBar } from "../../components/SearchBar"

// Mock categories with icons and course counts
const CATEGORIES = [
  { id: "1", name: "Programming", icon: "laptop-code", count: 245, color: "#4361EE" },
  { id: "2", name: "Mathematics", icon: "square-root-alt", count: 189, color: "#3A0CA3" },
  { id: "3", name: "Science", icon: "flask", count: 312, color: "#7209B7" },
  { id: "4", name: "History", icon: "landmark", count: 156, color: "#F72585" },
  { id: "5", name: "Languages", icon: "language", count: 201, color: "#4CC9F0" },
  { id: "6", name: "Arts", icon: "paint-brush", count: 124, color: "#F77F00" },
  { id: "7", name: "Business", icon: "chart-line", count: 178, color: "#4D908E" },
  { id: "8", name: "Health", icon: "heartbeat", count: 143, color: "#F94144" },
]

// Mock trending courses
const TRENDING_COURSES = [
  {
    id: "1",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Andrew Smith",
    thumbnail: "https://i.ytimg.com/vi/NWONeJKn6kc/maxresdefault.jpg",
    rating: 4.8,
    students: 12453,
  },
  {
    id: "2",
    title: "Complete Web Development Bootcamp",
    instructor: "Jessica Chen",
    thumbnail: "https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
    rating: 4.9,
    students: 28941,
  },
  {
    id: "3",
    title: "Financial Literacy: Master Your Money",
    instructor: "Robert Kiyosaki",
    thumbnail: "https://i.ytimg.com/vi/KCzIfiLZK7w/maxresdefault.jpg",
    rating: 4.7,
    students: 9872,
  },
]

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("")

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <FontAwesome5 name={item.icon} size={24} color="#FFF" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count} courses</Text>
    </TouchableOpacity>
  )

  const renderTrendingCourse = ({ item }) => (
    <TouchableOpacity style={styles.trendingCourse}>
      <Image source={item.thumbnail} style={styles.courseThumbnail} contentFit="cover" />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        <View style={styles.ratingContainer}>
          <FontAwesome5 name="star" solid size={14} color="#FFD700" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.students.toLocaleString()} students)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>Explore</Text>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search for topics, courses, or instructors"
      />

      <Text style={styles.sectionTitle}>Browse Categories</Text>
      <FlatList
        data={CATEGORIES}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />

      <Text style={styles.sectionTitle}>Trending Courses</Text>
      <FlatList
        data={TRENDING_COURSES}
        renderItem={renderTrendingCourse}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.trendingList}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
    color: "#333",
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryItem: {
    width: 120,
    marginRight: 12,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: "#666",
  },
  trendingList: {
    paddingVertical: 8,
  },
  trendingCourse: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseThumbnail: {
    width: 120,
    height: 90,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
})
