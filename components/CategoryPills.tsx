import { StyleSheet, ScrollView, TouchableOpacity, Text } from "react-native"

interface CategoryPillsProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryPills({ categories, selectedCategory, onSelectCategory }: CategoryPillsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.pill, selectedCategory === category && styles.selectedPill]}
          onPress={() => onSelectCategory(category)}
        >
          <Text style={[styles.pillText, selectedCategory === category && styles.selectedPillText]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  selectedPill: {
    backgroundColor: "#333",
  },
  pillText: {
    fontSize: 14,
    color: "#666",
  },
  selectedPillText: {
    color: "#FFF",
  },
})
