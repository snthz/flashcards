export const notifications = {
  title: "Notifications",
  open: "Notifications",
  short: "Alerts",
  unread: (count: number) => (count === 1 ? "1 unread" : `${count} unread`),
  markAllRead: "Mark all as read",
  empty: "You're all caught up",
  emptyHint: "Reminders for your tasks and your study sessions show up here.",
  agenda: "Open agenda",
  justNow: "Just now",
};
