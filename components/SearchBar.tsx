import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChangeText, placeholder = "Search videos..." }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <FontAwesome5 name="times" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.micButton}>
        <FontAwesome5 name="microphone" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  micButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
})
