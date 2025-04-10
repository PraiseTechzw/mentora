import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { FontAwesome5 } from "@expo/vector-icons"

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source="https://randomuser.me/api/portraits/men/32.jpg"
            style={styles.profileImage}
            contentFit="cover"
          />
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>This Week</Text>
              <Text style={styles.progressValue}>8.5 hours</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: "70%" }]} />
            </View>
            <Text style={styles.progressTarget}>Target: 12 hours</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: "#4361EE" }]}>
                <FontAwesome5 name="award" size={24} color="#FFF" />
              </View>
              <Text style={styles.achievementName}>Fast Learner</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: "#F72585" }]}>
                <FontAwesome5 name="fire" size={24} color="#FFF" />
              </View>
              <Text style={styles.achievementName}>7 Day Streak</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: "#4CC9F0" }]}>
                <FontAwesome5 name="certificate" size={24} color="#FFF" />
              </View>
              <Text style={styles.achievementName}>Certified</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <FontAwesome5 name="bell" size={18} color="#666" />
              <Text style={styles.settingText}>Notifications</Text>
              <FontAwesome5 name="chevron-right" size={16} color="#CCC" style={styles.settingArrow} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <FontAwesome5 name="download" size={18} color="#666" />
              <Text style={styles.settingText}>Downloads</Text>
              <FontAwesome5 name="chevron-right" size={16} color="#CCC" style={styles.settingArrow} />
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
            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]}>
              <FontAwesome5 name="sign-out-alt" size={18} color="#FF6B6B" />
              <Text style={[styles.settingText, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    justifyContent: "space-between",
  },
  achievementItem: {
    alignItems: "center",
    flex: 1,
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
