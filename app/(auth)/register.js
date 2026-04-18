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

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const appTheme = useHabitStore((s) => s.appTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];
  const styles = useMemo(() => getDynamicStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert(t("error"), t("passMatchError"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert(t("error"), error.message);
    } else {
      Alert.alert(t("registerSuccess"), t("checkEmail"), [
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
                <Text style={styles.iconText}>🚀</Text>
              </View>
              <Text style={styles.title}>{t("registerTitle")}</Text>
              <Text style={styles.subtitle}>{t("registerSub")}</Text>
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

              <Text style={styles.label}>
                {t("passPlace")
                  .replace("Your password", "Password")
                  .replace("Tu contraseña", "Contraseña")
                  .replace("Şifren", "Şifre")}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textSubtle}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={styles.label}>{t("passConfirm")}</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textSubtle}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.button}
                onPress={signUpWithEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t("registerBtn")}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerText}>{t("loginLink")}</Text>
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
    header: { alignItems: "center", marginBottom: 30 },
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
    subtitle: { color: colors.textSubtle, fontSize: 16, fontWeight: "500" },
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
      marginBottom: 20,
      fontWeight: "500",
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 20,
      alignItems: "center",
      marginTop: 10,
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
    footer: { marginTop: 30, alignItems: "center" },
    footerText: { color: colors.textSubtle, fontSize: 15, fontWeight: "600" },
  });
