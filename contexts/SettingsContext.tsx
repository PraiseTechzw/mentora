import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserSettings, getSettings, updateSettings, resetSettings } from '../services/settings-service'

interface SettingsContextType {
  settings: UserSettings
  updateSetting: (key: keyof UserSettings, value: boolean) => Promise<void>
  resetSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>({
    notificationsEnabled: true,
    darkModeEnabled: false,
    downloadOverWifiOnly: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const userSettings = await getSettings()
      setSettings(userSettings)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    try {
      const newSettings = await updateSettings({ [key]: value })
      setSettings(newSettings)
    } catch (error) {
      console.error('Error updating setting:', error)
      throw error
    }
  }

  const handleResetSettings = async () => {
    try {
      const defaultSettings = await resetSettings()
      setSettings(defaultSettings)
    } catch (error) {
      console.error('Error resetting settings:', error)
      throw error
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings: handleResetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 