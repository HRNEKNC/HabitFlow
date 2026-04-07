import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { useHabitStore } from "../../src/store/useHabitStore";

const ALL_BADGE_IDS = [
  "first_habit",
  "streak_3",
  "streak_7",
  "streak_30",
  "goal_reached",
  "all_done",
  "habit_5",
];

export default function ProfileScreen() {
  const deleteAccount = useHabitStore((s) => s.deleteAccount);
  const user = useHabitStore((s) => s.user);
  const stats = useHabitStore((s) => s.stats);
  const loading = useHabitStore((s) => s.loading);
  const userBadges = useHabitStore((s) => s.userBadges); // ✅ Yeni

  const [signingOut, setSigningOut] = useState(false);
  const updateUsername = useHabitStore((s) => s.updateUsername);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  // Eski getUsername fonksiyonunu BUNUNLA DEĞİŞTİR:
  function getUsername() {
    // Önce özel belirlediği bir ad var mı ona bakar, yoksa emailden üretir
    if (user?.user_metadata?.username) return user.user_metadata.username;
    return user?.email ? user.email.split("@")[0] : "...";
  }

  async function handleSaveUsername() {
    if (!newName.trim()) {
      setModalVisible(false);
      return;
    }
    setUpdatingName(true);
    try {
      await updateUsername(newName.trim());
      setModalVisible(false);
      setNewName("");
    } catch (error) {
      Alert.alert("Hata", error.message);
    } finally {
      setUpdatingName(false);
    }
  }

  function handleSignOut() {
    Alert.alert("Çıkış Yap", "Hesabından çıkmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert("Hata", error.message);
            setSigningOut(false);
          }
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "⚠️ Hesabı Sil",
      "Bu işlem geri alınamaz!\n\nTüm alışkanlıkların, istatistiklerin ve rozetlerin kalıcı olarak silinir.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Devam Et",
          style: "destructive",
          onPress: () => {
            // İkinci onay — çok kritik işlem
            Alert.alert(
              "Son Onay",
              "Hesabını kalıcı olarak silmek istediğinden emin misin?",
              [
                { text: "Hayır, Vazgeçtim", style: "cancel" },
                {
                  text: "Evet, Sil",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      // _layout.js oturumu dinliyor → login'e yönlendirir
                    } catch (err) {
                      Alert.alert("Hata", err.message);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }

  function getUsername() {
    return user?.email ? user.email.split("@")[0] : "...";
  }
  function getInitial() {
    return getUsername().charAt(0).toUpperCase();
  }
  function getMemberSince() {
    return user?.created_at
      ? new Date(user.created_at).toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  }

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Profil</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text style={styles.username} numberOfLines={1}>
              {getUsername()}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="pencil-outline" size={18} color="#6366f1" />
            </TouchableOpacity>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="calendar-outline" size={13} color="#555" />
            <Text style={styles.memberText}>
              {getMemberSince()} tarihinden beri üye
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.habits}</Text>
            <Text style={styles.statLabel}>Alışkanlık</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.todayLogs}</Text>
            <Text style={styles.statLabel}>Bugün ✓</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalLogs}</Text>
            <Text style={styles.statLabel}>Toplam ✓</Text>
          </View>
        </View>

        {/* ── Rozetler ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Rozetler {userBadges.length > 0 ? `(${userBadges.length})` : ""}
          </Text>
          {userBadges.length === 0 ? (
            <View style={styles.emptyBadges}>
              <Text style={styles.emptyBadgeEmoji}>🔒</Text>
              <Text style={styles.emptyBadgeTitle}>Henüz rozet kazanmadın</Text>
              <Text style={styles.emptyBadgeSub}>
                Alışkanlıklarını tamamla ve serileri kır!
              </Text>
            </View>
          ) : (
            <View style={styles.badgeGrid}>
              {userBadges.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    { borderColor: badge.color + "44" },
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIconCircle,
                      { backgroundColor: badge.color + "18" },
                    ]}
                  >
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  </View>
                  <Text style={[styles.badgeTitle, { color: badge.color }]}>
                    {badge.title}
                  </Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {badge.description}
                  </Text>
                  <Text style={styles.badgeDate}>
                    {new Date(badge.earned_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
              ))}
              {ALL_BADGE_IDS.filter(
                (id) => !userBadges.find((b) => b.id === id),
              ).map((id) => (
                <View key={id} style={styles.badgeCardLocked}>
                  <Text style={styles.badgeIconLocked}>🔒</Text>
                  <Text style={styles.badgeLockedText}>Kilitli</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            <View style={styles.divider} />
            <InfoRow
              icon="person-outline"
              label="Kullanıcı Adı"
              value={getUsername()}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="shield-checkmark-outline"
              label="Hesap Durumu"
              value="✅ Aktif"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.infoCard}>
            <InfoRow
              icon="phone-portrait-outline"
              label="Uygulama"
              value="HabitFlow"
            />
            <View style={styles.divider} />
            <InfoRow
              icon="code-slash-outline"
              label="Geliştirici"
              value="HRN SOFTWARE"
            />
            <View style={styles.divider} />
            <InfoRow icon="layers-outline" label="Versiyon" value="1.0.0" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, signingOut && { opacity: 0.6 }]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.signOutText}>Çıkış Yap</Text>
            </>
          )}
        </TouchableOpacity>
        {/* ── Hesabı Sil ── */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={18} color="#ef444488" />
          <Text style={styles.deleteText}>Hesabımı Kalıcı Olarak Sil</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* ── Kullanıcı Adı Değiştirme Modalı ── */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcı Adı Belirle</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Yeni kullanıcı adın..."
              placeholderTextColor="#555"
              value={newName}
              onChangeText={setNewName}
              autoFocus={true}
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
                disabled={updatingName}
              >
                <Text style={styles.modalButtonTextCancel}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveUsername}
                disabled={updatingName}
              >
                {updatingName ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons
          name={icon}
          size={18}
          color="#6366f1"
          style={styles.infoIcon}
        />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
  pageTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: { color: "#fff", fontSize: 34, fontWeight: "bold" },
  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: { color: "#555", fontSize: 14, marginBottom: 12 },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberText: { color: "#555", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  statNumber: { color: "#6366f1", fontSize: 26, fontWeight: "bold" },
  statLabel: { color: "#555", fontSize: 11, marginTop: 4, textAlign: "center" },
  section: { marginBottom: 20 },
  sectionTitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLeft: { flexDirection: "row", alignItems: "center" },
  infoIcon: { marginRight: 12 },
  infoLabel: { color: "#888", fontSize: 14 },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    maxWidth: "55%",
    textAlign: "right",
  },
  divider: { height: 1, backgroundColor: "#2a2a2a", marginHorizontal: 16 },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#ef444433",
    marginTop: 8,
  },
  signOutText: { color: "#ef4444", fontWeight: "bold", fontSize: 16 },

  // ✅ Rozet Stilleri
  emptyBadges: {
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  emptyBadgeEmoji: { fontSize: 40, marginBottom: 12 },
  emptyBadgeTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptyBadgeSub: {
    color: "#555",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    width: "48%",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  badgeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  badgeIcon: { fontSize: 28 },
  badgeTitle: { fontSize: 13, fontWeight: "bold", textAlign: "center" },
  badgeDesc: {
    color: "#555",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  badgeDate: { color: "#333", fontSize: 10, marginTop: 2 },
  badgeCardLocked: {
    width: "48%",
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  badgeIconLocked: { fontSize: 28, opacity: 0.3 },
  badgeLockedText: { color: "#333", fontSize: 12 },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  deleteText: {
    color: "#ef444866",
    fontSize: 13,
  },
  // ✅ Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    width: "100%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#0f0f0f",
    color: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#2a2a2a",
  },
  modalButtonSave: {
    backgroundColor: "#6366f1",
  },
  modalButtonTextCancel: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalButtonTextSave: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
