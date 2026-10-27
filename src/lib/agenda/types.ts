export interface AgendaNoteData {
  id: string;
  day: string;
  title: string;
  body: string;
  links: string[];
  images: string[];
  updatedAt: string;
}

export interface AgendaTaskData {
  id: string;
  day: string;
  time: string | null;
  title: string;
  notes: string;
  remindMinutes: number | null;
  done: boolean;
}

export interface StudyDay {
  day: string;
  reviews: number;
  minutes: number;
}

export interface AgendaMonth {
  month: string;
  today: string;
  notes: AgendaNoteData[];
  tasks: AgendaTaskData[];
  study: StudyDay[];
}

export const REMINDER_PRESETS = [0, 15, 60, 180, 1440, 2880, 10080] as const;
export const MAX_REMIND_MINUTES = 60 * 24 * 60;
export const MAX_LINKS = 10;
export const MAX_IMAGES = 12;
