import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// User data interface
export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  streak: number;
  lastLoginDate: string;
  preferences: string[];
  completedCourses: string[];
  bookmarkedVideos: string[];
}

// Default user data
const DEFAULT_USER: UserData = {
  id: 'default-user',
  name: 'User',
  email: 'user@example.com',
  points: 0,
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  preferences: [],
  completedCourses: [],
  bookmarkedVideos: [],
};

// Keys for AsyncStorage
const USER_DATA_KEY = 'user_data';
const LAST_LOGIN_DATE_KEY = 'last_login_date';

/**
 * Get the current user data
 */
export const getUserData = async (): Promise<UserData> => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return DEFAULT_USER;
  } catch (error) {
    console.error('Error getting user data:', error);
    return DEFAULT_USER;
  }
};

/**
 * Save user data
 */
export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

/**
 * Update user points
 */
export const updateUserPoints = async (pointsToAdd: number): Promise<UserData> => {
  try {
    const userData = await getUserData();
    userData.points += pointsToAdd;
    await saveUserData(userData);
    return userData;
  } catch (error) {
    console.error('Error updating user points:', error);
    return await getUserData();
  }
};

/**
 * Check and update user streak
 */
export const checkAndUpdateStreak = async (): Promise<UserData> => {
  try {
    const userData = await getUserData();
    const lastLoginDate = await AsyncStorage.getItem(LAST_LOGIN_DATE_KEY);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!lastLoginDate) {
      // First login
      userData.streak = 1;
      await AsyncStorage.setItem(LAST_LOGIN_DATE_KEY, today.toISOString());
      await saveUserData(userData);
      return userData;
    }
    
    const lastLogin = new Date(lastLoginDate);
    lastLogin.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Already logged in today
      return userData;
    } else if (diffDays === 1) {
      // Consecutive day
      userData.streak += 1;
    } else {
      // Streak broken
      userData.streak = 1;
    }
    
    await AsyncStorage.setItem(LAST_LOGIN_DATE_KEY, today.toISOString());
    await saveUserData(userData);
    return userData;
  } catch (error) {
    console.error('Error checking and updating streak:', error);
    return await getUserData();
  }
};

/**
 * Add points for completing a video
 */
export const addPointsForVideoCompletion = async (videoId: string): Promise<UserData> => {
  try {
    const userData = await getUserData();
    
    // Check if video is already completed
    if (userData.completedCourses.includes(videoId)) {
      return userData;
    }
    
    // Add points and mark video as completed
    userData.points += 10;
    userData.completedCourses.push(videoId);
    
    await saveUserData(userData);
    return userData;
  } catch (error) {
    console.error('Error adding points for video completion:', error);
    return await getUserData();
  }
};

/**
 * Bookmark a video
 */
export const bookmarkVideo = async (videoId: string): Promise<UserData> => {
  try {
    const userData = await getUserData();
    
    // Check if video is already bookmarked
    if (userData.bookmarkedVideos.includes(videoId)) {
      return userData;
    }
    
    // Add video to bookmarks
    userData.bookmarkedVideos.push(videoId);
    
    await saveUserData(userData);
    return userData;
  } catch (error) {
    console.error('Error bookmarking video:', error);
    return await getUserData();
  }
};

/**
 * Remove a video from bookmarks
 */
export const removeBookmark = async (videoId: string): Promise<UserData> => {
  try {
    const userData = await getUserData();
    
    // Remove video from bookmarks
    userData.bookmarkedVideos = userData.bookmarkedVideos.filter(id => id !== videoId);
    
    await saveUserData(userData);
    return userData;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return await getUserData();
  }
};

/**
 * Check if a video is bookmarked
 */
export const isVideoBookmarked = async (videoId: string): Promise<boolean> => {
  try {
    const userData = await getUserData();
    return userData.bookmarkedVideos.includes(videoId);
  } catch (error) {
    console.error('Error checking if video is bookmarked:', error);
    return false;
  }
};

/**
 * Initialize user data on app start
 */
export const initializeUserData = async (): Promise<UserData> => {
  try {
    // Check and update streak
    const userData = await checkAndUpdateStreak();
    return userData;
  } catch (error) {
    console.error('Error initializing user data:', error);
    return await getUserData();
  }
}; 