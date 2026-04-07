import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, LogBox, Text, View } from "react-native";
import { requestNotificationPermission } from "../src/lib/notifications";
import { supabase } from "../src/lib/supabase";
import { useHabitStore } from "../src/store/useHabitStore";

// Expo Go'nun Android bildirim uyarısını geliştirme aşamasında gizle
LogBox.ignoreLogs(["expo-notifications: Android Push notifications"]);

export default function RootLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true); // Sadece ilk okuma için

  const router = useRouter();
  const segments = useSegments();

  const init = useHabitStore((state) => state.init);
  const isOnboarded = useHabitStore((state) => state.isOnboarded);
  const completeOnboarding = useHabitStore((state) => state.completeOnboarding);

  // ─── 1️⃣ Onboarding Kontrolü ─────────────
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem("onboarding_completed");
        if (value === "true") {
          completeOnboarding();
        }
      } catch (err) {
        console.log("AsyncStorage Hatası:", err);
      } finally {
        setIsCheckingOnboarding(false);
      }
    }
    checkOnboarding();
  }, []);

  // ─── 2️⃣ Supabase Oturumu ─────────────────
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) setErrorMsg(error.message);
        else {
          setSession(session);
          if (session) init();
          if (session) {
            init();
            requestNotificationPermission(); // ✅ izin iste
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) init();
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── 3️⃣ Yönlendirme (Fedai) Mantığı ──────
  useEffect(() => {
    if (loading || isCheckingOnboarding) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    // Onboarding BİTMEDİYSE
    if (!isOnboarded) {
      if (!inOnboarding) router.replace("/onboarding");
      return;
    }

    // Onboarding BİTTİYSE (Normal Akış)
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [session, loading, isCheckingOnboarding, isOnboarded, segments]);

  if (loading || isCheckingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0f0f",
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ color: "#555", marginTop: 15 }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0f0f",
          padding: 20,
        }}
      >
        <Text style={{ color: "#ef4444", fontSize: 18, fontWeight: "bold" }}>
          Bağlantı Hatası!
        </Text>
        <Text style={{ color: "white", marginTop: 10, textAlign: "center" }}>
          {errorMsg}
        </Text>
      </View>
    );
  }

  return <Slot />;
}
