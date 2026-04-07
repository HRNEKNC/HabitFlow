import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✅ Merkezi Beyni (Zustand) doğru şekilde import ettik
import { useHabitStore } from "../src/store/useHabitStore";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    emoji: "🌱",
    title: "Alışkanlık Kazan",
    subtitle:
      "Küçük adımlar, büyük değişimler yaratır. Her gün bir alışkanlık ekle ve hayatını dönüştür.",
    color: "#6366f1",
    bg: "#6366f115",
  },
  {
    id: "2",
    emoji: "📅",
    title: "Her Gün Takip Et",
    subtitle:
      "Günlük rutinini kontrol altında tut. Tamamladıklarını işaretle, serileri kır gitme.",
    color: "#10b981",
    bg: "#10b98115",
  },
  {
    id: "3",
    emoji: "📊",
    title: "Gelişimini Analiz Et",
    subtitle:
      "Haftalık ve aylık istatistiklerle ne kadar ilerlediğini gör. Veriler seni motive eder.",
    color: "#ec4899",
    bg: "#ec489915",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Beyinden fonksiyonu başarıyla çekiyoruz
  const completeOnboarding = useHabitStore((s) => s.completeOnboarding);

  async function handleStart() {
    await AsyncStorage.setItem("onboarding_completed", "true");
    completeOnboarding(); // Beyni güncelle
    router.replace("/(auth)/login");
  }

  function goNext() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleStart();
    }
  }

  function onViewableItemsChanged({ viewableItems }) {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;
  const onViewableItemsChangedRef = useRef(onViewableItemsChanged);

  function renderSlide({ item }) {
    return (
      <View style={styles.slide}>
        <View style={[styles.emojiCircle, { backgroundColor: item.bg }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={[styles.slideTitle, { color: item.color }]}>
          {item.title}
        </Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    );
  }

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <Text style={styles.logoEmoji}>⚡</Text>
        <Text style={styles.logoText}>HabitFlow</Text>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ["#2a2a2a", slide.color, "#2a2a2a"],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={slide.id}
                style={[
                  styles.dot,
                  { width: dotWidth, backgroundColor: dotColor },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          {!isLast ? (
            <TouchableOpacity style={styles.skipButton} onPress={handleStart}>
              <Text style={styles.skipText}>Atla</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skipButton} />
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: SLIDES[currentIndex].color },
            ]}
            onPress={goNext}
          >
            <Text style={styles.nextText}>
              {isLast ? "🚀  Başla" : "İleri  →"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
    gap: 8,
  },
  logoEmoji: { fontSize: 24 },
  logoText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 24,
  },
  emojiCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emoji: { fontSize: 72 },
  slideTitle: { fontSize: 30, fontWeight: "bold", textAlign: "center" },
  slideSubtitle: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 26,
  },
  footer: { paddingHorizontal: 28, paddingBottom: 52, gap: 28 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: { height: 8, borderRadius: 99 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: { paddingVertical: 14, paddingHorizontal: 8, minWidth: 60 },
  skipText: { color: "#444", fontSize: 15, fontWeight: "500" },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 99,
    minWidth: 140,
    alignItems: "center",
  },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
