import { Tabs } from "expo-router"
import { FontAwesome5 } from "@expo/vector-icons"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopColor: "#EAEAEA",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="compass" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="book" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="user" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
