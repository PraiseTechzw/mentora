import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SeeAllScreen from '../../components/SeeAllScreen';
import { Ionicons } from '@expo/vector-icons';

export default function SeeAllLearningPathsScreen() {
  const router = useRouter();

  const renderLearningPathItem = (item: any) => (
    <TouchableOpacity
      style={styles.pathItem}
      onPress={() => router.push(`/learning-path/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.pathInfo}>
        <View style={styles.pathHeader}>
          <Text style={styles.pathTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        <Text style={styles.pathDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.pathStats}>
          <View style={styles.stat}>
            <Ionicons name="book-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.courses} courses</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.students} students</Text>
          </View>
        </View>
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
        <View style={styles.skillsContainer}>
          {item.skills?.map((skill: string, index: number) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SeeAllScreen
      title="Learning Paths"
      contentType="all"
      category="learning-paths"
      renderItem={renderLearningPathItem}
    />
  );
}

const styles = StyleSheet.create({
  pathItem: {
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
  pathInfo: {
    padding: 16,
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pathTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 12,
  },
  levelBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pathDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  pathStats: {
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
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#666',
  },
}); 