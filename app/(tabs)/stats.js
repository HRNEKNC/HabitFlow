import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useHabitStore } from "../../src/store/useHabitStore";

export default function StatsScreen() {
  // ✅ Supabase isteği yok — store'dan okuyoruz
  const habits = useHabitStore((s) => s.habits);
  const allLogs = useHabitStore((s) => s.allLogs);
  const loading = useHabitStore((s) => s.loading);
  const refreshing = useHabitStore((s) => s.refreshing);
  const refresh = useHabitStore((s) => s.refresh);

  const [selectedDays, setSelectedDays] = useState(7);

  const today = new Date().toISOString().split("T")[0];

  // Seçilen gün aralığına göre logları filtrele
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - selectedDays);
  const startStr = startDate.toISOString().split("T")[0];
  const logs = allLogs.filter((l) => l.completed_date >= startStr);

  const todayLogs = allLogs.filter((l) => l.completed_date === today);
  const totalCompletions = logs.length;

  function calculateStreak(habitId) {
    const habitLogs = allLogs
      .filter((l) => l.habit_id === habitId)
      .map((l) => l.completed_date)
      .sort((a, b) => new Date(b) - new Date(a));

    if (habitLogs.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (habitLogs.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }

  function completionRate(habitId) {
    const count = logs.filter((l) => l.habit_id === habitId).length;
    return Math.round((count / selectedDays) * 100);
  }

  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("tr-TR", { weekday: "short" }),
      });
    }
    return days;
  }

  const last7Days = getLast7Days();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#6366f1"
          />
        }
      >
        <Text style={styles.title}>İstatistikler 📊</Text>

        <View style={styles.daySelector}>
          {[7, 30].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays === day && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDays(day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDays === day && styles.dayButtonTextActive,
                ]}
              >
                Son {day} Gün
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{habits.length}</Text>
            <Text style={styles.summaryLabel}>Alışkanlık</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{todayLogs.length}</Text>
            <Text style={styles.summaryLabel}>Bugün ✓</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalCompletions}</Text>
            <Text style={styles.summaryLabel}>{selectedDays} Günde</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son 7 Gün</Text>
          <View style={styles.chartContainer}>
            {last7Days.map(({ date, label }) => {
              const count = allLogs.filter(
                (l) => l.completed_date === date,
              ).length;
              const maxHeight = 80;
              const barHeight =
                habits.length > 0
                  ? Math.max(
                      (count / habits.length) * maxHeight,
                      count > 0 ? 6 : 0,
                    )
                  : 0;
              const isToday = date === today;

              return (
                <View key={date} style={styles.barWrapper}>
                  <Text style={styles.barCount}>{count > 0 ? count : ""}</Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        { height: barHeight },
                        isToday && styles.barToday,
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.barLabel, isToday && styles.barLabelToday]}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alışkanlık Detayları</Text>
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>Henüz alışkanlık eklemedin.</Text>
          ) : (
            habits.map((habit) => {
              const rate = completionRate(habit.id);
              const streak = calculateStreak(habit.id);

              return (
                <View key={habit.id} style={styles.habitCard}>
                  <View style={styles.habitCardTop}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: habit.color + "22" },
                      ]}
                    >
                      <Text style={styles.iconText}>{habit.icon}</Text>
                    </View>
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitName}>{habit.title}</Text>
                      <Text style={styles.habitStreak}>
                        {streak > 0
                          ? `🔥 ${streak} günlük seri`
                          : "⚪ Seri yok"}
                      </Text>
                    </View>
                    <Text style={[styles.rateText, { color: habit.color }]}>
                      {rate}%
                    </Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${rate}%`, backgroundColor: habit.color },
                      ]}
                    />
                  </View>
                  <View style={styles.dotRow}>
                    {last7Days.map(({ date }) => {
                      const done = allLogs.some(
                        (l) =>
                          l.habit_id === habit.id && l.completed_date === date,
                      );
                      return (
                        <View
                          key={date}
                          style={[
                            styles.dot,
                            done
                              ? { backgroundColor: habit.color }
                              : styles.dotEmpty,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  scroll: { padding: 24, paddingBottom: 60 },
  title: { color: "#fff", fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  daySelector: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  dayButtonActive: { backgroundColor: "#6366f1" },
  dayButtonText: { color: "#555", fontWeight: "600", fontSize: 14 },
  dayButtonTextActive: { color: "#fff" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  summaryNumber: { color: "#6366f1", fontSize: 28, fontWeight: "bold" },
  summaryLabel: { color: "#555", fontSize: 12, marginTop: 4 },
  section: { marginBottom: 28 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyText: { color: "#555", textAlign: "center", marginTop: 12 },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    height: 140,
  },
  barWrapper: { alignItems: "center", flex: 1 },
  barCount: {
    color: "#6366f1",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    height: 16,
  },
  barBg: {
    width: 28,
    height: 80,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: { width: "100%", backgroundColor: "#6366f1", borderRadius: 8 },
  barToday: { backgroundColor: "#ec4899" },
  barLabel: { color: "#555", fontSize: 11, marginTop: 6 },
  barLabelToday: { color: "#ec4899", fontWeight: "700" },
  habitCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  habitCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 20 },
  habitInfo: { flex: 1 },
  habitName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  habitStreak: { color: "#555", fontSize: 12, marginTop: 2 },
  rateText: { fontSize: 18, fontWeight: "bold" },
  progressBg: {
    height: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: 6, borderRadius: 99 },
  dotRow: { flexDirection: "row", gap: 6 },
  dot: { flex: 1, height: 8, borderRadius: 99 },
  dotEmpty: { backgroundColor: "#2a2a2a" },
});
