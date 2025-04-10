import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows, spacing } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search...',
  autoFocus = false,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const containerStyle = {
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
    shadowOpacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.2],
    }),
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={isFocused ? colors.primary[500] : colors.neutral[400]}
          style={styles.searchIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          style={styles.input}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => onChangeText('')}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.neutral[400]}
            />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    ...Platform.select({
      ios: {
        ...shadows.base,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.base,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.neutral[900],
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
});
