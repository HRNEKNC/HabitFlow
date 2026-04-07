import { supabase } from "./supabase";

// ─────────────────────────────────────────────
// Tek bir rozet kazandır
// ─────────────────────────────────────────────
async function awardBadge({ userId, badgeId, habitId = null }) {
  const { error } = await supabase
    .from("user_badges")
    .insert({ user_id: userId, badge_id: badgeId, habit_id: habitId });
  if (
    error &&
    !error.message.includes("unique") &&
    !error.message.includes("duplicate")
  ) {
    console.error("Rozet kazandırma hatası:", error.message);
  }
}

// ─────────────────────────────────────────────
// Bir alışkanlık için mevcut seriyi hesapla
// ─────────────────────────────────────────────
function calculateCurrentStreak(habitId, allLogs) {
  const habitLogs = allLogs
    .filter((l) => l.habit_id === habitId)
    .map((l) => l.completed_date)
    .sort((a, b) => new Date(b) - new Date(a));
  if (habitLogs.length === 0) return 0;
  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (habitLogs.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

// ─────────────────────────────────────────────
// ANA FONKSİYON
// ─────────────────────────────────────────────
export async function checkAndAwardBadges({ userId, habits, allLogs, logs }) {
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = allLogs.filter((l) => l.completed_date === today);

  if (habits.length >= 1) await awardBadge({ userId, badgeId: "first_habit" });
  if (habits.length >= 5) await awardBadge({ userId, badgeId: "habit_5" });
  if (habits.length > 0 && todayLogs.length >= habits.length)
    await awardBadge({ userId, badgeId: "all_done" });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekStartStr = weekStart.toISOString().split("T")[0];

  for (const habit of habits) {
    const streak = calculateCurrentStreak(habit.id, allLogs);
    if (streak >= 3)
      await awardBadge({ userId, badgeId: "streak_3", habitId: habit.id });
    if (streak >= 7)
      await awardBadge({ userId, badgeId: "streak_7", habitId: habit.id });
    if (streak >= 30)
      await awardBadge({ userId, badgeId: "streak_30", habitId: habit.id });

    const weeklyDone = allLogs.filter(
      (l) => l.habit_id === habit.id && l.completed_date >= weekStartStr,
    ).length;
    if (weeklyDone >= (habit.weekly_goal ?? 7)) {
      await awardBadge({ userId, badgeId: "goal_reached", habitId: habit.id });
    }
  }
}
