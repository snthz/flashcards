"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { defaultDeckConfigInput, defaultNoteTypeCreateInputs } from "@/lib/defaults";
import { resolveLocale } from "@/lib/i18n/config";
import { getI18n, setLocaleCookie } from "@/lib/i18n/server";
import { parseOptions } from "@/lib/i18n/validation";
import type { Messages } from "@/lib/i18n/messages";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: { name?: string; email?: string };
};

function valuesFrom(formData: FormData) {
  return {
    name: typeof formData.get("name") === "string" ? String(formData.get("name")) : undefined,
    email: typeof formData.get("email") === "string" ? String(formData.get("email")) : undefined,
  };
}

function fieldErrorsFrom(t: Messages, issues: Array<{ path: PropertyKey[]; message: string }>) {
  const messages: Record<string, string> = t.validation;
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = messages[issue.message] ?? issue.message;
  }
  return errors;
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const parsed = registerSchema.safeParse(
    {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    },
    parseOptions(locale),
  );
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(t, parsed.error.issues), values: valuesFrom(formData) };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (existing) return { fieldErrors: { email: t.auth.emailTaken }, values: valuesFrom(formData) };

  const timezone = typeof formData.get("timezone") === "string" ? String(formData.get("timezone")) : "UTC";
  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        timezone: timezone || "UTC",
        locale,
      },
    });
    await tx.deckConfig.create({ data: defaultDeckConfigInput(created.id, locale) });
    await tx.noteType.createMany({ data: defaultNoteTypeCreateInputs(created.id, locale) });
    return created;
  });

  await createSession(user.id);
  await setLocaleCookie(locale);
  redirect("/decks");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const parsed = loginSchema.safeParse(
    {
      email: formData.get("email"),
      password: formData.get("password"),
    },
    parseOptions(locale),
  );
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(t, parsed.error.issues), values: valuesFrom(formData) };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { error: t.auth.wrongCredentials, values: valuesFrom(formData) };

  await createSession(user.id);
  await setLocaleCookie(resolveLocale(user.locale));
  redirect("/decks");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
