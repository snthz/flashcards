export type CustomMode = "forgotten" | "ahead" | "new" | "tag" | "flag";

export interface CustomStudy {
  mode: CustomMode;
  days?: number;
  count?: number;
  tag?: string;
  flag?: number;
}

export const CUSTOM_DAYS = [1, 2, 3, 7, 14, 30];
export const CUSTOM_NEW_COUNTS = [5, 10, 20, 50];

function clampInt(value: string | null, min: number, max: number) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

export function parseCustomStudy(params: URLSearchParams): CustomStudy | null {
  const mode = params.get("custom");
  if (mode === "forgotten" || mode === "ahead") {
    const days = clampInt(params.get("days"), 1, 30);
    return days ? { mode, days } : null;
  }
  if (mode === "new") {
    const count = clampInt(params.get("count"), 1, 200);
    return count ? { mode, count } : null;
  }
  if (mode === "tag") {
    const tag = params.get("tag")?.trim();
    return tag && tag.length <= 100 ? { mode, tag } : null;
  }
  if (mode === "flag") {
    const flag = clampInt(params.get("flag"), 1, 7);
    return flag ? { mode, flag } : null;
  }
  return null;
}

export function customStudyQuery(custom: CustomStudy) {
  const params = new URLSearchParams({ custom: custom.mode });
  if (custom.days != null) params.set("days", String(custom.days));
  if (custom.count != null) params.set("count", String(custom.count));
  if (custom.tag != null) params.set("tag", custom.tag);
  if (custom.flag != null) params.set("flag", String(custom.flag));
  return params.toString();
}
