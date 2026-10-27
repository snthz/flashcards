import { isPushConfigured } from "./push";

const INTERVAL_MS = 5 * 60_000;
const FIRST_RUN_MS = 30_000;
const TASK_INTERVAL_MS = 60_000;

const state = globalThis as typeof globalThis & { __flashcardsReminders?: boolean };

export function startReminderLoop() {
  if (state.__flashcardsReminders || process.env.REMINDERS === "off") return;
  state.__flashcardsReminders = true;
  const run = async () => {
    try {
      const { sendDueReminders } = await import("./daily");
      await sendDueReminders();
    } catch (error) {
      console.error("[reminders] run failed", error);
    }
  };
  const runTasks = async () => {
    try {
      const { sendTaskReminders } = await import("@/lib/agenda/reminders");
      await sendTaskReminders();
    } catch (error) {
      console.error("[reminders] task run failed", error);
    }
  };
  if (isPushConfigured()) {
    setTimeout(run, FIRST_RUN_MS).unref();
    setInterval(run, INTERVAL_MS).unref();
  }
  setTimeout(runTasks, FIRST_RUN_MS).unref();
  setInterval(runTasks, TASK_INTERVAL_MS).unref();
}
