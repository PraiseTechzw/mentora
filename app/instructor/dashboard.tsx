"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"

import { getInstructorSubmissions, type ContentSubmission } from "../../services/content-service"

export default function InstructorDashboardScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would use the logged-in instructor's ID
      const instructorSubmissions = await getInstructorSubmissions("123")
      setSubmissions(instructorSubmissions)
    } catch (error) {
      console.error("Error loading submissions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for charts
  const viewsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#FF6B6B",
    },
  }

  const renderSubmissionItem = ({ item }: { item: ContentSubmission }) => (
    <View style={styles.submissionItem}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.submissionThumbnail} contentFit="cover" />
      <View style={styles.submissionInfo}>
        <Text style={styles.submissionTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.submissionMeta}>
          <Text style={styles.submissionDate}>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </View>
  )

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return styles.approvedStatus
      case "rejected":
        return styles.rejectedStatus
      default:
        return styles.pendingStatus
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instructor Dashboard</Text>
        <TouchableOpacity onPress={() => router.push("/instructor/upload")} style={styles.uploadButton}>
          <FontAwesome5 name="plus" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "content" && styles.activeTab]}
          onPress={() => setActiveTab("content")}
        >
          <Text style={[styles.tabText, activeTab === "content" && styles.activeTabText]}>Content</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "analytics" && styles.activeTab]}
          onPress={() => setActiveTab("analytics")}
        >
          <Text style={[styles.tabText, activeTab === "analytics" && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "overview" && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1.2K</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Subscribers</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Performance</Text>
            <LineChart
              data={viewsData}
              width={Dimensions.get("window").width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Submissions</Text>
            {submissions.length > 0 ? (
              submissions.slice(0, 3).map((submission) => (
                <View key={submission.id} style={styles.submissionItem}>
                  <Image
                    source={{ uri: submission.thumbnailUrl }}
                    style={styles.submissionThumbnail}
                    contentFit="cover"
                  />
                  <View style={styles.submissionInfo}>
                    <Text style={styles.submissionTitle} numberOfLines={2}>
                      {submission.title}
                    </Text>
                    <View style={styles.submissionMeta}>
                      <Text style={styles.submissionDate}>
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </Text>
                      <View style={[styles.statusBadge, getStatusStyle(submission.status)]}>
                        <Text style={styles.statusText}>{submission.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No submissions yet</Text>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tips for Instructors</Text>
            <View style={styles.tipCard}>
              <FontAwesome5 name="lightbulb" size={24} color="#FF6B6B" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Keep your videos concise and focused on a single topic to maintain viewer engagement.
              </Text>
            </View>
            <View style={styles.tipCard}>
              <FontAwesome5 name="lightbulb" size={24} color="#FF6B6B" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Use clear titles and thumbnails that accurately represent your content to attract the right audience.
              </Text>
            </View>
            <View style={styles.tipCard}>
              <FontAwesome5 name="lightbulb" size={24} color="#FF6B6B" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Respond to comments and questions to build a community around your educational content.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === "content" && (
        <FlatList
          data={submissions}
          renderItem={renderSubmissionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="video-slash" size={48} color="#CCC" />
              <Text style={styles.emptyTitle}>No Content Yet</Text>
              <Text style={styles.emptyText}>Start uploading educational videos to grow your audience</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/instructor/upload")}>
                <Text style={styles.emptyButtonText}>Upload New Content</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {activeTab === "analytics" && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Views Over Time</Text>
            <LineChart
              data={viewsData}
              width={Dimensions.get("window").width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Audience Demographics</Text>
            <View style={styles.demographicsContainer}>
              <View style={styles.demographicItem}>
                <View style={styles.demographicBar}>
                  <View style={[styles.demographicFill, { width: "65%" }]} />
                </View>
                <Text style={styles.demographicLabel}>18-24</Text>
                <Text style={styles.demographicValue}>65%</Text>
              </View>
              <View style={styles.demographicItem}>
                <View style={styles.demographicBar}>
                  <View style={[styles.demographicFill, { width: "25%" }]} />
                </View>
                <Text style={styles.demographicLabel}>25-34</Text>
                <Text style={styles.demographicValue}>25%</Text>
              </View>
              <View style={styles.demographicItem}>
                <View style={styles.demographicBar}>
                  <View style={[styles.demographicFill, { width: "8%" }]} />
                </View>
                <Text style={styles.demographicLabel}>35-44</Text>
                <Text style={styles.demographicValue}>8%</Text>
              </View>
              <View style={styles.demographicItem}>
                <View style={styles.demographicBar}>
                  <View style={[styles.demographicFill, { width: "2%" }]} />
                </View>
                <Text style={styles.demographicLabel}>45+</Text>
                <Text style={styles.demographicValue}>2%</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Top Performing Content</Text>
            <View style={styles.topContentItem}>
              <Text style={styles.topContentRank}>1</Text>
              <Image
                source="https://i.ytimg.com/vi/0-S5a0eXPoc/maxresdefault.jpg"
                style={styles.topContentThumbnail}
                contentFit="cover"
              />
              <View style={styles.topContentInfo}>
                <Text style={styles.topContentTitle} numberOfLines={2}>
                  Introduction to React Native
                </Text>
                <Text style={styles.topContentStats}>450 views • 45 likes</Text>
              </View>
            </View>
            <View style={styles.topContentItem}>
              <Text style={styles.topContentRank}>2</Text>
              <Image
                source="https://i.ytimg.com/vi/W6NZfCO5SIk/maxresdefault.jpg"
                style={styles.topContentThumbnail}
                contentFit="cover"
              />
              <View style={styles.topContentInfo}>
                <Text style={styles.topContentTitle} numberOfLines={2}>
                  JavaScript Fundamentals for Beginners
                </Text>
                <Text style={styles.topContentStats}>320 views • 38 likes</Text>
              </View>
            </View>
            <View style={styles.topContentItem}>
              <Text style={styles.topContentRank}>3</Text>
              <Image
                source="https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg"
                style={styles.topContentThumbnail}
                contentFit="cover"
              />
              <View style={styles.topContentInfo}>
                <Text style={styles.topContentTitle} numberOfLines={2}>
                  Python Crash Course
                </Text>
                <Text style={styles.topContentStats}>280 views • 32 likes</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  uploadButton: {
    backgroundColor: "#FF6B6B",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B6B",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#FF6B6B",
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 16,
    marginVertical: 8,
  },
  submissionItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submissionThumbnail: {
    width: 120,
    height: 80,
  },
  submissionInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  submissionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  submissionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submissionDate: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingStatus: {
    backgroundColor: "#FFF3CD",
  },
  approvedStatus: {
    backgroundColor: "#D4EDDA",
  },
  rejectedStatus: {
    backgroundColor: "#F8D7DA",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  tipCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIcon: {
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  demographicsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  demographicItem: {
    marginBottom: 16,
  },
  demographicBar: {
    height: 8,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    marginBottom: 8,
  },
  demographicFill: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  demographicLabel: {
    fontSize: 12,
    color: "#666",
    position: "absolute",
    left: 0,
    bottom: -4,
  },
  demographicValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    position: "absolute",
    right: 0,
    bottom: -4,
  },
  topContentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topContentRank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
    width: 24,
    textAlign: "center",
  },
  topContentThumbnail: {
    width: 80,
    height: 45,
    borderRadius: 4,
    marginHorizontal: 12,
  },
  topContentInfo: {
    flex: 1,
  },
  topContentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  topContentStats: {
    fontSize: 12,
    color: "#666",
  },
})
