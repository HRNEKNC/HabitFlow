import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { THEME_COLORS, useHabitStore } from "../../src/store/useHabitStore";

const ICONS = ["⭐", "💪", "📚", "💧", "🏃", "🧘", "🎯", "🎸", "✍️", "🍎"];
const MODAL_COLORS = [
  "#F5A623",
  "#D97706",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
];
const EMPTY_FORM = {
  title: "",
  description: "",
  icon: "⭐",
  color: "#F5A623",
  notify_hour: null,
  notify_minute: null,
  weekly_goal: 7,
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

  const user = useHabitStore((s) => s.user);
  const energy = useHabitStore((s) => s.energy);
  const freezes = useHabitStore((s) => s.freezes);
  const buyFreeze = useHabitStore((s) => s.buyFreeze);
  const useFreezeForYesterday = useHabitStore((s) => s.useFreezeForYesterday);

  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const allLogs = useHabitStore((s) => s.allLogs);
  const loading = useHabitStore((s) => s.loading);
  const refreshing = useHabitStore((s) => s.refreshing);
  const refresh = useHabitStore((s) => s.refresh);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const appTheme = useHabitStore((s) => s.appTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];
  const styles = useMemo(() => getDynamicStyles(colors), [colors]);

  const [modalVisible, setModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function getUsername() {
    const metaName = user?.user_metadata?.username;
    if (metaName) return String(metaName);
    if (user?.email) return String(user.email.split("@")[0]);
    return "";
  }

  function openAddModal() {
    setEditingHabit(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }
  function closeModal() {
    setModalVisible(false);
    setEditingHabit(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      Alert.alert(t("error"), t("emptyNameError"));
      return;
    }
    setSaving(true);
    try {
      if (editingHabit) await updateHabit({ id: editingHabit.id, ...form });
      else await addHabit(form);
      closeModal();
    } catch (err) {
      Alert.alert(t("error"), err.message);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(habitId) {
    Alert.alert(t("deleteHabitTitle"), t("deleteHabitDesc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHabit(habitId);
          } catch (err) {
            Alert.alert(t("error"), err.message);
          }
        },
      },
    ]);
  }

  async function handleBuyFreeze() {
    if (energy < 100) {
      Alert.alert(t("notEnoughEnergy"), t("buyFreezeDesc"));
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await buyFreeze();
    Alert.alert(t("buySuccess"), t("buySuccessDesc"));
  }

  // ✅ GERİ GETİRİLEN ÖZELLİK: Kalan zamanı hesaplama motoru
  function getTimeRemainingText() {
    if (form.notify_hour === null || form.notify_minute === null) return "";
    const now = new Date();
    const target = new Date();
    target.setHours(form.notify_hour, form.notify_minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diffMs = target - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs / (1000 * 60)) % 60);
    if (diffHrs === 0 && diffMins === 0) return t("timeLessMin");
    return t("timeRemains", { hours: diffHrs, mins: diffMins });
  }

  function HabitCard({ item }) {
    const isCompleted = logs.includes(item.id);
    const weekStart = useHabitStore((s) => s.weekStartStr);

    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const missedYesterday =
      habits.length > 0 &&
      !allLogs.some(
        (l) => l.habit_id === item.id && l.completed_date === yesterday,
      );

    const weeklyDone = weekStart
      ? allLogs.filter(
          (l) => l.habit_id === item.id && l.completed_date >= weekStart,
        ).length
      : 0;
    const weeklyGoal = item.weekly_goal ?? 7;
    const weeklyRate = Math.min(weeklyDone / weeklyGoal, 1);
    const goalReached = weeklyDone >= weeklyGoal;

    const handleToggle = async () => {
      try {
        if (!isCompleted)
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await toggleHabit(item.id);
      } catch (err) {
        Alert.alert(t("error"), err.message);
      }
    };

    const handleRescueYesterday = async () => {
      if (freezes < 1) {
        Alert.alert(t("error"), t("buyFreezeDesc"));
        return;
      }
      Alert.alert(t("rescueTitle"), t("rescueDesc", { habit: item.title }), [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("rescueBtn"),
          style: "default",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            const success = await useFreezeForYesterday(item.id);
            if (success)
              Alert.alert(t("rescueSuccess"), t("rescueSuccessDesc"));
          },
        },
      ]);
    };

    return (
      <View style={[styles.card, isCompleted && styles.cardCompleted]}>
        <TouchableOpacity
          style={styles.cardLeft}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          <View
            style={[styles.iconBox, { backgroundColor: item.color + "1A" }]}
          >
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text
              style={[styles.habitTitle, isCompleted && styles.habitTitleDone]}
            >
              {item.title}
            </Text>
            <View style={styles.weeklyRow}>
              <View style={styles.weeklyBarBg}>
                <View
                  style={[
                    styles.weeklyBarFill,
                    {
                      width: `${weeklyRate * 100}%`,
                      backgroundColor: goalReached
                        ? colors.success
                        : item.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.weeklyText,
                  goalReached && { color: colors.success },
                ]}
              >
                {goalReached ? "✓ " : ""}
                {weeklyDone}/{weeklyGoal}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          {missedYesterday && !isCompleted && (
            <TouchableOpacity
              style={styles.rescueBtn}
              onPress={handleRescueYesterday}
            >
              <Ionicons name="snow" size={18} color="#3B82F6" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setEditingHabit(item);
              setForm({
                title: item.title,
                description: item.description || "",
                icon: item.icon,
                color: item.color,
                notify_hour: item.notify_hour ?? null,
                notify_minute: item.notify_minute ?? null,
                weekly_goal: item.weekly_goal ?? 7,
              });
              setModalVisible(true);
            }}
          >
            <Ionicons
              name="pencil-outline"
              size={20}
              color={colors.textSubtle}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.checkBox,
              { borderColor: item.color },
              isCompleted && { backgroundColor: item.color },
            ]}
            onPress={handleToggle}
            activeOpacity={0.6}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            {isCompleted && (
              <Ionicons
                name="checkmark-sharp"
                size={20}
                color="#FFF"
                style={styles.checkMark}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  const completedCount = logs.length;
  const totalCount = habits.length;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={activeTheme === "dark" ? "light-content" : "dark-content"}
      />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerPanel}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>
                {t("greeting").replace("👋", "").trim()} {getUsername()} 👋
              </Text>
              <Text style={styles.headerTitle}>{t("myHabits")}</Text>
            </View>

            <TouchableOpacity
              style={styles.energyBadge}
              onPress={() => setStoreModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.energyIcon}>⚡</Text>
              <Text style={styles.energyText}>{energy}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {totalCount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percentage}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount} {t("completed")}
            </Text>
          </View>
        )}

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HabitCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌟</Text>
              <Text style={styles.emptyTitle}>{t("noHabits")}</Text>
              <Text style={styles.emptySubtitle}>{t("addFirstHabit")}</Text>
            </View>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>

        <Modal
          visible={storeModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setStoreModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalDragIndicator} />
              <Text style={styles.modalTitle}>{t("storeTitle")}</Text>

              <View style={styles.storeInventoryBox}>
                <Text style={styles.storeInventoryText}>
                  {t("myBudget")}{" "}
                  <Text style={{ fontWeight: "800", color: colors.primary }}>
                    ⚡ {energy}
                  </Text>
                </Text>
                <Text style={styles.storeInventoryText}>
                  {t("myFreezes")}{" "}
                  <Text style={{ fontWeight: "800", color: "#3B82F6" }}>
                    ❄️ {freezes}
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.storeItem, energy < 100 && { opacity: 0.5 }]}
                onPress={handleBuyFreeze}
                disabled={energy < 100}
              >
                <View style={styles.storeItemIcon}>
                  <Text style={{ fontSize: 32 }}>❄️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeItemTitle}>
                    {t("freezeItemTitle")}
                  </Text>
                  <Text style={styles.storeItemDesc}>
                    {t("freezeItemDesc")}
                  </Text>
                </View>
                <View style={styles.storePriceBtn}>
                  <Text style={styles.storePriceText}>100 ⚡</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setStoreModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={closeModal}
            >
              <TouchableOpacity style={styles.modalBox} activeOpacity={1}>
                <View style={styles.modalDragIndicator} />
                <Text style={styles.modalTitle}>
                  {editingHabit ? t("editHabit") : t("newHabit")}
                </Text>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <TextInput
                    style={styles.modalInput}
                    placeholder={t("habitName")}
                    placeholderTextColor={colors.textSubtle}
                    value={form.title}
                    onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
                    maxLength={40}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder={t("descOptional")}
                    placeholderTextColor={colors.textSubtle}
                    value={form.description}
                    onChangeText={(v) =>
                      setForm((f) => ({ ...f, description: v }))
                    }
                    maxLength={80}
                  />

                  <Text style={styles.modalLabel}>{t("selectIcon")}</Text>
                  <View style={styles.iconRow}>
                    {ICONS.map((icon) => (
                      <TouchableOpacity
                        key={icon}
                        style={[
                          styles.iconOption,
                          form.icon === icon && styles.iconOptionSelected,
                        ]}
                        onPress={() => setForm((f) => ({ ...f, icon }))}
                      >
                        <Text style={styles.iconOptionText}>{icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.modalLabel}>{t("selectColor")}</Text>
                  <View style={styles.colorRow}>
                    {MODAL_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          form.color === color && styles.colorOptionSelected,
                        ]}
                        onPress={() => setForm((f) => ({ ...f, color }))}
                      />
                    ))}
                  </View>

                  <Text style={styles.modalLabel}>{t("weeklyGoal")}</Text>
                  <View style={styles.goalRow}>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.goalButton,
                          form.weekly_goal === day && {
                            backgroundColor: form.color,
                            borderColor: form.color,
                          },
                        ]}
                        onPress={() =>
                          setForm((f) => ({ ...f, weekly_goal: day }))
                        }
                      >
                        <Text
                          style={[
                            styles.goalNumber,
                            form.weekly_goal === day && styles.goalNumberActive,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* ✅ YUVAYA DÖNEN EFSANEVİ SAAT SEÇİCİ */}
                  <Text style={styles.modalLabel}>{t("notifyTime")}</Text>
                  <TouchableOpacity
                    style={styles.notifyToggle}
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        notify_hour: f.notify_hour === null ? 9 : null,
                        notify_minute: f.notify_minute === null ? 0 : null,
                      }))
                    }
                  >
                    <View style={styles.notifyToggleLeft}>
                      <Ionicons
                        name="notifications-outline"
                        size={20}
                        color={colors.textMuted}
                      />
                      <Text style={styles.notifyLabel}>
                        {form.notify_hour !== null
                          ? t("notifyOn", {
                              time: `${String(form.notify_hour).padStart(2, "0")}:${String(form.notify_minute).padStart(2, "0")}`,
                            })
                          : t("notifyOff")}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.togglePill,
                        form.notify_hour !== null && styles.togglePillActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleDot,
                          form.notify_hour !== null && styles.toggleDotActive,
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  {form.notify_hour !== null && (
                    <>
                      <View style={styles.timePickerRow}>
                        <View style={styles.timePickerBox}>
                          <TouchableOpacity
                            style={styles.timeArrow}
                            onPress={() =>
                              setForm((f) => ({
                                ...f,
                                notify_hour: (f.notify_hour + 1) % 24,
                              }))
                            }
                          >
                            <Ionicons
                              name="chevron-up"
                              size={24}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                          <Text style={styles.timeValue}>
                            {String(form.notify_hour).padStart(2, "0")}
                          </Text>
                          <TouchableOpacity
                            style={styles.timeArrow}
                            onPress={() =>
                              setForm((f) => ({
                                ...f,
                                notify_hour: (f.notify_hour + 23) % 24,
                              }))
                            }
                          >
                            <Ionicons
                              name="chevron-down"
                              size={24}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.timeSeparator}>:</Text>
                        <View style={styles.timePickerBox}>
                          <TouchableOpacity
                            style={styles.timeArrow}
                            onPress={() =>
                              setForm((f) => ({
                                ...f,
                                notify_minute: (f.notify_minute + 1) % 60,
                              }))
                            }
                          >
                            <Ionicons
                              name="chevron-up"
                              size={24}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                          <Text style={styles.timeValue}>
                            {String(form.notify_minute).padStart(2, "0")}
                          </Text>
                          <TouchableOpacity
                            style={styles.timeArrow}
                            onPress={() =>
                              setForm((f) => ({
                                ...f,
                                notify_minute: (f.notify_minute + 59) % 60,
                              }))
                            }
                          >
                            <Ionicons
                              name="chevron-down"
                              size={24}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.timeRemainingText}>
                        {getTimeRemainingText()}
                      </Text>
                    </>
                  )}

                  <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {editingHabit ? t("update") : t("save")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const getDynamicStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    headerContainer: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "android" ? 20 : 10,
      paddingBottom: 16,
    },
    headerPanel: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
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
    greeting: {
      color: colors.textMuted,
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 2,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    energyBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "1A",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary + "33",
    },
    energyIcon: { fontSize: 20, marginRight: 6 },
    energyText: { color: colors.primary, fontSize: 20, fontWeight: "800" },
    progressContainer: { paddingHorizontal: 24, marginBottom: 20 },
    progressBg: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 99,
      overflow: "hidden",
    },
    progressFill: { height: 8, borderRadius: 99 },
    progressText: {
      color: colors.textSubtle,
      fontSize: 13,
      marginTop: 8,
      textAlign: "center",
      fontWeight: "600",
    },
    list: { paddingHorizontal: 20, paddingBottom: 120 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 18,
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
    cardCompleted: { opacity: 0.4 },
    cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    iconBox: {
      width: 52,
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    iconText: { fontSize: 26 },
    cardInfo: { flex: 1 },
    habitTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 6,
      letterSpacing: -0.3,
    },
    habitTitleDone: {
      textDecorationLine: "line-through",
      color: colors.textSubtle,
    },
    weeklyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    weeklyBarBg: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 99,
      overflow: "hidden",
    },
    weeklyBarFill: { height: 6, borderRadius: 99 },
    weeklyText: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: "700",
      minWidth: 32,
    },
    cardActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingLeft: 10,
    },
    actionBtn: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: 10,
    },
    rescueBtn: {
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#3B82F622",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#3B82F655",
    },
    checkBox: {
      width: 32,
      height: 32,
      borderRadius: 10,
      borderWidth: 2.5,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.card,
    },
    checkMark: { marginTop: 2 },
    emptyContainer: { alignItems: "center", paddingTop: 80 },
    emptyEmoji: { fontSize: 64, marginBottom: 20 },
    emptyTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 8,
    },
    emptySubtitle: {
      color: colors.textSubtle,
      fontSize: 15,
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: 40,
    },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 24,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalBox: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 28,
      paddingBottom: Platform.OS === "ios" ? 48 : 28,
      maxHeight: "90%",
      width: "100%",
    },
    modalDragIndicator: {
      width: 40,
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 10,
      alignSelf: "center",
      marginBottom: 20,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 24,
      textAlign: "center",
      letterSpacing: -0.5,
    },
    modalInput: {
      backgroundColor: colors.inputBg,
      color: colors.text,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 18,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      fontWeight: "500",
    },
    modalLabel: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 12,
      marginTop: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    iconRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
      justifyContent: "center",
    },
    iconOption: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.inputBg,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "1A",
    },
    iconOptionText: { fontSize: 24 },
    colorRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 32,
      justifyContent: "center",
    },
    colorOption: { width: 40, height: 40, borderRadius: 20 },
    colorOptionSelected: { borderWidth: 4, borderColor: colors.background },
    goalRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    goalButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    goalNumber: { color: colors.textMuted, fontSize: 16, fontWeight: "bold" },
    goalNumberActive: { color: "#fff" },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 20,
      alignItems: "center",
      marginTop: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 18,
      letterSpacing: 0.5,
    },
    storeInventoryBox: {
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    storeInventoryText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    storeItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.primary + "55",
      marginBottom: 24,
    },
    storeItemIcon: {
      width: 56,
      height: 56,
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    storeItemTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 4,
    },
    storeItemDesc: {
      color: colors.textSubtle,
      fontSize: 12,
      lineHeight: 18,
      paddingRight: 10,
    },
    storePriceBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    storePriceText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    closeBtn: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: "center",
    },
    closeBtnText: { color: colors.textMuted, fontSize: 17, fontWeight: "800" },

    // ✅ GERİ GELEN SAAT STİLLERİ
    notifyToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    notifyToggleLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    notifyLabel: { color: colors.text, fontSize: 15, fontWeight: "600" },
    togglePill: {
      width: 48,
      height: 28,
      borderRadius: 99,
      backgroundColor: colors.border,
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    togglePillActive: { backgroundColor: colors.primary },
    toggleDot: {
      width: 20,
      height: 20,
      borderRadius: 99,
      backgroundColor: colors.textMuted,
    },
    toggleDotActive: { backgroundColor: "#fff", alignSelf: "flex-end" },
    timePickerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      paddingVertical: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timePickerBox: { alignItems: "center", gap: 8 },
    timeArrow: { padding: 4 },
    timeValue: {
      color: colors.text,
      fontSize: 36,
      fontWeight: "800",
      minWidth: 70,
      textAlign: "center",
    },
    timeSeparator: {
      color: colors.textMuted,
      fontSize: 36,
      fontWeight: "800",
      marginBottom: 8,
    },
    timeRemainingText: {
      color: colors.success,
      fontSize: 13,
      textAlign: "center",
      marginBottom: 16,
      marginTop: -4,
      fontWeight: "500",
    },
  });
