import { z } from "zod";
import type { Messages } from "@/lib/i18n/messages";

export function message(key: keyof Messages["validation"]) {
  return key;
}

export { z };
