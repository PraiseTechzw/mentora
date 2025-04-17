import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SeeAllScreen from '../../components/SeeAllScreen';
import { Ionicons } from '@expo/vector-icons';

export default function SeeAllInstructorsScreen() {
  const router = useRouter();

  const renderInstructorItem = (item: any) => (
    <TouchableOpacity
      style={styles.instructorItem}
      onPress={() => router.push(`/instructor/${item.id}`)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.instructorInfo}>
        <View style={styles.instructorHeader}>
          <Text style={styles.instructorName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.instructorTitle}>{item.title}</Text>
        <Text style={styles.instructorBio} numberOfLines={2}>
          {item.bio}
        </Text>
        <View style={styles.instructorStats}>
          <View style={styles.stat}>
            <Ionicons name="videocam-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.videos} videos</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.students} students</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="book-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.courses} courses</Text>
          </View>
        </View>
        <View style={styles.expertiseContainer}>
          {item.expertise?.map((skill: string, index: number) => (
            <View key={index} style={styles.expertiseTag}>
              <Text style={styles.expertiseText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SeeAllScreen
      title="All Instructors"
      contentType="all"
      category="instructors"
      renderItem={renderInstructorItem}
      showFilters={false}
    />
  );
}

const styles = StyleSheet.create({
  instructorItem: {
    flexDirection: 'row',
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
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  instructorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  instructorBio: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  instructorStats: {
    flexDirection: 'row',
    marginBottom: 12,
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
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  expertiseText: {
    fontSize: 12,
    color: '#666',
  },
}); 