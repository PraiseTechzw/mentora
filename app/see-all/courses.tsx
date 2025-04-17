import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SeeAllScreen from '../../components/SeeAllScreen';
import { Ionicons } from '@expo/vector-icons';

export default function SeeAllCoursesScreen() {
  const router = useRouter();

  const renderCourseItem = (item: any) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => router.push(`/course/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.courseInfo}>
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>
        <Text style={styles.courseMeta}>
          {item.instructor} • {item.lessons} lessons
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${item.progress || 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {item.progress || 0}% Complete
          </Text>
        </View>
        <View style={styles.courseStats}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.students} students</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="star-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SeeAllScreen
      title="All Courses"
      contentType="all"
      category="courses"
      renderItem={renderCourseItem}
    />
  );
}

const styles = StyleSheet.create({
  courseItem: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  courseInfo: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  courseMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
}); 