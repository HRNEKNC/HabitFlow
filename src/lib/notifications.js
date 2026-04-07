import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Bildirim geldiğinde nasıl gösterilsin ───
// Uygulama açıkken de banner + ses göster
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─────────────────────────────────────────────
// 1️⃣ İzin iste
// Uygulama ilk kurulduğunda bir kez çağır
// ─────────────────────────────────────────────
export async function requestNotificationPermission() {
  // Simülatörde bildirim çalışmaz, gerçek cihaz gerekli
  if (!Device.isDevice) {
    console.log("Bildirimler sadece gerçek cihazda çalışır.");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Daha önce izin verilmemişse sor
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Bildirim izni reddedildi.");
    return false;
  }

  // Android için bildirim kanalı oluştur
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("habitflow", {
      name: "HabitFlow Hatırlatmaları",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: true,
    });
  }

  return true;
}

// ─────────────────────────────────────────────
// 2️⃣ Günlük tekrarlayan bildirim planla
// ─────────────────────────────────────────────
export async function scheduleDailyNotification({
  habitId,
  title,
  hour,
  minute,
}) {
  // Önce bu alışkanlığa ait eski bildirimi iptal et
  await cancelHabitNotification(habitId);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚡ HabitFlow",
      body: `"${title}" alışkanlığını tamamlamayı unutma!`,
      data: { habitId },
      sound: true,
      // Eski sürümde channelId buradaydı, artık değil!
    },
    trigger: {
      // ✅ YENİ EXPO KURALI: channelId artık trigger'ın içinde olmak zorunda
      channelId: "habitflow",
      type: "daily", // Expo'ya bunun günlük bir tetikleyici olduğunu kesin olarak belirtiyoruz
      hour: Number(hour),
      minute: Number(minute),
      repeats: true,
    },
  });

  return id; // bildirim ID'sini döndür
}

// ─────────────────────────────────────────────
// 3️⃣ Belirli bir alışkanlığın bildirimini iptal et
// Supabase'den notification_id çekerek çağır
// ─────────────────────────────────────────────
export async function cancelHabitNotification(habitId) {
  // Tüm planlanmış bildirimleri al
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  // Bu habitId'ye ait olanları bul ve iptal et
  for (const notification of scheduled) {
    if (notification.content.data?.habitId === habitId) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
    }
  }
}

// ─────────────────────────────────────────────
// 4️⃣ Tüm bildirimleri iptal et
// Kullanıcı çıkış yaptığında çağır
// ─────────────────────────────────────────────
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
