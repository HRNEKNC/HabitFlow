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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Supabase ile giriş yap
  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Hata", "Email ve şifre boş olamaz.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      Alert.alert("Giriş Hatası", error.message);
    }
    // Hata yoksa _layout.js otomatik ana ekrana yönlendirir

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        {/* Logo / Başlık */}
        <View style={styles.header}>
          <Text style={styles.emoji}>⚡</Text>
          <Text style={styles.title}>HabitFlow</Text>
          <Text style={styles.subtitle}>
            Alışkanlıklarını yönet, hayatını değiştir.
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
            placeholder="••••••••"
            placeholderTextColor="#444"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Şifremi unuttum */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push("/(auth)/reset-password")}
          >
            <Text style={styles.forgotText}>Şifremi unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Kayıt ol linki */}
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.link}>
            Hesabın yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
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
  header: {
    alignItems: "center",
    gap: 8,
  },
  emoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
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
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  forgotText: { color: "#6366f1", fontSize: 13 },
});
