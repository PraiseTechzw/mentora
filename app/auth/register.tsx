import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../services/supabase-client';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const nameFocusAnim = useRef(new Animated.Value(0)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const confirmPasswordFocusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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

  // Handle focus animations
  useEffect(() => {
    Animated.timing(nameFocusAnim, {
      toValue: isNameFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isNameFocused]);

  useEffect(() => {
    Animated.timing(emailFocusAnim, {
      toValue: isEmailFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isEmailFocused]);

  useEffect(() => {
    Animated.timing(passwordFocusAnim, {
      toValue: isPasswordFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isPasswordFocused]);

  useEffect(() => {
    Animated.timing(confirmPasswordFocusAnim, {
      toValue: isConfirmPasswordFocused ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isConfirmPasswordFocused]);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      if (data?.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Registration Successful',
          'Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                handleSignIn();
              },
            },
          ]
        );
      }
    } catch (err) {
      setError('An unexpected error occurred');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    setIsTransitioning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate out before navigation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/auth/login');
    });
  };

  // Calculate glow values
  const nameGlowOpacity = nameFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const nameGlowScale = nameFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const emailGlowOpacity = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const emailGlowScale = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const passwordGlowOpacity = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const passwordGlowScale = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const confirmPasswordGlowOpacity = confirmPasswordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const confirmPasswordGlowScale = confirmPasswordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const pulseGlow = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="school" size={60} color="white" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our learning community</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  borderColor: nameFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)'],
                  }),
                  borderWidth: nameFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                  transform: [
                    { scale: nameFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    })},
                  ],
                },
              ]}
            >
              <Animated.View 
                style={[
                  styles.inputGlow,
                  {
                    opacity: nameGlowOpacity,
                    transform: [{ scale: nameGlowScale }],
                  }
                ]}
              />
              <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  borderColor: emailFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)'],
                  }),
                  borderWidth: emailFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                  transform: [
                    { scale: emailFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    })},
                  ],
                },
              ]}
            >
              <Animated.View 
                style={[
                  styles.inputGlow,
                  {
                    opacity: emailGlowOpacity,
                    transform: [{ scale: emailGlowScale }],
                  }
                ]}
              />
              <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
              />
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  borderColor: passwordFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)'],
                  }),
                  borderWidth: passwordFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                  transform: [
                    { scale: passwordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    })},
                  ],
                },
              ]}
            >
              <Animated.View 
                style={[
                  styles.inputGlow,
                  {
                    opacity: passwordGlowOpacity,
                    transform: [{ scale: passwordGlowScale }],
                  }
                ]}
              />
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => {
                  setShowPassword(!showPassword);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={[
                styles.inputContainer,
                {
                  borderColor: confirmPasswordFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)'],
                  }),
                  borderWidth: confirmPasswordFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                  transform: [
                    { scale: confirmPasswordFocusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.02],
                    })},
                  ],
                },
              ]}
            >
              <Animated.View 
                style={[
                  styles.inputGlow,
                  {
                    opacity: confirmPasswordGlowOpacity,
                    transform: [{ scale: confirmPasswordGlowScale }],
                  }
                ]}
              />
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setIsConfirmPasswordFocused(true)}
                onBlur={() => setIsConfirmPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
              </TouchableOpacity>
            </Animated.View>

            {error ? (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={16} color="#ff6b6b" style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading || isTransitioning}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Sign Up</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert('Google Sign In', 'This feature will be implemented soon');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity 
                onPress={handleSignIn}
                disabled={isTransitioning}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  inputGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.7)',
    marginHorizontal: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    height: 55,
    marginBottom: 20,
  },
  socialButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: 'rgba(255,255,255,0.7)',
  },
  loginLink: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 