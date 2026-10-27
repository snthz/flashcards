"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyMissingUser, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { consumeResetToken, findValidResetToken, issueResetToken } from "@/lib/auth/reset";
import { blockedFor, clearAttempts, clientIp, LOGIN_EMAIL, LOGIN_IP, recordAttempt, REGISTER_IP, RESET_IP } from "@/lib/auth/rate-limit";
import { loginSchema, registerSchema, resetPasswordSchema, resetRequestSchema } from "@/lib/validation/auth";
import { defaultDeckConfigInput, defaultNoteTypeCreateInputs } from "@/lib/defaults";
import { resolveLocale } from "@/lib/i18n/config";
import { getI18n, setLocaleCookie } from "@/lib/i18n/server";
import { parseOptions } from "@/lib/i18n/validation";
import { dictionaries, type Messages } from "@/lib/i18n/messages";
import { appOrigin } from "@/lib/app-url";
import { sendMail } from "@/lib/mail";
import { passwordResetEmail } from "@/lib/mail/password-reset";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: { name?: string; email?: string };
  sent?: boolean;
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

function minutes(ms: number) {
  return Math.max(1, Math.ceil(ms / 60_000));
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

  const ipKey = `register:ip:${await clientIp()}`;
  const wait = await blockedFor([{ key: ipKey, ...REGISTER_IP }]);
  if (wait > 0) return { error: t.auth.tooManyAttempts(minutes(wait)), values: valuesFrom(formData) };
  await recordAttempt([ipKey]);

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

  const emailKey = `login:email:${parsed.data.email}`;
  const ipKey = `login:ip:${await clientIp()}`;
  const wait = await blockedFor([
    { key: emailKey, ...LOGIN_EMAIL },
    { key: ipKey, ...LOGIN_IP },
  ]);
  if (wait > 0) return { error: t.auth.tooManyAttempts(minutes(wait)), values: valuesFrom(formData) };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : await verifyMissingUser(parsed.data.password);
  if (!user || !valid) {
    await recordAttempt([emailKey, ipKey]);
    return { error: t.auth.wrongCredentials, values: valuesFrom(formData) };
  }

  await clearAttempts(emailKey);
  await createSession(user.id);
  await setLocaleCookie(resolveLocale(user.locale));
  redirect("/decks");
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") }, parseOptions(locale));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(t, parsed.error.issues), values: valuesFrom(formData) };
  const email = parsed.data.email;
  const ipKey = `reset:ip:${await clientIp()}`;
  const wait = await blockedFor([{ key: ipKey, ...RESET_IP }]);
  if (wait > 0) return { error: t.auth.tooManyAttempts(minutes(wait)), values: { email } };
  await recordAttempt([ipKey]);
  const origin = await appOrigin();
  after(async () => {
    if (!origin) {
      console.warn("[auth] APP_URL is not set; password reset links can't be built");
      return;
    }
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, locale: true } });
    if (!user) return;
    const token = await issueResetToken(user.id);
    if (!token) return;
    const messages = dictionaries[resolveLocale(user.locale)].auth;
    const url = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
    await sendMail({ to: email, ...passwordResetEmail(messages, user.name, url) }).catch((error) => {
      console.error("[auth] failed to send the password reset email", error);
    });
  });
  return { sent: true, values: { email } };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const parsed = resetPasswordSchema.safeParse(
    { token: formData.get("token"), password: formData.get("password") },
    parseOptions(locale),
  );
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(t, parsed.error.issues) };
  const record = await findValidResetToken(parsed.data.token);
  if (!record) return { error: t.auth.resetInvalid };
  const updated = await consumeResetToken(record.id, record.userId, await hashPassword(parsed.data.password));
  if (!updated) return { error: t.auth.resetInvalid };
  const user = await prisma.user.findUnique({ where: { id: record.userId }, select: { locale: true } });
  await createSession(record.userId);
  await setLocaleCookie(resolveLocale(user?.locale));
  redirect("/decks");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
