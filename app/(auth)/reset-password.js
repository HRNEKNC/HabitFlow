import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/lib/supabase";

// ─── 3 aşama ───────────────────────────────
// 'email'   → email gir, link gönder
// 'sent'    → email gönderildi, bilgilendirme
// 'success' → (ileride deep link ile dönünce)

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert("Hata", "Lütfen email adresini gir.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Hata", "Geçerli bir email adresi gir.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // Kullanıcı linke tıklayınca bu URL'e yönlendirilir
      // Expo Go'da deep link olarak çalışır
      redirectTo: "habitflow://reset-password",
    });

    setLoading(false);

    if (error) {
      Alert.alert("Hata", error.message);
      return;
    }

    // Hata yoksa → bilgilendirme ekranına geç
    setSent(true);
  }

  // ─── Email gönderildi ekranı ─────────────
  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <Text style={styles.successEmoji}>📬</Text>
          <Text style={styles.successTitle}>Email Gönderildi!</Text>
          <Text style={styles.successText}>
            <Text style={styles.emailHighlight}>{email}</Text> adresine şifre
            sıfırlama linki gönderdik.{"\n\n"}
            Gelen kutunu kontrol et. Link 1 saat geçerlidir.
          </Text>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>📌 Bulamıyor musun?</Text>
            <Text style={styles.tipsText}>
              • Spam / Gereksiz klasörünü kontrol et
            </Text>
            <Text style={styles.tipsText}>
              • Email adresi doğru mu kontrol et
            </Text>
            <Text style={styles.tipsText}>• Birkaç dakika bekle</Text>
          </View>

          {/* Tekrar gönder */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={() => {
              setSent(false);
              setEmail("");
            }}
          >
            <Text style={styles.resendText}>Farklı email ile tekrar dene</Text>
          </TouchableOpacity>

          {/* Giriş ekranına dön */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#6366f1" />
            <Text style={styles.backToLoginText}>Giriş Ekranına Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Email giriş ekranı ──────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        {/* Geri butonu */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#888" />
        </TouchableOpacity>

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Hesabınla ilişkili email adresini gir.{"\n"}
            Şifre sıfırlama linkini gönderelim.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Adresi</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@email.com"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sıfırlama Linki Gönder</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Alt link */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>
            Şifreni hatırladın mı?{" "}
            <Text style={styles.linkBold}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 32,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },

  // Başlık
  header: { alignItems: "center", gap: 10 },
  emoji: { fontSize: 52 },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  subtitle: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // Form
  form: { gap: 10 },
  label: { color: "#888", fontSize: 13, marginLeft: 4 },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Alt link
  link: { color: "#555", textAlign: "center", fontSize: 14 },
  linkBold: { color: "#6366f1", fontWeight: "bold" },

  // Gönderildi ekranı
  successBox: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 20,
  },
  successEmoji: { fontSize: 64, textAlign: "center" },
  successTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  successText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  emailHighlight: { color: "#6366f1", fontWeight: "600" },
  tipsBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  tipsTitle: { color: "#fff", fontWeight: "600", marginBottom: 4 },
  tipsText: { color: "#555", fontSize: 13, lineHeight: 20 },
  resendButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#1a1a1a",
  },
  resendText: { color: "#888", fontSize: 14 },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  backToLoginText: { color: "#6366f1", fontWeight: "600", fontSize: 15 },
});
