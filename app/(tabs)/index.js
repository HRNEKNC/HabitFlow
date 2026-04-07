import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useHabitStore } from "../../src/store/useHabitStore";

const ICONS = ["⭐", "💪", "📚", "💧", "🏃", "🧘", "🎯", "🎸", "✍️", "🍎"];
const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  icon: "⭐",
  color: "#6366f1",
  notify_hour: null,
  notify_minute: null,
  weekly_goal: 7, // ✅ Yeni
};

export default function HomeScreen() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const loading = useHabitStore((s) => s.loading);
  const refreshing = useHabitStore((s) => s.refreshing);
  const refresh = useHabitStore((s) => s.refresh);
  const toggleHabit = useHabitStore((s) => s.toggleHabit);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function openAddModal() {
    setEditingHabit(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEditModal(habit) {
    setEditingHabit(habit);
    setForm({
      title: habit.title,
      description: habit.description || "",
      icon: habit.icon,
      color: habit.color,
      notify_hour: habit.notify_hour ?? null,
      notify_minute: habit.notify_minute ?? null,
      weekly_goal: habit.weekly_goal ?? 7, // ✅ Yeni
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingHabit(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      Alert.alert("Hata", "Alışkanlık adı boş olamaz.");
      return;
    }
    setSaving(true);
    try {
      if (editingHabit) {
        await updateHabit({ id: editingHabit.id, ...form });
      } else {
        await addHabit(form);
      }
      closeModal();
    } catch (err) {
      Alert.alert("Hata", err.message);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(habitId) {
    Alert.alert(
      "Alışkanlığı Sil",
      "Bu alışkanlığı ve tüm kayıtlarını silmek istiyor musun?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit(habitId);
            } catch (err) {
              Alert.alert("Hata", err.message);
            }
          },
        },
      ],
    );
  }

  // ✅ Güncellenmiş HabitCard
  function HabitCard({ item }) {
    const isCompleted = logs.includes(item.id);

    // Haftalık hesaplamalar
    const weekStart = useHabitStore((s) => s.weekStartStr);
    const allLogs = useHabitStore((s) => s.allLogs);
    const weeklyDone = weekStart
      ? allLogs.filter(
          (l) => l.habit_id === item.id && l.completed_date >= weekStart,
        ).length
      : 0;
    const weeklyGoal = item.weekly_goal ?? 7;
    const weeklyRate = Math.min(weeklyDone / weeklyGoal, 1);
    const goalReached = weeklyDone >= weeklyGoal;

    return (
      <View style={[styles.card, isCompleted && styles.cardCompleted]}>
        <TouchableOpacity
          style={styles.cardLeft}
          onPress={async () => {
            try {
              await toggleHabit(item.id);
            } catch (err) {
              Alert.alert("Hata", err.message);
            }
          }}
          activeOpacity={0.7}
        >
          <View
            style={[styles.iconBox, { backgroundColor: item.color + "22" }]}
          >
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text
              style={[styles.habitTitle, isCompleted && styles.habitTitleDone]}
            >
              {item.title}
            </Text>
            {/* ✅ Mini Progress Bar */}
            <View style={styles.weeklyRow}>
              <View style={styles.weeklyBarBg}>
                <View
                  style={[
                    styles.weeklyBarFill,
                    {
                      width: `${weeklyRate * 100}%`,
                      backgroundColor: goalReached ? "#10b981" : item.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.weeklyText, goalReached && { color: "#10b981" }]}
              >
                {goalReached ? "✓ " : ""}
                {weeklyDone}/{weeklyGoal}g
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil-outline" size={18} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
          <View
            style={[
              styles.checkBox,
              { borderColor: item.color },
              isCompleted && { backgroundColor: item.color },
            ]}
          >
            {isCompleted && <Text style={styles.checkMark}>✓</Text>}
          </View>
        </View>
      </View>
    );
  }

  function EmptyState() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🌱</Text>
        <Text style={styles.emptyTitle}>Henüz alışkanlık yok</Text>
        <Text style={styles.emptySubtitle}>
          Sağ alttaki + butonuna basarak{"\n"}ilk alışkanlığını ekle!
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const completedCount = logs.length;
  const totalCount = habits.length;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.headerTitle}>Alışkanlıklarım</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={styles.statsNumber}>{percentage}%</Text>
          <Text style={styles.statsLabel}>bugün</Text>
        </View>
      </View>

      {totalCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} tamamlandı
          </Text>
        </View>
      )}

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HabitCard item={item} />}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#6366f1"
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity style={styles.modalBox} activeOpacity={1}>
            <Text style={styles.modalTitle}>
              {editingHabit ? "✏️ Alışkanlığı Düzenle" : "➕ Yeni Alışkanlık"}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Alışkanlık adı"
              placeholderTextColor="#444"
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
              maxLength={40}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Açıklama (opsiyonel)"
              placeholderTextColor="#444"
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              maxLength={80}
            />

            <Text style={styles.modalLabel}>İkon Seç</Text>
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

            <Text style={styles.modalLabel}>Renk Seç</Text>
            <View style={styles.colorRow}>
              {COLORS.map((color) => (
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

            {/* ✅ Haftalık Hedef UI */}
            <Text style={styles.modalLabel}>Haftalık Hedef</Text>
            <View style={styles.goalRow}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isSelected = form.weekly_goal === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.goalButton,
                      isSelected && {
                        backgroundColor: form.color,
                        borderColor: form.color,
                      },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, weekly_goal: day }))}
                  >
                    <Text
                      style={[
                        styles.goalNumber,
                        isSelected && styles.goalNumberActive,
                      ]}
                    >
                      {day}
                    </Text>
                    {day === 7 && (
                      <Text
                        style={[
                          styles.goalSub,
                          isSelected && styles.goalSubActive,
                        ]}
                      >
                        her gün
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.goalHint}>
              {form.weekly_goal === 7
                ? "🔥 Haftanın her günü tamamla"
                : `🎯 Haftada ${form.weekly_goal} gün tamamla`}
            </Text>

            <Text style={styles.modalLabel}>Hatırlatma Saati</Text>
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
                <Text style={styles.notifyIcon}>🔔</Text>
                <Text style={styles.notifyLabel}>
                  {form.notify_hour !== null
                    ? `Her gün ${String(form.notify_hour).padStart(2, "0")}:${String(form.notify_minute).padStart(2, "0")}'de hatırlat`
                    : "Hatırlatma kapalı"}
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
                    <Text style={styles.timeArrowText}>▲</Text>
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
                    <Text style={styles.timeArrowText}>▼</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timePickerBox}>
                  <TouchableOpacity
                    style={styles.timeArrow}
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        notify_minute: (f.notify_minute + 15) % 60,
                      }))
                    }
                  >
                    <Text style={styles.timeArrowText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>
                    {String(form.notify_minute).padStart(2, "0")}
                  </Text>
                  <TouchableOpacity
                    style={styles.timeArrow}
                    onPress={() =>
                      setForm((f) => ({
                        ...f,
                        notify_minute: (f.notify_minute + 45) % 60,
                      }))
                    }
                  >
                    <Text style={styles.timeArrowText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
                  {editingHabit ? "Güncelle" : "Kaydet"}
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ Yeni Hedef UI Stilleri
  goalRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  goalButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  goalNumber: { color: "#888", fontSize: 15, fontWeight: "bold" },
  goalNumberActive: { color: "#fff" },
  goalSub: { color: "#555", fontSize: 9, marginTop: 1 },
  goalSubActive: { color: "#ffffffaa" },
  goalHint: { color: "#555", fontSize: 13, marginBottom: 16, marginLeft: 2 },
  weeklyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  weeklyBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: "#2a2a2a",
    borderRadius: 99,
    overflow: "hidden",
  },
  weeklyBarFill: { height: 4, borderRadius: 99 },
  weeklyText: { color: "#555", fontSize: 11, fontWeight: "600", minWidth: 28 },

  notifyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 12,
  },
  notifyToggleLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifyIcon: { fontSize: 18 },
  notifyLabel: { color: "#888", fontSize: 14 },
  togglePill: {
    width: 44,
    height: 26,
    borderRadius: 99,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  togglePillActive: { backgroundColor: "#6366f1" },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: "#555",
  },
  toggleDotActive: { backgroundColor: "#fff", alignSelf: "flex-end" },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  timePickerBox: { alignItems: "center", gap: 4 },
  timeArrow: { padding: 8 },
  timeArrowText: { color: "#6366f1", fontSize: 16, fontWeight: "bold" },
  timeValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    minWidth: 60,
    textAlign: "center",
  },
  timeSeparator: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { color: "#555", fontSize: 14 },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  statsBox: {
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  statsNumber: { color: "#6366f1", fontSize: 22, fontWeight: "bold" },
  statsLabel: { color: "#555", fontSize: 11 },
  progressContainer: { paddingHorizontal: 24, marginBottom: 12 },
  progressBg: {
    height: 6,
    backgroundColor: "#1a1a1a",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: "#6366f1", borderRadius: 99 },
  progressText: { color: "#555", fontSize: 12, marginTop: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  cardCompleted: { opacity: 0.6 },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  habitTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  habitTitleDone: { textDecorationLine: "line-through", color: "#555" },
  habitDesc: { color: "#555", fontSize: 13, marginTop: 2 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: "center", paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  emptySubtitle: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: { color: "#fff", fontSize: 30, fontWeight: "300", marginTop: -2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 48,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#1f1f1f",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 12,
  },
  modalLabel: { color: "#888", fontSize: 13, marginBottom: 10, marginTop: 4 },
  iconRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1f1f1f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  iconOptionSelected: { borderColor: "#6366f1", backgroundColor: "#6366f122" },
  iconOptionText: { fontSize: 20 },
  colorRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  colorOption: { width: 32, height: 32, borderRadius: 99 },
  colorOptionSelected: { borderWidth: 3, borderColor: "#fff" },
  saveButton: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
