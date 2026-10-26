import { dayKey } from "@/lib/scheduler";

export interface ReviewEntry {
  cardId: string;
  rating: number;
  prevState: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  reviewedAt: Date;
}

function dayIndex(date: Date, timezone: string, dayStartHour: number) {
  return Math.round(Date.parse(`${dayKey(date, timezone, dayStartHour)}T00:00:00Z`) / 86_400_000);
}

export function reviewHistories(entries: ReviewEntry[], timezone: string, dayStartHour: number) {
  const byCard = new Map<string, ReviewEntry[]>();
  for (const entry of entries) {
    const list = byCard.get(entry.cardId) ?? [];
    list.push(entry);
    byCard.set(entry.cardId, list);
  }
  const histories: Array<Array<{ rating: number; deltaT: number }>> = [];
  for (const list of byCard.values()) {
    list.sort((a, b) => a.reviewedAt.getTime() - b.reviewedAt.getTime());
    let start = -1;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      if (list[i].prevState === "NEW") {
        start = i;
        break;
      }
    }
    if (start < 0) continue;
    const reviews = list.slice(start);
    let previousDay = dayIndex(reviews[0].reviewedAt, timezone, dayStartHour);
    histories.push(
      reviews.map((review, index) => {
        const day = dayIndex(review.reviewedAt, timezone, dayStartHour);
        const deltaT = index === 0 ? 0 : Math.max(0, day - previousDay);
        previousDay = day;
        return { rating: review.rating, deltaT };
      }),
    );
  }
  return histories;
}

export function longTermReviews(histories: Array<Array<{ deltaT: number }>>) {
  return histories.reduce((sum, history) => sum + history.filter((review, index) => index > 0 && review.deltaT > 0).length, 0);
}

export type TrainingReview = { rating: number; deltaT: number };

export function trainingItems(histories: TrainingReview[][]) {
  const items: TrainingReview[][] = [];
  for (const history of histories) {
    const valid = history.filter((review) => review.rating >= 1 && review.rating <= 4 && Number.isInteger(review.deltaT) && review.deltaT >= 0);
    if (valid.length !== history.length || valid[0]?.deltaT !== 0) continue;
    let longTerm = false;
    for (let end = 1; end < valid.length; end += 1) {
      if (valid[end].deltaT > 0) longTerm = true;
      if (longTerm) items.push(valid.slice(0, end + 1));
    }
  }
  return items;
}
