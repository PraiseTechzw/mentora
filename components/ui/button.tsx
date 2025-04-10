import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary[500],
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: colors.neutral[200],
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary[500],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.neutral[400];
    switch (variant) {
      case 'primary':
        return colors.neutral[50];
      case 'secondary':
        return colors.neutral[900];
      case 'outline':
        return colors.primary[500];
      case 'ghost':
        return colors.primary[500];
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
        };
      case 'md':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.base,
        };
      case 'lg':
        return {
          paddingVertical: spacing.base,
          paddingHorizontal: spacing.lg,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            { fontSize: size === 'sm' ? typography.fontSize.sm : typography.fontSize.base },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
});
