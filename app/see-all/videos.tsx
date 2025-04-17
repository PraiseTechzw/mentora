import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SeeAllScreen from '../../components/SeeAllScreen';
import { Ionicons } from '@expo/vector-icons';

export default function SeeAllVideosScreen() {
  const router = useRouter();

  const renderVideoItem = (item: any) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => router.push(`/video/${item.id}`)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoMeta}>
          {item.instructor} • {item.duration}
        </Text>
        <View style={styles.videoStats}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.publishedAt}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SeeAllScreen
      title="All Videos"
      contentType="all"
      renderItem={renderVideoItem}
    />
  );
}

const styles = StyleSheet.create({
  videoItem: {
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
  },
  thumbnail: {
    width: 120,
    height: 80,
    backgroundColor: '#f0f0f0',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  videoStats: {
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