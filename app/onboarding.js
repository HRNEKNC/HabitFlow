import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { THEME_COLORS, useHabitStore } from "../src/store/useHabitStore";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const completeOnboarding = useHabitStore((s) => s.completeOnboarding);
  const appTheme = useHabitStore((s) => s.appTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];
  const styles = useMemo(() => getDynamicStyles(colors), [colors]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  // ✅ TANITIM EKRANI İÇERİKLERİ (Dil destekli ve varsayılan metinlerle korumalı)
  const slides = [
    {
      id: "1",
      icon: "⚡",
      title: t("onb1Title", { defaultValue: "HabitFlow'a Hoş Geldin" }),
      description: t("onb1Desc", {
        defaultValue:
          "Hayatını şekillendir, alışkanlıklarını lüks ve pürüzsüz bir arayüzle takip et.",
      }),
    },
    {
      id: "2",
      icon: "🔥",
      title: t("onb2Title", { defaultValue: "Serini Koru, Rozetleri Topla" }),
      description: t("onb2Desc", {
        defaultValue:
          "Her gün hedeflerine ulaşarak zinciri kırma. Kusursuz günleri tamamla ve özel rozetlerin kilidini aç.",
      }),
    },
    {
      id: "3",
      icon: "🛒",
      title: t("onb3Title", { defaultValue: "Enerji ve Market Sistemi" }),
      description: t("onb3Desc", {
        defaultValue:
          "Görevleri tamamla, enerji biriktir. Dünü mü unuttun? Marketten Seri Dondurucu al ve yanmaktan kurtul!",
      }),
    },
  ];

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // ✅ ONBOARDING TAMAMLANDI - SİSTEME KAYDET VE GİRİŞE YÖNLENDİR
      await AsyncStorage.setItem("onboarding_completed", "true");
      completeOnboarding();
      router.replace("/(auth)/login");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboarding_completed", "true");
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  const Paginator = ({ data, scrollX }) => {
    return (
      <View style={styles.paginatorContainer}>
        {data.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 24, 10],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              style={[
                styles.dot,
                { width: dotWidth, opacity, backgroundColor: colors.primary },
              ]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={activeTheme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={styles.container}>
        {/* Atlama Butonu */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>
              {t("skip", { defaultValue: "Atla" })}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={slides}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            },
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        <View style={styles.footer}>
          <Paginator data={slides} scrollX={scrollX} />

          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1
                ? t("getStarted", { defaultValue: "Hemen Başla" })
                : t("next", { defaultValue: "İleri" })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getDynamicStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    header: {
      alignItems: "flex-end",
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "android" ? 40 : 20,
      paddingBottom: 20,
    },
    skipText: {
      color: colors.textSubtle,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    slide: {
      width,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    iconContainer: {
      width: 140,
      height: 140,
      borderRadius: 40,
      backgroundColor: colors.primary + "1A",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 40,
      borderWidth: 1,
      borderColor: colors.primary + "33",
    },
    iconText: { fontSize: 72 },

    textContainer: { alignItems: "center", width: "100%" },
    title: {
      color: colors.text,
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -1,
      textAlign: "center",
      marginBottom: 16,
    },
    description: {
      color: colors.textSubtle,
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
      lineHeight: 26,
      paddingHorizontal: 10,
    },

    footer: {
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === "ios" ? 50 : 40,
      alignItems: "center",
    },

    paginatorContainer: {
      flexDirection: "row",
      height: 64,
      alignItems: "center",
      justifyContent: "center",
    },
    dot: { height: 10, borderRadius: 5, marginHorizontal: 6 },

    button: {
      width: "100%",
      backgroundColor: colors.primary,
      paddingVertical: 20,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
  });
