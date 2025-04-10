"use client"

import { useState } from "react"
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"
import { useRouter } from "expo-router"

// Mock data for saved courses and history
const SAVED_COURSES = [
  {
    id: "1",
    title: "Advanced React Patterns",
    instructor: "Kent C. Dodds",
    thumbnail: "https://i.ytimg.com/vi/WV0UUcSPk-0/maxresdefault.jpg",
    progress: 45,
    lastWatched: "2 days ago",
  },
  {
    id: "2",
    title: "Data Structures & Algorithms",
    instructor: "Gayle Laakmann McDowell",
    thumbnail: "https://i.ytimg.com/vi/RBSGKlAvoiM/maxresdefault.jpg",
    progress: 72,
    lastWatched: "1 week ago",
  },
  {
    id: "3",
    title: "Quantum Computing Explained",
    instructor: "Dr. Quantum",
    thumbnail: "https://i.ytimg.com/vi/JhHMJCUmq28/maxresdefault.jpg",
    progress: 18,
    lastWatched: "3 days ago",
  },
]

const WATCH_HISTORY = [
  {
    id: "1",
    title: "How to Build a Neural Network from Scratch",
    thumbnail: "https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg",
    watchedOn: "2 hours ago",
    duration: "28:45",
    watchedDuration: "28:45",
    completed: true,
  },
  {
    id: "2",
    title: "The Complete Guide to CSS Grid",
    thumbnail: "https://i.ytimg.com/vi/9zBsdzdE4sM/maxresdefault.jpg",
    watchedOn: "Yesterday",
    duration: "42:18",
    watchedDuration: "15:22",
    completed: false,
  },
  {
    id: "3",
    title: "Understanding Blockchain Technology",
    thumbnail: "https://i.ytimg.com/vi/SSo_EIwHSd4/maxresdefault.jpg",
    watchedOn: "3 days ago",
    duration: "1:05:30",
    watchedDuration: "1:05:30",
    completed: true,
  },
]

export default function LibraryScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("saved")

  const renderSavedCourse = ({ item }) => (
    <TouchableOpacity style={styles.courseItem} onPress={() => router.push(`/video/${item.id}`)}>
      <Image source={item.thumbnail} style={styles.thumbnail} contentFit="cover" />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}% completed</Text>
        </View>
        <Text style={styles.lastWatched}>Last watched {item.lastWatched}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => router.push(`/video/${item.id}`)}>
      <Image source={item.thumbnail} style={styles.historyThumbnail} contentFit="cover" />
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.historyMeta}>Watched {item.watchedOn}</Text>
        <View style={styles.historyProgress}>
          <Text style={styles.historyDuration}>
            {item.completed ? "Completed" : `Watched ${item.watchedDuration} of ${item.duration}`}
          </Text>
          {!item.completed && (
            <TouchableOpacity style={styles.resumeButton}>
              <Text style={styles.resumeText}>Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.screenTitle}>My Library</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "saved" && styles.activeTab]}
          onPress={() => setActiveTab("saved")}
        >
          <FontAwesome5
            name="bookmark"
            size={16}
            color={activeTab === "saved" ? "#FF6B6B" : "#666"}
            solid={activeTab === "saved"}
          />
          <Text style={[styles.tabText, activeTab === "saved" && styles.activeTabText]}>Saved Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <FontAwesome5 name="history" size={16} color={activeTab === "history" ? "#FF6B6B" : "#666"} />
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>Watch History</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "saved" ? (
        <FlatList
          data={SAVED_COURSES}
          renderItem={renderSavedCourse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={WATCH_HISTORY}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#EAEAEA",
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFF",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  courseItem: {
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
  thumbnail: {
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
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#EAEAEA",
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  lastWatched: {
    fontSize: 12,
    color: "#999",
  },
  historyItem: {
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
  historyThumbnail: {
    width: 120,
    height: 90,
  },
  historyInfo: {
    flex: 1,
    padding: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  historyProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyDuration: {
    fontSize: 12,
    color: "#666",
  },
  resumeButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resumeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
})
