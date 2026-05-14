import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { THEME_COLORS, useHabitStore } from "../src/store/useHabitStore";

// ──────────────────────────────────────────────
// UNESCO Dijital Etik Prensipleri ve KVKK Uyum
// ──────────────────────────────────────────────

const ETHICS_PRINCIPLES = [
  {
    icon: "eye-outline",
    color: "#3B82F6",
    title: "Şeffaflık",
    body: "HabitFlow, topladığı her veriyi açıkça belirtir. Hangi verinin toplandığını, neden toplandığını ve nasıl kullanıldığını her zaman bilirsiniz. Gizli süreç yoktur.",
    unesco: "UNESCO AI Ethics Rec. §36",
  },
  {
    icon: "shield-checkmark-outline",
    color: "#10B981",
    title: "Gizlilik ve Veri Güvenliği",
    body: "Kişisel verileriniz (alışkanlıklar, bildirim saatleri, e-posta) Supabase altyapısında AES-256 şifrelemeyle saklanır. Verileriniz üçüncü taraflarla asla paylaşılmaz, reklam amacıyla kullanılmaz.",
    unesco: "UNESCO AI Ethics Rec. §37",
  },
  {
    icon: "person-circle-outline",
    color: "#8B5CF6",
    title: "Kullanıcı Özerkliği ve Kontrol",
    body: "Dilediğiniz zaman tüm verilerinizi ve hesabınızı kalıcı olarak silebilirsiniz. Hiçbir veri sizi 'kilitlemek' için kullanılmaz. Bu hak UNESCO etik çerçevesinin temel bir gereğidir.",
    unesco: "UNESCO AI Ethics Rec. §38",
  },
  {
    icon: "people-outline",
    color: "#F5A623",
    title: "Ayrımcılık Karşıtlığı",
    body: "HabitFlow hiçbir kullanıcıyı yaş, cinsiyet, dil, engellilik durumu veya coğrafyaya göre farklı muameleye tabi tutmaz. Uygulama evrensel erişilebilirlik standartlarına uygun tasarlanmıştır.",
    unesco: "UNESCO AI Ethics Rec. §41",
  },
  {
    icon: "leaf-outline",
    color: "#059669",
    title: "Sürdürülebilirlik",
    body: "Uygulama, gereksiz veri işlemini en aza indirecek şekilde optimize edilmiştir. Sunucu kaynakları sorumlu ve verimli kullanılmaktadır.",
    unesco: "UNESCO AI Ethics Rec. §46",
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "1. Toplanan Veriler",
    content:
      "HabitFlow yalnızca hizmetin işleyişi için zorunlu olan verileri toplar:\n• E-posta adresi (hesap kimliği)\n• Kullanıcı adı ve profil avatarı (isteğe bağlı)\n• Oluşturduğunuz alışkanlıkların adı, simgesi ve rengi\n• Günlük tamamlama kayıtları (tarih ve alışkanlık kimliği)\n• Bildirim saati tercihleri (yerel cihazda tetiklenir)\n• Uygulama teması ve dil tercihi",
  },
  {
    title: "2. Verilerin Kullanım Amacı",
    content:
      "Toplanan veriler yalnızca şu amaçlarla kullanılır:\n• Alışkanlık takibi ve ilerleme istatistiklerinin gösterilmesi\n• Belirlediğiniz saatte günlük hatırlatma bildirimleri gönderilmesi\n• Profil bilgilerinin cihazlar arası senkronize edilmesi\n\nVerileriniz pazarlama, reklam, profil oluşturma veya üçüncü taraflarla paylaşım amacıyla kullanılmaz.",
  },
  {
    title: "3. Veri Saklama ve Güvenlik",
    content:
      "Tüm veriler Supabase (supabase.com) üzerinde, aktarım sırasında TLS 1.3 ve depolama sırasında AES-256 şifreleme ile güvence altına alınır. Şifreler hiçbir zaman açık metin olarak saklanmaz; bcrypt algoritmasıyla hash'lenir.",
  },
  {
    title: "4. Kullanıcı Hakları (KVKK Md. 11)",
    content:
      "6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n• İşlenmişse buna ilişkin bilgi talep etme\n• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme\n• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme\n• Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme\n• Hesabınızı ve tüm verilerinizi kalıcı olarak silme (Profil → Hesabı Sil)",
  },
  {
    title: "5. Çocukların Gizliliği",
    content:
      "HabitFlow, 13 yaşın altındaki bireylerden bilerek kişisel veri toplamaz. Uygulamanın 13 yaş altı bir kişi tarafından kullanıldığının tespiti hâlinde ilgili hesap ve veriler derhal silinir.",
  },
  {
    title: "6. Çerez ve İzleme",
    content:
      "HabitFlow mobil uygulaması üçüncü taraf izleme çerezleri veya davranışsal analitik araçları kullanmaz. Uygulama içi hata takibi için yalnızca anonimleştirilmiş Expo hata raporlaması kullanılabilir.",
  },
  {
    title: "7. Değişiklikler",
    content:
      "Bu gizlilik politikasında yapılacak önemli değişiklikler uygulama içi bildirim ile size duyurulacaktır. Değişikliklerin yürürlük tarihinden sonra uygulamayı kullanmaya devam etmeniz yeni politikayı kabul ettiğiniz anlamına gelir.",
  },
  {
    title: "8. İletişim",
    content:
      "Gizlilik ile ilgili sorularınız için: privacy@hrnsoftware.com\n\nVeri Sorumlusu: HRN Software\nSon güncelleme: Mayıs 2025",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const appTheme = useHabitStore((s) => s.appTheme);
  const activeTheme = appTheme === "system" ? colorScheme || "dark" : appTheme;
  const colors = THEME_COLORS[activeTheme];
  const styles = useMemo(() => getDynamicStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={activeTheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizlilik ve Etik</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconCircle}>
            <Text style={{ fontSize: 40 }}>🛡️</Text>
          </View>
          <Text style={styles.heroTitle}>Verileriniz Sizindir</Text>
          <Text style={styles.heroSubtitle}>
            HabitFlow, UNESCO Yapay Zeka Etik Tavsiyesi çerçevesinde
            tasarlanmıştır. Gizliliğiniz bir özellik değil, temel bir
            hakkınızdır.
          </Text>
          <View style={styles.unescoTag}>
            <Text style={styles.unescoTagText}>
              📋 UNESCO AI Ethics Recommendation (2021)
            </Text>
          </View>
        </View>

        {/* UNESCO Etik Prensipleri */}
        <Text style={styles.sectionTitle}>Etik Prensiplerimiz</Text>
        {ETHICS_PRINCIPLES.map((item, i) => (
          <View key={i} style={styles.ethicCard}>
            <View
              style={[
                styles.ethicIconBox,
                { backgroundColor: item.color + "1A" },
              ]}
            >
              <Ionicons name={item.icon} size={26} color={item.color} />
            </View>
            <View style={styles.ethicContent}>
              <Text style={styles.ethicTitle}>{item.title}</Text>
              <Text style={styles.ethicBody}>{item.body}</Text>
              <View style={[styles.refTag, { borderColor: item.color + "44" }]}>
                <Text style={[styles.refTagText, { color: item.color }]}>
                  {item.unesco}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Gizlilik Politikası */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
          Gizlilik Sözleşmesi
        </Text>
        <View style={styles.privacyCard}>
          {PRIVACY_SECTIONS.map((section, i) => (
            <View key={i}>
              <Text style={styles.privacyHeading}>{section.title}</Text>
              <Text style={styles.privacyBody}>{section.content}</Text>
              {i < PRIVACY_SECTIONS.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        {/* Veri Silme Kartı */}
        <View style={styles.deleteDataCard}>
          <Ionicons name="trash-outline" size={28} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.deleteDataTitle}>Tüm Verilerimi Sil</Text>
            <Text style={styles.deleteDataBody}>
              Hesabınızı ve tüm verilerinizi kalıcı olarak silmek için Profil
              sekmesine gidin → "Hesabı Sil" seçeneğini kullanın.
            </Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Bu uygulama, T.C. 6698 sayılı Kişisel Verilerin Korunması Kanunu
          (KVKK) ve UNESCO Yapay Zeka Etik Tavsiyesi kapsamında
          geliştirilmiştir.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getDynamicStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "android" ? 20 : 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    scroll: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 24 },

    // Hero
    heroBanner: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 28,
      alignItems: "center",
      marginBottom: 32,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        android: { elevation: 4 },
      }),
    },
    heroIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + "1A",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.primary + "33",
    },
    heroTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "800",
      marginBottom: 10,
      letterSpacing: -0.5,
      textAlign: "center",
    },
    heroSubtitle: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 24,
      textAlign: "center",
      marginBottom: 16,
    },
    unescoTag: {
      backgroundColor: "#3B82F61A",
      borderRadius: 99,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: "#3B82F633",
    },
    unescoTagText: {
      color: "#3B82F6",
      fontSize: 12,
      fontWeight: "700",
    },

    // Section Title
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 16,
      letterSpacing: -0.5,
    },

    // Ethic Cards
    ethicCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      marginBottom: 12,
      gap: 16,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    ethicIconBox: {
      width: 52,
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },
    ethicContent: { flex: 1 },
    ethicTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 6,
      letterSpacing: -0.2,
    },
    ethicBody: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 10,
    },
    refTag: {
      alignSelf: "flex-start",
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    refTagText: { fontSize: 11, fontWeight: "700" },

    // Privacy Card
    privacyCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
        },
        android: { elevation: 3 },
      }),
    },
    privacyHeading: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
      marginBottom: 8,
    },
    privacyBody: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 23,
      marginBottom: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 18,
    },

    // Delete Data Card
    deleteDataCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      backgroundColor: colors.danger + "0D",
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.danger + "33",
      marginBottom: 24,
    },
    deleteDataTitle: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 6,
    },
    deleteDataBody: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 22,
    },

    // Footer
    footerNote: {
      color: colors.textSubtle,
      fontSize: 12,
      textAlign: "center",
      lineHeight: 20,
      paddingHorizontal: 10,
    },
  });
