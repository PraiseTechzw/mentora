import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const Card = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  contentStyle,
}: CardProps) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          ...shadows.base,
          backgroundColor: colors.background.light,
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: colors.neutral[200],
          backgroundColor: colors.background.light,
        };
      case 'flat':
        return {
          backgroundColor: colors.neutral[100],
        };
    }
  };

  const CardComponent = onPress ? Pressable : View;

  return (
    <CardComponent
      onPress={onPress}
      style={[styles.card, getVariantStyles(), style]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.base,
  },
});
