import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  LogBox,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import "../src/lib/i18n";
import { requestNotificationPermission } from "../src/lib/notifications";
import { supabase } from "../src/lib/supabase";
import { THEME_COLORS, useHabitStore } from "../src/store/useHabitStore";

LogBox.ignoreLogs(["expo-notifications: Android Push notifications"]);
SplashScreen.preventAutoHideAsync();

// ✅ SARI UYARININ ÇÖZÜLDÜĞÜ YER (Geleceğe uyumlu yeni API)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Eski shouldShowAlert yerine
    shouldShowList: true, // Eski shouldShowAlert yerine
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function PremiumSplash({ colors }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: colors.primary + "1A",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.primary + "33",
          }}
        >
          <Text style={{ fontSize: 42 }}>⚡</Text>
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 40,
            fontWeight: "900",
            letterSpacing: -1,
          }}
        >
          HabitFlow
        </Text>
        <Text
          style={{
            color: colors.textSubtle,
            fontSize: 14,
            fontWeight: "800",
            marginTop: 8,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          HRN Software
        </Text>
      </Animated.View>
    </View>
  );
}

function InitialLanguageSelector({ colors, onSelect }) {
  const { i18n } = useTranslation();
  const LANGS = [
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
  ];

  const handleSelect = async (code) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem("settings.lang", code);
    onSelect();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{ paddingHorizontal: 30, paddingTop: 60, paddingBottom: 20 }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            backgroundColor: colors.primary + "1A",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.primary + "33",
          }}
        >
          <Text style={{ fontSize: 30 }}>🌍</Text>
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 32,
            fontWeight: "900",
            letterSpacing: -0.5,
            marginBottom: 8,
          }}
        >
          Select Language
        </Text>
        <Text
          style={{
            color: colors.textSubtle,
            fontSize: 16,
            fontWeight: "500",
            marginBottom: 40,
          }}
        >
          Please choose your preferred language to continue.
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 50 }}
      >
        {LANGS.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleSelect(lang.code)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 20,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 28, marginRight: 16 }}>{lang.flag}</Text>
            <Text
              style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}
            >
              {lang.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [splashTimerDone, setSplashTimerDone] = useState(false);

  const router = useRouter();
  const segments = useSegments();

  const init = useHabitStore((state) => state.init);
  const isOnboarded = useHabitStore((state) => state.isOnboarded);
  const completeOnboarding = useHabitStore((state) => state.completeOnboarding);

  const isLangSelected = useHabitStore((state) => state.isLangSelected);
  const setLangSelected = useHabitStore((state) => state.setLangSelected);

  const appTheme = useHabitStore((s) => s.appTheme);
  const colorScheme = useColorScheme();
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];

  useEffect(() => {
    setTimeout(() => {
      setSplashTimerDone(true);
    }, 1500);
  }, []);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem("onboarding_completed");
        if (value === "true") completeOnboarding();
      } catch (err) {
      } finally {
        setIsCheckingOnboarding(false);
      }
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) setErrorMsg(error.message);
        else {
          setSession(session);
          if (session) {
            init();
            requestNotificationPermission();
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session && (event === "SIGNED_IN" || event === "SIGNED_OUT")) {
        init();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading || isCheckingOnboarding || !splashTimerDone || !isLangSelected)
      return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!isOnboarded) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }

    SplashScreen.hideAsync();
  }, [
    session,
    loading,
    isCheckingOnboarding,
    isOnboarded,
    segments,
    splashTimerDone,
    isLangSelected,
  ]);

  if (loading || isCheckingOnboarding || !splashTimerDone) {
    return <PremiumSplash colors={colors} />;
  }
  if (errorMsg)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          padding: 20,
        }}
      >
        <Text
          style={{ color: colors.danger, fontSize: 18, fontWeight: "bold" }}
        >
          Bağlantı Hatası!
        </Text>
      </View>
    );

  const baseTheme = activeTheme === "dark" ? DarkTheme : DefaultTheme;
  const customTheme = {
    ...baseTheme,
    colors: { ...baseTheme.colors, background: colors.background },
  };

  if (!isLangSelected) {
    return (
      <ThemeProvider value={customTheme}>
        <InitialLanguageSelector
          colors={colors}
          onSelect={() => {
            setLangSelected();
            SplashScreen.hideAsync();
          }}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={customTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Slot />
      </View>
    </ThemeProvider>
  );
}
