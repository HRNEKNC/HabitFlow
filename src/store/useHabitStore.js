import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { checkAndAwardBadges } from "../lib/badgeChecker";
import {
  cancelHabitNotification,
  scheduleDailyNotification,
} from "../lib/notifications";
import { supabase } from "../lib/supabase";

export const THEME_COLORS = {
  dark: {
    background: "#0A0A0A",
    card: "#171717",
    text: "#FAFAFA",
    textMuted: "#A3A3A3",
    textSubtle: "#737373",
    border: "#262626",
    primary: "#F5A623",
    accent: "#D97706",
    success: "#10B981",
    danger: "#EF4444",
    modalBg: "#171717",
    inputBg: "#262626",
  },
  light: {
    background: "#F4F4F5",
    card: "#FFFFFF",
    text: "#171717",
    textMuted: "#525252",
    textSubtle: "#A3A3A3",
    border: "#E5E5E5",
    primary: "#F5A623",
    accent: "#D97706",
    success: "#059669",
    danger: "#DC2626",
    modalBg: "#FFFFFF",
    inputBg: "#F4F4F5",
  },
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}
function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export const useHabitStore = create((set, get) => ({
  userId: null,
  isOnboarded: false,
  completeOnboarding: () => set({ isOnboarded: true }),
  habits: [],
  logs: [],
  allLogs: [],
  stats: { habits: 0, totalLogs: 0, todayLogs: 0 },
  userBadges: [],
  user: null,
  loading: true,
  refreshing: false,
  weekStartStr: null,
  appTheme: "system",
  energy: 0,
  freezes: 0,

  // ✅ YENİ: Başlangıçta dil seçimi yapıldı mı kontrolü
  isLangSelected: true,
  setLangSelected: () => set({ isLangSelected: true }),

  init: async () => {
    try {
      const storedTheme = await AsyncStorage.getItem("appTheme");
      if (storedTheme) set({ appTheme: storedTheme });

      // Dil seçimi yapılmış mı kontrol et
      const storedLang = await AsyncStorage.getItem("settings.lang");
      if (!storedLang) set({ isLangSelected: false });
    } catch (e) {}
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    set({
      userId: session.user.id,
      user: session.user,
      energy: session.user.user_metadata?.energy || 0,
      freezes: session.user.user_metadata?.freezes || 0,
    });
    await get().fetchAll();
  },

  setAppTheme: async (newTheme) => {
    set({ appTheme: newTheme });
    try {
      await AsyncStorage.setItem("appTheme", newTheme);
    } catch (e) {}
  },

  fetchAll: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ loading: true });
    try {
      const today = getToday();
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split("T")[0];
      set({ weekStartStr });

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      const { data: todayLogsData } = await supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("user_id", userId)
        .eq("completed_date", today);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startStr = thirtyDaysAgo.toISOString().split("T")[0];
      const { data: allLogsData } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("completed_date", startStr);
      const { count: totalLogsCount } = await supabase
        .from("habit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select(`earned_at, badges ( id, title, description, icon, color )`)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      set({
        habits: habitsData || [],
        logs: todayLogsData?.map((l) => l.habit_id) || [],
        allLogs: allLogsData || [],
        userBadges:
          badgesData?.map((b) => ({ ...b.badges, earned_at: b.earned_at })) ||
          [],
        stats: {
          habits: habitsData?.length || 0,
          totalLogs: totalLogsCount || 0,
          todayLogs: todayLogsData?.length || 0,
        },
      });
    } catch (err) {
    } finally {
      set({ loading: false, refreshing: false });
    }
  },

  refresh: async () => {
    set({ refreshing: true });
    await get().fetchAll();
  },

  addHabit: async ({
    title,
    description,
    icon,
    color,
    notify_hour,
    notify_minute,
    weekly_goal,
  }) => {
    const { userId, fetchAll } = get();
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        title,
        description,
        icon,
        color,
        notify_hour,
        notify_minute,
        weekly_goal: weekly_goal ?? 7,
      })
      .select()
      .single();
    if (error) throw error;
    if (notify_hour !== null && notify_minute !== null)
      await scheduleDailyNotification({
        habitId: data.id,
        title,
        hour: notify_hour,
        minute: notify_minute,
      });
    await fetchAll();
  },

  updateHabit: async ({
    id,
    title,
    description,
    icon,
    color,
    notify_hour,
    notify_minute,
    weekly_goal,
  }) => {
    const { fetchAll } = get();
    const { error } = await supabase
      .from("habits")
      .update({
        title,
        description,
        icon,
        color,
        notify_hour,
        notify_minute,
        weekly_goal: weekly_goal ?? 7,
      })
      .eq("id", id);
    if (error) throw error;
    if (notify_hour !== null && notify_minute !== null)
      await scheduleDailyNotification({
        habitId: id,
        title,
        hour: notify_hour,
        minute: notify_minute,
      });
    else await cancelHabitNotification(id);
    await fetchAll();
  },

  deleteHabit: async (habitId) => {
    const { fetchAll } = get();
    await cancelHabitNotification(habitId);
    await supabase.from("habits").delete().eq("id", habitId);
    await fetchAll();
  },

  toggleHabit: async (habitId) => {
    const {
      userId,
      logs,
      habits,
      allLogs,
      fetchAll,
      energy,
      updateProfileData,
    } = get();
    const today = getToday();
    const isCompleted = logs.includes(habitId);
    if (isCompleted) {
      const newEnergy = Math.max(0, energy - 10);
      set((state) => ({
        logs: state.logs.filter((id) => id !== habitId),
        allLogs: state.allLogs.filter(
          (l) => !(l.habit_id === habitId && l.completed_date === today),
        ),
        stats: {
          ...state.stats,
          todayLogs: Math.max(0, state.stats.todayLogs - 1),
        },
        energy: newEnergy,
      }));
      updateProfileData({ energy: newEnergy });
      try {
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("user_id", userId)
          .eq("completed_date", today);
      } catch (error) {
        fetchAll();
      }
    } else {
      const newEnergy = energy + 10;
      const newAllLogs = [
        ...allLogs,
        { habit_id: habitId, user_id: userId, completed_date: today },
      ];
      set((state) => ({
        logs: [...state.logs, habitId],
        allLogs: newAllLogs,
        stats: { ...state.stats, todayLogs: state.stats.todayLogs + 1 },
        energy: newEnergy,
      }));
      updateProfileData({ energy: newEnergy });
      try {
        await supabase.from("habit_logs").insert({
          habit_id: habitId,
          user_id: userId,
          completed_date: today,
        });
        checkAndAwardBadges({
          userId,
          habits,
          allLogs: newAllLogs,
          logs: [...logs, habitId],
        }).then(() => {
          supabase
            .from("user_badges")
            .select(`earned_at, badges ( id, title, description, icon, color )`)
            .eq("user_id", userId)
            .order("earned_at", { ascending: false })
            .then(({ data }) => {
              if (data)
                set({
                  userBadges: data.map((b) => ({
                    ...b.badges,
                    earned_at: b.earned_at,
                  })),
                });
            });
        });
      } catch (error) {
        fetchAll();
      }
    }
  },

  buyFreeze: async () => {
    const { energy, freezes, updateProfileData } = get();
    if (energy >= 100) {
      const newEnergy = energy - 100;
      const newFreezes = freezes + 1;
      set({ energy: newEnergy, freezes: newFreezes });
      await updateProfileData({ energy: newEnergy, freezes: newFreezes });
      return true;
    }
    return false;
  },

  useFreezeForYesterday: async (habitId) => {
    const { userId, freezes, allLogs, fetchAll, updateProfileData } = get();
    if (freezes < 1) return false;
    const yesterday = getYesterday();
    const newFreezes = freezes - 1;
    set({
      freezes: newFreezes,
      allLogs: [
        ...allLogs,
        { habit_id: habitId, user_id: userId, completed_date: yesterday },
      ],
    });
    updateProfileData({ freezes: newFreezes });
    try {
      await supabase.from("habit_logs").insert({
        habit_id: habitId,
        user_id: userId,
        completed_date: yesterday,
      });
      await fetchAll();
      return true;
    } catch (e) {
      fetchAll();
      return false;
    }
  },

  deleteAccount: async () => {
    const { cancelAllNotifications } = await import("../lib/notifications");
    await cancelAllNotifications();
    await supabase.rpc("delete_user_account");
    set({
      userId: null,
      user: null,
      habits: [],
      logs: [],
      allLogs: [],
      stats: { habits: 0, totalLogs: 0, todayLogs: 0 },
      userBadges: [],
      energy: 0,
      freezes: 0,
    });
    await supabase.auth.signOut();
  },

  updateProfileData: async (dataToUpdate) => {
    await supabase.auth.updateUser({ data: dataToUpdate });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user });
  },
}));
