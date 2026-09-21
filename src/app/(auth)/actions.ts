"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { defaultDeckConfigInput, defaultNoteTypeCreateInputs } from "@/lib/defaults";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrorsFrom(issues: Array<{ path: PropertyKey[]; message: string }>) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (existing) return { fieldErrors: { email: "Ya existe una cuenta con este correo" } };

  const timezone = typeof formData.get("timezone") === "string" ? String(formData.get("timezone")) : "UTC";
  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        timezone: timezone || "UTC",
      },
    });
    await tx.deckConfig.create({ data: defaultDeckConfigInput(created.id) });
    await tx.noteType.createMany({ data: defaultNoteTypeCreateInputs(created.id) });
    return created;
  });

  await createSession(user.id);
  redirect("/decks");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { error: "Correo o contraseña incorrectos" };

  await createSession(user.id);
  redirect("/decks");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
