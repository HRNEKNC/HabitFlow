import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, useColorScheme } from "react-native";
import { THEME_COLORS, useHabitStore } from "../../src/store/useHabitStore";

export default function TabsLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const appTheme = useHabitStore((s) => s.appTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];

  return (
    <Tabs
      // ✅ 1. Kök arka planı zorla, alt tabakada açık renk kalmasın
      sceneContainerStyle={{ backgroundColor: colors.background }}
      screenOptions={{
        headerShown: false,
        // ✅ 2. Flaş patlamasını yaratan "animation: fade" KODU TAMAMEN SİLİNDİ.
        // Orijinal mobil uygulamalarda alt menü geçişleri anında olur.
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          paddingTop: 10,
          height: Platform.OS === "ios" ? 85 : 65,
          borderTopWidth: 1,
          elevation: 0, // Android'de gereksiz gölgeyi kapatır
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t("tabHome", { defaultValue: "Alışkanlıklar" }),
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
          tabBarLabel: t("tabStats", { defaultValue: "İstatistik" }),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: t("tabProfile", { defaultValue: "Profil" }),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
