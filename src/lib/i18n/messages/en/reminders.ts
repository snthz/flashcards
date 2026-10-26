export const reminders = {
  title: "Time to review",
  body: (count: number) => (count === 1 ? "You have 1 card waiting today." : `You have ${count} cards waiting today.`),
  bodyStreak: (count: number, days: number) =>
    `${count === 1 ? "1 card is" : `${count} cards are`} waiting. Keep your ${days}-day streak going.`,
  testTitle: "Reminders are on",
  testBody: "This is how your daily reminder will look.",
};
