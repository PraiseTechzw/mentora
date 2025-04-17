import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SeeAllScreen from '../../components/SeeAllScreen';
import { Ionicons } from '@expo/vector-icons';

export default function SeeAllTrendingScreen() {
  const router = useRouter();

  const renderTrendingItem = (item: any) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.trendingInfo}>
        <View style={styles.trendingHeader}>
          <Text style={styles.trendingTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.trendingBadge}>
            <Ionicons name="trending-up" size={16} color="#fff" />
            <Text style={styles.trendingBadgeText}>Trending</Text>
          </View>
        </View>
        <Text style={styles.trendingMeta}>
          {item.instructor} • {item.duration}
        </Text>
        <View style={styles.trendingStats}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.publishedAt}</Text>
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
      title="Trending Now"
      contentType="trending"
      renderItem={renderTrendingItem}
    />
  );
}

const styles = StyleSheet.create({
  trendingItem: {
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
  trendingInfo: {
    padding: 16,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trendingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 12,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  trendingMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  trendingStats: {
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