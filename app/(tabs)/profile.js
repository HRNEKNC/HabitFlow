import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
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
import { supabase } from "../../src/lib/supabase";
import { THEME_COLORS, useHabitStore } from "../../src/store/useHabitStore";

const ALL_BADGE_IDS = [
  "first_habit",
  "streak_3",
  "streak_7",
  "streak_30",
  "goal_reached",
  "all_done",
  "habit_5",
];
const AVATAR_OPTIONS = [
  "👨‍💻",
  "👩‍💻",
  "🦊",
  "🦁",
  "🚀",
  "⚡",
  "👑",
  "💎",
  "🎯",
  "🎸",
  "🎮",
  "🌟",
  "🐱",
  "🐶",
  "🐼",
  "😎",
  "🤠",
  "👽",
];

const LANG_OPTIONS = [
  { code: "tr", label: "🇹🇷 Türkçe" },
  { code: "en", label: "🇬🇧 English" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "zh", label: "🇨🇳 中文" },
];

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();

  const deleteAccount = useHabitStore((s) => s.deleteAccount);
  const updateProfileData = useHabitStore((s) => s.updateProfileData);
  const user = useHabitStore((s) => s.user);
  const stats = useHabitStore((s) => s.stats);
  const loading = useHabitStore((s) => s.loading);
  const userBadges = useHabitStore((s) => s.userBadges);

  const appTheme = useHabitStore((s) => s.appTheme);
  const setAppTheme = useHabitStore((s) => s.setAppTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];
  const styles = useMemo(() => getDynamicStyles(colors), [colors]);

  const [signingOut, setSigningOut] = useState(false);
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);
  const [isLangModalVisible, setLangModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [updating, setUpdating] = useState(false);

  const THEME_OPTIONS = [
    {
      code: "system",
      label: t("themeSystem", { defaultValue: "Sistem Ayarı" }),
    },
    {
      code: "light",
      label: t("themeLight", { defaultValue: "Aydınlık Mod ☀️" }),
    },
    {
      code: "dark",
      label: t("themeDark", { defaultValue: "Karanlık Mod 🌙" }),
    },
  ];

  function getUsername() {
    const metaName = user?.user_metadata?.username;
    if (metaName) return String(metaName);
    if (user?.email) return String(user.email.split("@")[0]);
    return "User";
  }

  function getAvatar() {
    const metaAvatar = user?.user_metadata?.avatar_emoji;
    if (metaAvatar) return metaAvatar;
    const name = getUsername();
    return name ? name.charAt(0).toUpperCase() : "U";
  }

  function getMemberSince() {
    return user?.created_at
      ? new Date(user.created_at).toLocaleDateString(i18n.language, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  }

  async function handleSaveUsername() {
    if (!newName.trim()) {
      setNameModalVisible(false);
      return;
    }
    setUpdating(true);
    try {
      await updateProfileData({ username: newName.trim() });
      setNameModalVisible(false);
      setNewName("");
    } catch (error) {
      Alert.alert(t("error"), error.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveAvatar(selectedAvatar) {
    setUpdating(true);
    try {
      await updateProfileData({ avatar_emoji: selectedAvatar });
      setAvatarModalVisible(false);
    } catch (error) {
      Alert.alert(t("error"), error.message);
    } finally {
      setUpdating(false);
    }
  }

  function handleSignOut() {
    Alert.alert(t("signOut"), t("signOutDesc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("signOut"),
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert(t("error"), error.message);
            setSigningOut(false);
          }
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(t("deleteAccount"), t("deleteAccWarning"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("continue"),
        style: "destructive",
        onPress: () => {
          Alert.alert(t("finalConfirm"), t("finalConfirmDesc"), [
            { text: t("noCancel"), style: "cancel" },
            {
              text: t("yesDelete"),
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteAccount();
                } catch (err) {
                  Alert.alert(t("error"), err.message);
                }
              },
            },
          ]);
        },
      },
    ]);
  }

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.primary}
          style={styles.infoIcon}
        />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={activeTheme === "dark" ? "light-content" : "dark-content"}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>{t("profile")}</Text>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => setAvatarModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{getAvatar()}</Text>
            <View style={styles.avatarEditIcon}>
              <Ionicons name="camera-outline" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.usernameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {getUsername()}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setNewName(getUsername());
                setNameModalVisible(true);
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.memberBadge}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.textSubtle}
            />
            <Text style={styles.memberText}>
              {t("memberSince", { date: getMemberSince() })}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.habits}</Text>
            <Text style={styles.statLabel}>{t("habit")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.todayLogs}</Text>
            <Text style={styles.statLabel}>{t("todayDone")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalLogs}</Text>
            <Text style={styles.statLabel}>{t("totalDone")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("badges")}{" "}
            {userBadges.length > 0 ? `(${userBadges.length})` : ""}
          </Text>
          {userBadges.length === 0 ? (
            <View style={styles.emptyBadges}>
              <Text style={styles.emptyBadgeEmoji}>🔒</Text>
              <Text style={styles.emptyBadgeTitle}>{t("noBadgeTitle")}</Text>
              <Text style={styles.emptyBadgeSub}>{t("noBadgeSub")}</Text>
            </View>
          ) : (
            <View style={styles.badgeGrid}>
              {userBadges.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    { borderColor: badge.color + "33" },
                  ]}
                >
                  <View
                    style={[
                      styles.badgeIconCircle,
                      { backgroundColor: badge.color + "1A" },
                    ]}
                  >
                    <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
                  </View>
                  <Text style={[styles.badgeTitle, { color: badge.color }]}>
                    {t(`badge_${badge.id}_title`, {
                      defaultValue: badge.title,
                    })}
                  </Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>
                    {t(`badge_${badge.id}_desc`, {
                      defaultValue: badge.description,
                    })}
                  </Text>
                </View>
              ))}
              {ALL_BADGE_IDS.filter(
                (id) => !userBadges.find((b) => b.id === id),
              ).map((id) => (
                <View key={id} style={styles.badgeCardLocked}>
                  <Ionicons
                    name="lock-closed"
                    size={32}
                    color={colors.textSubtle}
                    style={{ opacity: 0.3 }}
                  />
                  <Text style={styles.badgeLockedText}>{t("locked")}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("accountInfo")}</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            <View style={styles.divider} />
            <InfoRow
              icon="person-outline"
              label={t("username")}
              value={getUsername()}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="shield-checkmark-outline"
              label={t("status")}
              value={t("active")}
            />
            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => setThemeModalVisible(true)}
              activeOpacity={0.7}
              style={styles.rowClickable}
            >
              <View style={{ flex: 1 }}>
                <InfoRow
                  icon="color-palette-outline"
                  label={t("theme", { defaultValue: "Tema" })}
                  value={THEME_OPTIONS.find((t) => t.code === appTheme)?.label}
                />
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSubtle}
              />
            </TouchableOpacity>
            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => setLangModalVisible(true)}
              activeOpacity={0.7}
              style={styles.rowClickable}
            >
              <View style={{ flex: 1 }}>
                <InfoRow
                  icon="language-outline"
                  label={t("changeLang")}
                  value={
                    LANG_OPTIONS.find((l) => l.code === i18n.language)?.label ||
                    "English"
                  }
                />
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSubtle}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("app")}</Text>
          <View style={styles.infoCard}>
            <InfoRow
              icon="phone-portrait-outline"
              label={t("app")}
              value="Habit Flow"
            />
            <View style={styles.divider} />
            <InfoRow
              icon="code-slash-outline"
              label={t("developer")}
              value="HRN SOFTWARE"
            />
            <View style={styles.divider} />
            <InfoRow icon="layers-outline" label={t("version")} value="1.0.1" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, signingOut && { opacity: 0.6 }]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={22}
                color={colors.danger}
              />
              <Text style={styles.signOutText}>{t("signOut")}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={colors.danger + "99"}
          />
          <Text style={styles.deleteText}>{t("deleteAccount")}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modallar Aynı Şekilde Korundu - Sadece Premium Stilleri Alıyor */}
      <Modal
        visible={isNameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentCenter}>
            <Text style={styles.modalTitle}>{t("setUsername")}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t("newUsername")}
              placeholderTextColor={colors.textSubtle}
              value={newName}
              onChangeText={setNewName}
              autoFocus={true}
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setNameModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.modalButtonTextCancel}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveUsername}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>{t("save")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAvatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.modalContentBottom}>
            <View style={styles.modalDragIndicator} />
            <Text style={styles.modalTitle}>{t("selectAvatar")}</Text>
            {updating ? (
              <View style={{ padding: 40 }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.avatarOptionBox}
                    onPress={() => handleSaveAvatar(emoji)}
                  >
                    <Text style={{ fontSize: 32 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setAvatarModalVisible(false)}
              disabled={updating}
            >
              <Text style={styles.closeBtnText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isLangModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.modalContentBottom}>
            <View style={styles.modalDragIndicator} />
            <Text style={styles.modalTitle}>{t("changeLang")}</Text>
            <View style={styles.optionsGrid}>
              {LANG_OPTIONS.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionBox,
                    i18n.language === lang.code && styles.optionBoxSelected,
                  ]}
                  onPress={() => {
                    i18n.changeLanguage(lang.code);
                    setLangModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      i18n.language === lang.code && styles.optionTextSelected,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isThemeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlayBottom}>
          <View style={styles.modalContentBottom}>
            <View style={styles.modalDragIndicator} />
            <Text style={styles.modalTitle}>
              {t("theme", { defaultValue: "Tema" })}
            </Text>
            <View style={styles.optionsGrid}>
              {THEME_OPTIONS.map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.code}
                  style={[
                    styles.optionBox,
                    appTheme === themeOption.code && styles.optionBoxSelected,
                  ]}
                  onPress={() => {
                    setAppTheme(themeOption.code);
                    setThemeModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      appTheme === themeOption.code &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {themeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setThemeModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    scroll: { paddingHorizontal: 20, paddingBottom: 60 },
    headerContainer: {
      paddingTop: Platform.OS === "ios" ? 16 : 24,
      paddingBottom: 16,
    },
    pageTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.5,
    },

    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 32,
      alignItems: "center",
      marginBottom: 24,
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
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      position: "relative",
    },
    avatarText: { color: "#fff", fontSize: 44, fontWeight: "bold" },
    avatarEditIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.inputBg,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.card,
    },
    usernameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 6,
    },
    username: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    email: { color: colors.textSubtle, fontSize: 15, marginBottom: 16 },
    memberBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.inputBg,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: colors.border,
    },
    memberText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },

    statsRow: { flexDirection: "row", gap: 12, marginBottom: 32 },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
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
    statNumber: {
      color: colors.primary,
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: -1,
    },
    statLabel: {
      color: colors.textSubtle,
      fontSize: 12,
      marginTop: 4,
      fontWeight: "600",
      textAlign: "center",
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
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
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
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    infoLeft: { flexDirection: "row", alignItems: "center" },
    infoIcon: { marginRight: 14 },
    infoLabel: { color: colors.textMuted, fontSize: 16, fontWeight: "600" },
    infoValue: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      maxWidth: "55%",
      textAlign: "right",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },
    rowClickable: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 20,
    },

    signOutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingVertical: 20,
      borderWidth: 1,
      borderColor: colors.danger + "33",
      marginTop: 8,
      ...Platform.select({
        ios: {
          shadowColor: colors.danger,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    signOutText: { color: colors.danger, fontWeight: "800", fontSize: 17 },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      marginTop: 12,
    },
    deleteText: {
      color: colors.danger + "99",
      fontSize: 14,
      fontWeight: "600",
    },

    emptyBadges: {
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 40,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyBadgeEmoji: { fontSize: 52, marginBottom: 16 },
    emptyBadgeTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
    },
    emptyBadgeSub: {
      color: colors.textSubtle,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 22,
    },
    badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    badgeCard: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
        },
        android: { elevation: 2 },
      }),
    },
    badgeIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 6,
    },
    badgeTitle: {
      fontSize: 15,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.3,
    },
    badgeDesc: {
      color: colors.textSubtle,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
      fontWeight: "500",
    },
    badgeCardLocked: {
      width: "48%",
      backgroundColor: colors.inputBg,
      borderRadius: 20,
      padding: 18,
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeLockedText: {
      color: colors.textSubtle,
      fontSize: 14,
      fontWeight: "600",
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContentCenter: {
      backgroundColor: colors.card,
      width: "100%",
      borderRadius: 28,
      padding: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalInput: {
      backgroundColor: colors.inputBg,
      color: colors.text,
      borderRadius: 16,
      padding: 18,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
      fontWeight: "500",
    },
    modalActions: { flexDirection: "row", gap: 12 },
    modalButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    modalButtonCancel: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonSave: { backgroundColor: colors.primary },
    modalButtonTextCancel: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: "800",
    },
    modalButtonTextSave: { color: "#fff", fontSize: 16, fontWeight: "800" },

    modalOverlayBottom: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "flex-end",
    },
    modalContentBottom: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 28,
      paddingBottom: Platform.OS === "ios" ? 48 : 28,
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

    avatarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 24,
    },
    avatarOptionBox: {
      width: "15%",
      aspectRatio: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    optionsGrid: { gap: 12, marginBottom: 24 },
    optionBox: {
      backgroundColor: colors.inputBg,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionBoxSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "1A",
    },
    optionText: { color: colors.text, fontSize: 17, fontWeight: "600" },
    optionTextSelected: { color: colors.primary, fontWeight: "800" },

    closeBtn: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: "center",
      marginTop: 8,
    },
    closeBtnText: { color: colors.textMuted, fontSize: 17, fontWeight: "800" },
  });
