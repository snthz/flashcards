export const MAX_QUESTION = 2000;
export const MAX_ANSWER = 8000;
export const MAX_TURNS = 12;
export const MAX_CARD_CONTEXT = 1000;

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type AssistantError = "no-key" | "invalid-key" | "rate-limited" | "refused" | "unavailable" | "too-long" | "offline";

export type AssistantEvent = { type: "text"; text: string } | { type: "done"; truncated: boolean } | { type: "error"; error: AssistantError };
