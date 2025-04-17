import AsyncStorage from '@react-native-async-storage/async-storage'

const SETTINGS_KEY = '@mentora_settings'

export interface UserSettings {
  notificationsEnabled: boolean
  darkModeEnabled: boolean
  downloadOverWifiOnly: boolean
}

const DEFAULT_SETTINGS: UserSettings = {
  notificationsEnabled: true,
  darkModeEnabled: false,
  downloadOverWifiOnly: true,
}

export const getSettings = async (): Promise<UserSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY)
    if (settingsJson) {
      return JSON.parse(settingsJson)
    }
    return DEFAULT_SETTINGS
  } catch (error) {
    console.error('Error getting settings:', error)
    return DEFAULT_SETTINGS
  }
}

export const updateSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const currentSettings = await getSettings()
    const newSettings = { ...currentSettings, ...settings }
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    return newSettings
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
}

export const resetSettings = async (): Promise<UserSettings> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS))
    return DEFAULT_SETTINGS
  } catch (error) {
    console.error('Error resetting settings:', error)
    throw error
  }
} 