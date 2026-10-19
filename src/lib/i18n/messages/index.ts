import type { Locale } from "../config";
import { en } from "./en";
import { es } from "./es";
import type { Messages } from "./types";

export type { Messages };

export const dictionaries: Record<Locale, Messages> = { en, es };
