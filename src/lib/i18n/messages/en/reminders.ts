const cards = (count: number) => (count === 1 ? "1 card" : `${count} cards`);
const days = (count: number) => (count === 1 ? "1-day" : `${count}-day`);

export const reminders = {
  title: "Time to review",
  body: (count: number) => `You have ${cards(count)} waiting today.`,
  bodyStreak: (count: number, streak: number) => `${cards(count)} waiting. Keep your ${days(streak)} streak going.`,
  firstTitles: ["Time to review", "Your cards are ready"],
  nudgeTitles: ["A quick review?", "You haven't reviewed today"],
  nudgeStreakTitles: (streak: number) => [`Your ${days(streak)} streak is waiting`, `Don't let your ${days(streak)} streak slip`],
  nudgeBodies: (count: number, minutes: number) => [
    `It's ${cards(count)}, ${minutes === 1 ? "about a minute" : `about ${minutes} min`}.`,
    `${minutes === 1 ? "A minute" : `${minutes} min`} today keeps tomorrow light.`,
  ],
  lastCallTitles: (streak: number) => [`Your ${days(streak)} streak ends tonight`, "Last chance for your streak"],
  lastCallBodies: (streak: number, count: number) => [
    `There's still time: even 5 cards keep your ${days(streak)} streak.`,
    `${cards(count)} left. A few minutes now saves your ${days(streak)} streak.`,
  ],
  testTitle: "Reminders are on",
  testBody: "This is how your daily reminder will look.",
};
