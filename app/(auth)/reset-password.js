import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import { THEME_COLORS, useHabitStore } from "../../src/store/useHabitStore";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const appTheme = useHabitStore((s) => s.appTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];
  const styles = useMemo(() => getDynamicStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert(t("error"), error.message);
    } else {
      Alert.alert(t("checkEmailTitle"), t("checkEmailDesc"), [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    }
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>🔐</Text>
              </View>
              <Text style={styles.title}>{t("forgotPassTitle")}</Text>
              <Text
                style={styles.subtitle}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {t("forgotPassSub")}
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder={t("emailPlace")}
                placeholderTextColor={colors.textSubtle}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TouchableOpacity
                style={styles.button}
                onPress={resetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t("resetBtn")}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Ionicons
                    name="arrow-back"
                    size={18}
                    color={colors.textSubtle}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.footerText}>{t("backToLogin")}</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getDynamicStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
    header: { alignItems: "center", marginBottom: 40 },
    iconBox: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: colors.primary + "1A",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.primary + "33",
    },
    iconText: { fontSize: 36 },
    title: {
      color: colors.text,
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -1,
      marginBottom: 8,
    },
    subtitle: {
      color: colors.textSubtle,
      fontSize: 15,
      fontWeight: "500",
      textAlign: "center",
      paddingHorizontal: 20,
    },
    form: { width: "100%" },
    label: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.inputBg,
      color: colors.text,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 18,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 30,
      fontWeight: "500",
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 20,
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
    footer: { marginTop: 40, alignItems: "center" },
    footerText: { color: colors.textSubtle, fontSize: 16, fontWeight: "700" },
  });
