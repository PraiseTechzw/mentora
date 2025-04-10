"use client"

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

interface ModernVideoCardProps {
  title: string;
  thumbnail: string;
  duration: string;
  instructor: string;
  rating: number;
  onPress: () => void;
}

export const ModernVideoCard = ({
  title,
  thumbnail,
  duration,
  instructor,
  rating,
  onPress,
}: ModernVideoCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>{duration}</Text>
        </View>
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color={colors.primary[500]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.instructorContainer}>
          <Ionicons name="person-circle-outline" size={16} color={colors.neutral[500]} />
          <Text style={styles.instructor}>{instructor}</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.warning[500]} />
          <Text style={styles.rating}>{rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    ...Platform.select({
      ios: {
        ...shadows.lg,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  durationContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  duration: {
    color: colors.neutral[50],
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        ...shadows.lg,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    padding: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  instructor: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[500],
    marginLeft: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.neutral[700],
    marginLeft: spacing.xs,
  },
});
