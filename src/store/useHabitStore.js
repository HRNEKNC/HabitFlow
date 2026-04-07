import { create } from "zustand";
import { checkAndAwardBadges } from "../lib/badgeChecker";
import {
  cancelHabitNotification,
  scheduleDailyNotification,
} from "../lib/notifications";
import { supabase } from "../lib/supabase";

// ✅ Dinamik Tarih Fonksiyonu (Gece Yarısı Bug'ını önler)
function getToday() {
  return new Date().toISOString().split("T")[0];
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

  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    set({ userId: session.user.id, user: session.user });
    await get().fetchAll();
  },

  fetchAll: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ loading: true });

    try {
      const today = getToday(); // ✅ Dinamik
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split("T")[0];
      set({ weekStartStr });

      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (habitsError) throw habitsError;

      const { data: todayLogsData, error: todayError } = await supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("user_id", userId)
        .eq("completed_date", today);
      if (todayError) throw todayError;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startStr = thirtyDaysAgo.toISOString().split("T")[0];
      const { data: allLogsData, error: allLogsError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("completed_date", startStr);
      if (allLogsError) throw allLogsError;

      const { count: totalLogsCount } = await supabase
        .from("habit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      const todayCount = todayLogsData?.length || 0;

      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select(`earned_at, badges ( id, title, description, icon, color )`)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });
      if (badgesError) throw badgesError;

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
          todayLogs: todayCount,
        },
      });
    } catch (err) {
      console.error("fetchAll hatası:", err.message);
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
    if (notify_hour !== null && notify_minute !== null) {
      await scheduleDailyNotification({
        habitId: data.id,
        title,
        hour: notify_hour,
        minute: notify_minute,
      });
    }
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
    if (notify_hour !== null && notify_minute !== null) {
      await scheduleDailyNotification({
        habitId: id,
        title,
        hour: notify_hour,
        minute: notify_minute,
      });
    } else {
      await cancelHabitNotification(id);
    }
    await fetchAll();
  },

  deleteHabit: async (habitId) => {
    const { fetchAll } = get();
    await cancelHabitNotification(habitId);
    const { error } = await supabase.from("habits").delete().eq("id", habitId);
    if (error) throw error;
    await fetchAll();
  },

  toggleHabit: async (habitId) => {
    const { userId, logs, habits, allLogs } = get();
    const today = getToday(); // ✅ Dinamik
    const isCompleted = logs.includes(habitId);

    if (isCompleted) {
      const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("user_id", userId)
        .eq("completed_date", today);
      if (error) throw error;

      set((state) => ({
        logs: state.logs.filter((id) => id !== habitId),
        allLogs: state.allLogs.filter(
          (l) => !(l.habit_id === habitId && l.completed_date === today),
        ),
        stats: { ...state.stats, todayLogs: state.stats.todayLogs - 1 },
      }));
    } else {
      const { error } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habitId, user_id: userId, completed_date: today });
      if (error) throw error;

      const newAllLogs = [
        ...allLogs,
        { habit_id: habitId, user_id: userId, completed_date: today },
      ];

      set((state) => ({
        logs: [...state.logs, habitId],
        allLogs: newAllLogs,
        stats: { ...state.stats, todayLogs: state.stats.todayLogs + 1 },
      }));

      await checkAndAwardBadges({
        userId,
        habits,
        allLogs: newAllLogs,
        logs: [...logs, habitId],
      });
      await get().fetchAll();
    }
  },

  // ✅ YENİ: Hesabı Sil
  deleteAccount: async () => {
    const { cancelAllNotifications } = await import("../lib/notifications");
    await cancelAllNotifications();

    const { error } = await supabase.rpc("delete_user_account");
    if (error) throw error;

    set({
      userId: null,
      user: null,
      habits: [],
      logs: [],
      allLogs: [],
      stats: { habits: 0, totalLogs: 0, todayLogs: 0 },
      userBadges: [],
    });
    await supabase.auth.signOut();
  },
  // ✅ YENİ: Kullanıcı Adı Güncelleme
  updateUsername: async (newUsername) => {
    // Supabase Auth meta verisini güncelle
    const { error } = await supabase.auth.updateUser({
      data: { username: newUsername },
    });
    if (error) throw error;

    // Local state'i hemen güncelle ki UI anında değişsin
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user });
  },
}));
