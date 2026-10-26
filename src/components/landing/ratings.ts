export const MINUTE = 1 / 1440;

export const RATINGS = [
  { key: "again", tone: "text-danger border-danger/40", hover: "hover:bg-danger-soft", soft: "var(--danger-soft)" },
  { key: "hard", tone: "text-warning border-warning/40", hover: "hover:bg-warning-soft", soft: "var(--warning-soft)" },
  { key: "good", tone: "text-success border-success/40", hover: "hover:bg-success-soft", soft: "var(--success-soft)" },
  { key: "easy", tone: "text-info border-info/40", hover: "hover:bg-info-soft", soft: "var(--info-soft)" },
] as const;

export type Rating = (typeof RATINGS)[number];

export type RatingKey = Rating["key"];
