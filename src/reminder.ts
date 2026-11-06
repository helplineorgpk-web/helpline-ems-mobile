import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { TodayStatus } from "./types";

// 30 minutes before the 8 PM auto check-out, Pakistan time (UTC+5, no daylight saving).
export const REMINDER_TIME = "19:30";
const REMINDER_ID = "duty-report-reminder";
const CHANNEL_ID = "duty-reminders";
const supported = Platform.OS === "ios" || Platform.OS === "android";

if (supported) {
  // Show the reminder even if the app is open at 7:30 PM.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Duty reminders",
    description: "Reminds you to send your daily report before duty closes at 8 PM.",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/** Asks for notification permission. Called at check-in, when the reminder is about to matter. */
export async function requestReminderPermission() {
  if (!supported) return false;
  try {
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

export async function cancelDutyReminder() {
  if (!supported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // Nothing was scheduled.
  }
}

/**
 * Keeps one reminder scheduled for 7:30 PM while the employee is on duty today, and none otherwise.
 * Safe to call after every status refresh. Never prompts for permission.
 */
export async function syncDutyReminder(today: TodayStatus | null) {
  if (!supported) return;
  try {
    await cancelDutyReminder();
    const onDuty = Boolean(today?.checkedIn && !today?.checkedOut);
    if (!today || !onDuty) return;

    const at = new Date(`${today.date}T${REMINDER_TIME}:00+05:00`);
    if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) return;
    if (!(await Notifications.getPermissionsAsync()).granted) return;

    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: "30 minutes left on duty",
        body: "Send today's report and check out before 8:00 PM.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
        channelId: CHANNEL_ID,
      },
    });
  } catch {
    // A reminder is a convenience: never block duty actions on it.
  }
}
