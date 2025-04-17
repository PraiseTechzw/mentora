import { useState, useCallback, useRef, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Platform, Alert, RefreshControl, Image as RNImage, Animated, Dimensions, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import * as ImagePicker from "expo-image-picker"
import { useUser } from "../../contexts/UserContext"
import { useSettings } from "../../contexts/SettingsContext"
import { getUserData } from "../../services/user-service"

// Mock data for achievements and other UI elements
const ACHIEVEMENTS = [
  { id: "1", name: "Fast Learner", icon: "award", color: "#4361EE", unlocked: true },
  { id: "2", name: "7 Day Streak", icon: "fire", color: "#F72585", unlocked: true },
  { id: "3", name: "Certified", icon: "certificate", color: "#4CC9F0", unlocked: true },
  { id: "4", name: "Night Owl", icon: "moon", color: "#7209B7", unlocked: false },
  { id: "5", name: "Social Butterfly", icon: "users", color: "#3A0CA3", unlocked: false },
  { id: "6", name: "Perfect Score", icon: "star", color: "#F72585", unlocked: false },
]

const RECENT_ACTIVITY = [
  { id: "1", type: "course", title: "Advanced React Patterns", date: "2 hours ago", icon: "book" },
  { id: "2", type: "certificate", title: "JavaScript Mastery", date: "Yesterday", icon: "certificate" },
  { id: "3", type: "achievement", title: "7 Day Streak", date: "3 days ago", icon: "fire" },
]

const SKILLS = ["JavaScript", "React", "Node.js", "TypeScript", "Python"]
const INTERESTS = ["Web Development", "Mobile Apps", "Data Science", "UI/UX Design"]

export default function ProfileScreen() {
  const router = useRouter()
  const { user, profile, isLoading: userLoading, signOut, uploadAvatar, updateProfile } = useUser()
  const { settings, updateSetting } = useSettings()
  const scrollY = useRef(new Animated.Value(0)).current
  const [refreshing, setRefreshing] = useState(false)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const data = await getUserData()
      setUserData(data)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [300, 200],
    extrapolate: 'clamp',
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  })

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadUserData()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshing(false)
    }
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
        setIsUploading(true)
        const avatarUrl = await uploadAvatar(result.assets[0].uri)
        setIsUploading(false)
        
        if (avatarUrl) {
          Alert.alert("Success", "Profile picture updated successfully!")
        } else {
          Alert.alert("Error", "Failed to update profile picture")
        }
      }
    } catch (error) {
      setIsUploading(false)
      Alert.alert("Error", "Failed to update profile picture")
      console.error(error)
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
          onPress: async () => {
            try {
              await signOut()
              router.replace("/auth/login")
            } catch (error) {
              console.error("Error signing out:", error)
              Alert.alert("Error", "Failed to sign out")
            }
          }
        }
      ]
    )
  }

  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profile?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile?.name || "User") }}
              style={styles.avatar}
              contentFit="cover"
            />
            {isUploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFF" />
              </View>
            ) : (
              <TouchableOpacity style={styles.changeAvatarButton} onPress={handleChangeAvatar}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{profile?.name || "User"}</Text>
          <Text style={styles.userEmail}>{profile?.email || ""}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  )

  const renderUserStats = () => (
    <View style={styles.userStatsContainer}>
      <LinearGradient
        colors={["#4A90E2", "#357ABD"]}
        style={styles.userStatsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.points || 0}</Text>
            <Text style={styles.statLabel}>Points Earned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.streak || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.bookmarkedVideos?.length || 0}</Text>
            <Text style={styles.statLabel}>Saved Videos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData?.preferences?.length || 0}</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  )

  const renderLevelProgress = () => (
    <View style={styles.levelContainer}>
      <View style={styles.levelInfo}>
        <Text style={styles.levelText}>Level {Math.floor((userData?.points || 0) / 100) + 1}</Text>
        <Text style={styles.xpText}>{userData?.points || 0} / {(Math.floor((userData?.points || 0) / 100) + 1) * 100} XP</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${((userData?.points || 0) % 100)}%` }]} />
      </View>
    </View>
  )

  const renderLearningProgress = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressItem}>
        <Text style={styles.progressValue}>{userData?.bookmarkedVideos?.length || 0}</Text>
        <Text style={styles.progressLabel}>Videos</Text>
      </View>
      <View style={styles.progressDivider} />
      <View style={styles.progressItem}>
        <Text style={styles.progressValue}>{userData?.streak || 0}</Text>
        <Text style={styles.progressLabel}>Days</Text>
      </View>
      <View style={styles.progressDivider} />
      <View style={styles.progressItem}>
        <Text style={styles.progressValue}>{userData?.points || 0}</Text>
        <Text style={styles.progressLabel}>Points</Text>
      </View>
    </View>
  )

  const renderSkills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsContainer}>
        {userData?.preferences?.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={20} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSetting('notificationsEnabled', value)}
            trackColor={{ false: "#D1D1D6", true: "#FF6B6B" }}
            thumbColor="#FFF"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={20} color="#666" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={settings.darkModeEnabled}
            onValueChange={(value) => updateSetting('darkModeEnabled', value)}
            trackColor={{ false: "#D1D1D6", true: "#FF6B6B" }}
            thumbColor="#FFF"
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="wifi-outline" size={20} color="#666" />
            <Text style={styles.settingText}>Download over Wi-Fi only</Text>
          </View>
          <Switch
            value={settings.downloadOverWifiOnly}
            onValueChange={(value) => updateSetting('downloadOverWifiOnly', value)}
            trackColor={{ false: "#D1D1D6", true: "#FF6B6B" }}
            thumbColor="#FFF"
          />
        </View>
        <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
          <View style={styles.settingInfo}>
            <Ionicons name="create-outline" size={20} color="#666" />
            <Text style={styles.settingText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D1D6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingInfo}>
            <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
            <Text style={[styles.settingText, { color: "#FF6B6B" }]}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D1D6" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6B6B"]} />
        }
      >
        {renderHeader()}
        {renderUserStats()}
        {renderLevelProgress()}
        {renderLearningProgress()}
        {renderSkills()}
        {renderSettings()}
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  editProfileButton: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 16,
    marginTop: 16,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  userStatsContainer: {
    marginHorizontal: 16,
    marginTop: -30,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  userStatsGradient: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.8,
  },
  levelContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  xpText: {
    fontSize: 14,
    color: "#666",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF6B6B",
    borderRadius: 4,
  },
  progressContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
  },
  progressValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressDivider: {
    width: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
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
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF6B6B",
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  activityContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,107,107,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  skillText: {
    fontSize: 12,
    color: "#333",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestItem: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  interestText: {
    fontSize: 12,
    color: "#333",
  },
  settingsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
})
