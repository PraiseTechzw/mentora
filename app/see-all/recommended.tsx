import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SeeAllScreen from '../../components/SeeAllScreen';
import { Ionicons } from '@expo/vector-icons';

export default function SeeAllRecommendedScreen() {
  const router = useRouter();

  const renderRecommendedItem = (item: any) => (
    <TouchableOpacity
      style={styles.recommendedItem}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.recommendedInfo}>
        <View style={styles.recommendedHeader}>
          <Text style={styles.recommendedTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.recommendedBadge}>
            <Ionicons name="star" size={16} color="#fff" />
            <Text style={styles.recommendedBadgeText}>Recommended</Text>
          </View>
        </View>
        <Text style={styles.recommendedMeta}>
          {item.instructor} • {item.duration}
        </Text>
        <View style={styles.recommendedStats}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.publishedAt}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="bookmark-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.bookmarks}</Text>
          </View>
        </View>
        <View style={styles.tagsContainer}>
          {item.tags?.map((tag: string, index: number) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SeeAllScreen
      title="Recommended for You"
      contentType="recommended"
      renderItem={renderRecommendedItem}
    />
  );
}

const styles = StyleSheet.create({
  recommendedItem: {
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
  recommendedInfo: {
    padding: 16,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendedTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 12,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  recommendedMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recommendedStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
}); 