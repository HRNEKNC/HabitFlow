# ⚡ HabitFlow

A modern, minimalist, and gamification-focused habit tracking app. A full-scale mobile experience equipped with customizable notifications and a badge system that encourages users to reach their daily goals.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)

---

## 🚀 Features

- **🔒 Secure Authentication (Auth):** Supabase integration with email/password registration, login, and password reset (Deep Linking).
- **🎯 Weekly Goals:** Flexible goals for each habit (e.g., 3 days a week) and real-time progress bars.
- **🏆 Gamification:** 3, 7, and 30-day streaks and an unlockable badge system earned upon reaching goals.
- **🔔 Local Push Notifications:** Daily reminders powered by Expo Notifications, running at custom times for each habit.
- **⚡ Lightning Fast State Management:** Centralized data management and instantaneous UI updates (Optimistic UI Updates) with Zustand.
- **🛡️ Secure Data Deletion:** Secure and atomic account/data deletion architecture via Supabase RPC (Remote Procedure Call) functions.
- **🌙 Dark Mode:** Easy on the eyes, modern, and sleek user interface.

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo SDK, Expo Router (File-based routing)
- **Backend / BaaS:** Supabase (PostgreSQL, Auth, Edge RPC)
- **State Management:** Zustand
- **Notifications:** Expo Notifications
- **Storage:** AsyncStorage

## 📂 Architecture

The project features a sustainable and scalable folder structure (Feature-Based Architecture):

```text
HabitFlow/
├── app/              # Expo Router-based screens and navigation (auth, tabs)
├── assets/           # Icons, splash screen, and design materials
├── src/
│   ├── components/   # Reusable UI components
│   ├── lib/          # Supabase client, Notification and Badge engines
│   └── store/        # Zustand global state management (useHabitStore.js)
```
