import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Tab geçişinde fade efekti
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#1a1a1a",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          animation: "fade",
        },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#555",
        // ✅ Tab'lar arası geçişte fade animasyonu
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Alışkanlıklar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarLabel: "İstatistik",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
