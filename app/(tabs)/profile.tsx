import { useState, useCallback } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert, RefreshControl, Image as RNImage } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import * as ImagePicker from "expo-image-picker"

// Mock user data
const USER = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  bio: "Passionate about learning and sharing knowledge",
  location: "San Francisco, CA",
  joinDate: "January 2023",
  courses: 24,
  hours: 156,
  certificates: 12,
  streak: 7,
  level: "Advanced",
  xp: 1250,
  nextLevel: 2000,
  weeklyGoal: 12,
  weeklyProgress: 8.5,
  monthlyGoal: 40,
  monthlyProgress: 28,
  achievements: [
    { id: "1", name: "Fast Learner", icon: "award", color: "#4361EE", unlocked: true },
    { id: "2", name: "7 Day Streak", icon: "fire", color: "#F72585", unlocked: true },
    { id: "3", name: "Certified", icon: "certificate", color: "#4CC9F0", unlocked: true },
    { id: "4", name: "Night Owl", icon: "moon", color: "#7209B7", unlocked: false },
    { id: "5", name: "Social Butterfly", icon: "users", color: "#3A0CA3", unlocked: false },
    { id: "6", name: "Perfect Score", icon: "star", color: "#F72585", unlocked: false },
  ],
  recentActivity: [
    { id: "1", type: "course", title: "Advanced React Patterns", date: "2 hours ago", icon: "book" },
    { id: "2", type: "certificate", title: "JavaScript Mastery", date: "Yesterday", icon: "certificate" },
    { id: "3", type: "achievement", title: "7 Day Streak", date: "3 days ago", icon: "fire" },
  ],
  skills: ["JavaScript", "React", "Node.js", "TypeScript", "Python"],
  interests: ["Web Development", "Mobile Apps", "Data Science", "UI/UX Design"],
}

