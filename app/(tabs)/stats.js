import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { THEME_COLORS, useHabitStore } from "../../src/store/useHabitStore";

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();

  const habits = useHabitStore((s) => s.habits);
  const allLogs = useHabitStore((s) => s.allLogs);
  const loading = useHabitStore((s) => s.loading);
  const refreshing = useHabitStore((s) => s.refreshing);
  const refresh = useHabitStore((s) => s.refresh);

  const appTheme = useHabitStore((s) => s.appTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];
  const styles = useMemo(() => getDynamicStyles(colors), [colors]);

  const [selectedDays, setSelectedDays] = useState(7);
  const today = new Date().toISOString().split("T")[0];

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
      if (habitLogs.includes(dateStr)) streak++;
      else if (i > 0) break;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }

  function completionRate(habitId) {
    const count = logs.filter((l) => l.habit_id === habitId).length;
    return Math.round((count / selectedDays) * 100);
  }

  function getThisWeek() {
    const days = [];
    const current = new Date();
    const dayOfWeek = current.getDay() === 0 ? 6 : current.getDay() - 1;
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        date: d.toISOString().split("T")[0],
        label: d.toLocaleDateString(i18n.language, { weekday: "short" }),
      });
    }
    return days;
  }

  const thisWeek = getThisWeek();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={activeTheme === "dark" ? "light-content" : "dark-content"}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {t("statsTitle", { defaultValue: "İstatistikler 📊" })}
          </Text>
        </View>

        <View style={styles.daySelector}>
          {[7, 30].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays === day && styles.dayButtonActive,
              ]}
              onPress={() => setSelectedDays(day)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDays === day && styles.dayButtonTextActive,
                ]}
              >
                {t("lastNDays", { defaultValue: `Son ${day} Gün`, count: day })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{habits.length}</Text>
            <Text style={styles.summaryLabel}>{t("habit")}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{todayLogs.length}</Text>
            <Text style={styles.summaryLabel}>{t("todayDone")}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalCompletions}</Text>
            <Text style={styles.summaryLabel}>
              {t("inNDays", {
                defaultValue: `${selectedDays} Günde`,
                count: selectedDays,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("thisWeekTitle", { defaultValue: "Bu Hafta" })}
          </Text>
          <View style={styles.chartContainer}>
            {thisWeek.map(({ date, label }) => {
              const count = allLogs.filter(
                (l) => l.completed_date === date,
              ).length;
              const maxHeight = 90;
              const barHeight =
                habits.length > 0
                  ? Math.max(
                      (count / habits.length) * maxHeight,
                      count > 0 ? 8 : 0,
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
          <Text style={styles.sectionTitle}>
            {t("habitDetails", { defaultValue: "Alışkanlık Detayları" })}
          </Text>
          {habits.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {t("noHabitAdded", {
                  defaultValue: "Henüz alışkanlık eklemedin.",
                })}
              </Text>
            </View>
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
                        { backgroundColor: habit.color + "1A" },
                      ]}
                    >
                      <Text style={styles.iconText}>{habit.icon}</Text>
                    </View>
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitName}>{habit.title}</Text>
                      <Text style={styles.habitStreak}>
                        {streak > 0
                          ? `🔥 ${t("streakDays", { defaultValue: `${streak} günlük seri`, count: streak })}`
                          : `⚪ ${t("noStreak", { defaultValue: "Seri yok" })}`}
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
                    {thisWeek.map(({ date }) => {
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

const getDynamicStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    scroll: { paddingHorizontal: 20, paddingBottom: 100 },
    headerContainer: {
      paddingTop: Platform.OS === "ios" ? 16 : 24,
      paddingBottom: 16,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.5,
    },

    daySelector: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 6,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        android: { elevation: 2 },
      }),
    },
    dayButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: 12,
    },
    dayButtonActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    dayButtonText: {
      color: colors.textSubtle,
      fontWeight: "700",
      fontSize: 14,
    },
    dayButtonTextActive: { color: "#FFF" },

    summaryRow: { flexDirection: "row", gap: 12, marginBottom: 32 },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        android: { elevation: 3 },
      }),
    },
    summaryNumber: {
      color: colors.primary,
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: -1,
    },
    summaryLabel: {
      color: colors.textSubtle,
      fontSize: 12,
      marginTop: 4,
      fontWeight: "600",
      textTransform: "uppercase",
    },

    section: { marginBottom: 32 },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 16,
      letterSpacing: -0.5,
    },

    chartContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      height: 160,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        android: { elevation: 4 },
      }),
    },
    barWrapper: { alignItems: "center", flex: 1 },
    barCount: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 6,
      height: 16,
    },
    barBg: {
      width: 28,
      height: 90,
      backgroundColor: colors.inputBg,
      borderRadius: 10,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      backgroundColor: colors.primary,
      borderRadius: 10,
    },
    barToday: { backgroundColor: colors.accent },
    barLabel: {
      color: colors.textSubtle,
      fontSize: 11,
      marginTop: 8,
      fontWeight: "600",
    },
    barLabelToday: { color: colors.accent, fontWeight: "800" },

    habitCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    habitCardTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    iconText: { fontSize: 24 },
    habitInfo: { flex: 1 },
    habitName: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    habitStreak: { color: colors.textSubtle, fontSize: 13, fontWeight: "500" },
    rateText: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },

    progressBg: {
      height: 8,
      backgroundColor: colors.inputBg,
      borderRadius: 99,
      overflow: "hidden",
      marginBottom: 16,
    },
    progressFill: { height: 8, borderRadius: 99 },
    dotRow: { flexDirection: "row", gap: 8 },
    dot: { flex: 1, height: 8, borderRadius: 99 },
    dotEmpty: { backgroundColor: colors.inputBg },

    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 30,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: { color: colors.textSubtle, fontSize: 15, fontWeight: "600" },
  });
