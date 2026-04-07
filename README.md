# ⚡ HabitFlow

Modern, minimalist ve oyunlaştırma odaklı bir alışkanlık takip uygulaması. Kullanıcıların günlük hedeflerine ulaşmalarını teşvik eden, kişiselleştirilebilir bildirimler ve rozet sistemiyle donatılmış tam kapsamlı bir mobil deneyim.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)

---

## 🚀 Özellikler

- **🔒 Güvenli Kimlik Doğrulama (Auth):** Supabase entegrasyonu ile e-posta/şifre kayıt, giriş ve şifre sıfırlama (Deep Linking).
- **🎯 Haftalık Hedefler:** Her alışkanlık için esnek hedefler (Örn: Haftada 3 gün) ve anlık ilerleme çubukları.
- **🏆 Oyunlaştırma (Gamification):** 3, 7 ve 30 günlük seriler (streaks) ve hedeflere ulaşıldığında kazanılan kilitli rozet sistemi.
- **🔔 Yerel Bildirimler (Push Notifications):** Her alışkanlık için özel saatlerde çalışan, Expo Notifications destekli günlük hatırlatıcılar.
- **⚡ Işık Hızında State Yönetimi:** Zustand ile merkezi veri yönetimi ve anlık UI güncellemeleri (Optimistic UI Updates).
- **🛡️ Güvenli Veri Silme:** Supabase RPC (Remote Procedure Call) fonksiyonları ile güvenli ve atomik hesap/veri silme mimarisi.
- **🌙 Karanlık Tema (Dark Mode):** Göz yormayan, modern ve şık kullanıcı arayüzü.

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

- **Frontend:** React Native, Expo SDK, Expo Router (File-based routing)
- **Backend / BaaS:** Supabase (PostgreSQL, Auth, Edge RPC)
- **State Management:** Zustand
- **Bildirimler:** Expo Notifications
- **Storage:** AsyncStorage

## 📂 Mimari Yapı

Proje, sürdürülebilir ve ölçeklenebilir bir klasör yapısına (Feature-Based Architecture) sahiptir:

```text
HabitFlow/
├── app/              # Expo Router tabanlı ekranlar ve navigasyon (auth, tabs)
├── assets/           # İkonlar, splash screen ve tasarımsal materyaller
├── src/
│   ├── components/   # Tekrar kullanılabilir UI bileşenleri
│   ├── lib/          # Supabase istemcisi, Bildirim ve Rozet motorları
│   └── store/        # Zustand global state yönetimi (useHabitStore.js)
```