export default function ProfileScreen() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [downloadOverWifiOnly, setDownloadOverWifiOnly] = useState(true)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "This feature will be available soon!")
  }

  const handleChangeAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant permission to access your photos")
        return
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      
      if (!result.canceled) {
        // In a real app, you would upload the image to your server
        Alert.alert("Success", "Profile picture updated successfully!")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile picture")
    }
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            // In a real app, you would clear auth tokens and navigate to login
            Alert.alert("Logged out", "You have been successfully logged out")
          }
        }
      ]
    )
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <Image
          source={USER.avatar}
          style={styles.profileImage}
          contentFit="cover"
        />
        <TouchableOpacity style={styles.changeAvatarButton} onPress={handleChangeAvatar}>
          <Ionicons name="camera" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.name}>{USER.name}</Text>
      <Text style={styles.email}>{USER.email}</Text>
      <Text style={styles.bio}>{USER.bio}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.location}>{USER.location}</Text>
      </View>
      <Text style={styles.joinDate}>Member since {USER.joinDate}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{USER.courses}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{USER.hours}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{USER.certificates}</Text>
          <Text style={styles.statLabel}>Certificates</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  )

  const renderLevelProgress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Level Progress</Text>
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {USER.level}</Text>
          </View>
          <Text style={styles.xpText}>{USER.xp} / {USER.nextLevel} XP</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${(USER.xp / USER.nextLevel) * 100}%` }]} />
        </View>
        <Text style={styles.xpToNext}>{(USER.nextLevel - USER.xp)} XP to next level</Text>
      </View>
    </View>
  )

  const renderLearningProgress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Learning Progress</Text>
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>This Week</Text>
          <Text style={styles.progressValue}>{USER.weeklyProgress} hours</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(USER.weeklyProgress / USER.weeklyGoal) * 100}%` }]} />
        </View>
        <Text style={styles.progressTarget}>Target: {USER.weeklyGoal} hours</Text>
      </View>
      
      <View style={[styles.progressCard, styles.monthlyProgressCard]}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>This Month</Text>
          <Text style={styles.progressValue}>{USER.monthlyProgress} hours</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(USER.monthlyProgress / USER.monthlyGoal) * 100}%` }]} />
        </View>
        <Text style={styles.progressTarget}>Target: {USER.monthlyGoal} hours</Text>
      </View>
    </View>
  )

  const renderAchievements = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
          <Text style={styles.seeAllButton}>{showAllAchievements ? "Show Less" : "See All"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.achievementsContainer}>
        {USER.achievements.slice(0, showAllAchievements ? undefined : 3).map((achievement) => (
          <View key={achievement.id} style={styles.achievementItem}>
            <View style={[styles.achievementIcon, { backgroundColor: achievement.color, opacity: achievement.unlocked ? 1 : 0.5 }]}>
              <FontAwesome5 name={achievement.icon} size={24} color="#FFF" />
            </View>
            <Text style={[styles.achievementName, !achievement.unlocked && styles.lockedAchievement]}>
              {achievement.name}
            </Text>
            {!achievement.unlocked && (
              <Text style={styles.lockedText}>Locked</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  )

  const renderRecentActivity = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => setShowAllActivity(!showAllActivity)}>
          <Text style={styles.seeAllButton}>{showAllActivity ? "Show Less" : "See All"}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.activityContainer}>
        {USER.recentActivity.slice(0, showAllActivity ? undefined : 3).map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <FontAwesome5 name={activity.icon} size={16} color="#FFF" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  const renderSkills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsContainer}>
        {USER.skills.map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderInterests = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interests</Text>
      <View style={styles.interestsContainer}>
        {USER.interests.map((interest, index) => (
          <View key={index} style={styles.interestBadge}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account Settings</Text>
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome5 name="bell" size={18} color="#666" />
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#EAEAEA", true: "#FF6B6B" }}
            thumbColor="#FFF"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome5 name="moon" size={18} color="#666" />
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: "#EAEAEA", true: "#FF6B6B" }}
            thumbColor="#FFF"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome5 name="download" size={18} color="#666" />
          <Text style={styles.settingText}>Downloads</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#CCC" style={styles.settingArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome5 name="wifi" size={18} color="#666" />
          <Text style={styles.settingText}>Download over Wi-Fi only</Text>
          <Switch
            value={downloadOverWifiOnly}
            onValueChange={setDownloadOverWifiOnly}
            trackColor={{ false: "#EAEAEA", true: "#FF6B6B" }}
            thumbColor="#FFF"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome5 name="shield-alt" size={18} color="#666" />
          <Text style={styles.settingText}>Privacy</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#CCC" style={styles.settingArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome5 name="question-circle" size={18} color="#666" />
          <Text style={styles.settingText}>Help & Support</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#CCC" style={styles.settingArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <FontAwesome5 name="cog" size={18} color="#666" />
          <Text style={styles.settingText}>Preferences</Text>
          <FontAwesome5 name="chevron-right" size={16} color="#CCC" style={styles.settingArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={18} color="#FF6B6B" />
          <Text style={[styles.settingText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderLevelProgress()}
        {renderLearningProgress()}
        {renderAchievements()}
        {renderRecentActivity()}
        {renderSkills()}
        {renderInterests()}
        {renderSettings()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 32,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#EAEAEA",
  },
  editButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  levelCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  xpText: {
    fontSize: 14,
    color: "#666",
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    marginBottom: 8,
  },
  xpBar: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  xpToNext: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  monthlyProgressCard: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#EAEAEA",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  progressTarget: {
    fontSize: 14,
    color: "#666",
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementItem: {
    alignItems: "center",
    width: "30%",
    marginBottom: 16,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  lockedAchievement: {
    color: "#999",
  },
  lockedText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  activityContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: "#999",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillBadge: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: "#333",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestBadge: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: "#FF6B6B",
  },
  settingsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
    flex: 1,
  },
  settingArrow: {
    marginLeft: "auto",
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#FF6B6B",
  },
})
