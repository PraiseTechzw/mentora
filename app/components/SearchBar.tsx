import React from "react"
import { StyleSheet, TextInput, View, ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  style?: ViewStyle
}

export function SearchBar({ value, onChangeText, placeholder = "Search...", style }: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color="#666" style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
}) 