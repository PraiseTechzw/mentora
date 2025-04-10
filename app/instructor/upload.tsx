"use client"

import { useState } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { FontAwesome5 } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Image } from "expo-image"

import { submitContent } from "../../services/content-service"

const CATEGORIES = ["Programming", "Mathematics", "Science", "History", "Languages", "Arts", "Business"]

export default function UploadScreen() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setThumbnailUrl(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    if (!title || !description || !videoUrl || !thumbnailUrl || !category) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      await submitContent({
        title,
        description,
        videoUrl,
        thumbnailUrl,
        category,
        tags: tags.split(",").map((tag) => tag.trim()),
        instructorId: "123", // In a real app, this would be the logged-in instructor's ID
      })

      Alert.alert("Success", "Your content has been submitted for review", [
        { text: "OK", onPress: () => router.back() },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to submit content. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Content</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter video title"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter video description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Video URL *</Text>
        <TextInput
          style={styles.input}
          value={videoUrl}
          onChangeText={setVideoUrl}
          placeholder="Enter YouTube video URL"
          placeholderTextColor="#999"
          keyboardType="url"
        />

        <Text style={styles.label}>Thumbnail *</Text>
        {thumbnailUrl ? (
          <View style={styles.thumbnailContainer}>
            <Image source={thumbnailUrl} style={styles.thumbnail} contentFit="cover" />
            <TouchableOpacity style={styles.changeThumbnailButton} onPress={pickThumbnail}>
              <Text style={styles.changeThumbnailText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.thumbnailPicker} onPress={pickThumbnail}>
            <FontAwesome5 name="image" size={24} color="#666" />
            <Text style={styles.thumbnailPickerText}>Select Thumbnail</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, category === cat && styles.selectedCategoryButton]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryButtonText, category === cat && styles.selectedCategoryButtonText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="e.g. javascript, tutorial, beginner"
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? "Submitting..." : "Submit for Review"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
  },
  thumbnailContainer: {
    position: "relative",
    marginBottom: 8,
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 8,
  },
  changeThumbnailButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeThumbnailText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  thumbnailPicker: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailPickerText: {
    color: "#666",
    fontSize: 16,
    marginTop: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  categoryButton: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  selectedCategoryButton: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  categoryButtonText: {
    color: "#666",
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: "#FFF",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
