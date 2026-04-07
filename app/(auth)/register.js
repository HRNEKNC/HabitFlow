import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/lib/supabase";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Supabase ile kayıt ol
  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Hata", "Tüm alanları doldur.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalı.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (error) {
      Alert.alert("Kayıt Hatası", error.message);
    } else {
      Alert.alert("Başarılı! 🎉", "Hesabın oluşturuldu. Giriş yapabilirsin.", [
        { text: "Giriş Yap", onPress: () => router.replace("/(auth)/login") },
      ]);
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🚀</Text>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>
            HabitFlow'a katıl, alışkanlık kazan.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@email.com"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="En az 6 karakter"
            placeholderTextColor="#444"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Şifre Tekrar</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifreni tekrar gir"
            placeholderTextColor="#444"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Giriş yap linki */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>
            Zaten hesabın var mı? <Text style={styles.linkBold}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 60,
    gap: 32,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  emoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  form: {
    gap: 10,
  },
  label: {
    color: "#888",
    fontSize: 13,
    marginBottom: 2,
    marginLeft: 4,
  },
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
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#555",
    textAlign: "center",
    fontSize: 14,
  },
  linkBold: {
    color: "#6366f1",
    fontWeight: "bold",
  },
});
