import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Onboarding data
const onboardingData = [
  {
    id: '1',
    title: 'Discover Learning',
    description: 'Explore a vast library of educational content from top instructors and platforms.',
    image: require('../../assets/images/cap.png'),
    color: ['#4c669f', '#3b5998', '#192f6a'] as const,
    icon: 'school-outline',
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description: 'Keep track of your learning journey with detailed progress tracking and achievements.',
    image: require('../../assets/images/track-progress.png'),
    color: ['#11998e', '#38ef7d', '#1a8d5f'] as const,
    icon: 'stats-chart-outline',
  },
  {
    id: '3',
    title: 'Learn Anywhere',
    description: 'Access your courses and continue learning on any device, anytime, anywhere.',
    image: require('../../assets/images/d.png'),
    color: ['#f46b45', '#eea849', '#f46b45'] as const,
    icon: 'globe-outline',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Start initial animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
      // Trigger haptic feedback on slide change
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Trigger haptic feedback on completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/auth/login');
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    const pulseGlow = glowAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.5],
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [
                { scale },
                { translateY },
                { perspective: 1000 },
                { rotateY: scrollX.interpolate({
                  inputRange,
                  outputRange: ['-15deg', '0deg', '15deg'],
                  extrapolate: 'clamp',
                })},
              ],
              opacity,
            },
          ]}
        >
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        </Animated.View>
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: scrollX.interpolate({
                inputRange,
                outputRange: [0, 1, 0],
                extrapolate: 'clamp',
              }),
              transform: [
                { translateY: scrollX.interpolate({
                  inputRange,
                  outputRange: [20, 0, 20],
                  extrapolate: 'clamp',
                })},
              ],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={32} color="white" />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [1, 1.2, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
              key={index.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={onboardingData[currentIndex].color}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.backgroundPattern,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              }),
            },
          ]}
        >
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternDot,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  width: Math.random() * 10 + 5,
                  height: Math.random() * 10 + 5,
                },
              ]}
            />
          ))}
        </Animated.View>

        <View style={styles.skipContainer}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace('/auth/login');
            }}
            style={styles.skipButton}
          >
            <BlurView intensity={20} style={styles.skipBlur}>
              <Text style={styles.skipText}>Skip</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        <FlatList
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        <Paginator />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={scrollTo}
            activeOpacity={0.8}
          >
            <Animated.View 
              style={[
                styles.buttonGlow,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1, 0.5],
                  }),
                }
              ]}
            />
            <BlurView intensity={30} style={styles.buttonBlur}>
              <Text style={styles.buttonText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons
                name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'}
                size={24}
                color="white"
              />
            </BlurView>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternDot: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 50,
  },
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 1,
  },
  skipButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  skipBlur: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    overflow: 'hidden',
    borderRadius: 30,
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
}); 