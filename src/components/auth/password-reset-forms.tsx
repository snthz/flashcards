"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { requestPasswordReset, resetPassword, type AuthState } from "@/app/(auth)/actions";
import { useMessages } from "@/lib/i18n/client";
import { RESET_TOKEN_MINUTES } from "@/lib/validation/auth";
import { AuthInput, PasswordVisibility } from "./auth-form";

function BackToLogin() {
  const t = useMessages().auth;
  return (
    <Link href="/login" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-4" />
      {t.backToLogin}
    </Link>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  const t = useMessages().auth;
  if (state.sent) {
    return (
      <div className="flex flex-col gap-6">
        <div role="status" className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-success" />
          <p>{t.resetLinkSent(RESET_TOKEN_MINUTES)}</p>
        </div>
        <BackToLogin />
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError message={state.error} />
      <AuthInput
        name="email"
        label={t.email}
        type="email"
        autoComplete="email"
        inputMode="email"
        icon={<Mail />}
        required
        error={state.fieldErrors?.email}
        defaultValue={state.values?.email}
      />
      <Button type="submit" size="lg" loading={pending} className="h-12 rounded-xl text-base">
        {t.sendResetLink}
        {pending ? null : <ArrowRight className="size-4" />}
      </Button>
      <BackToLogin />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPassword, {});
  const [visible, setVisible] = useState(false);
  const t = useMessages().auth;
  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError message={state.error} />
      <input type="hidden" name="token" value={token} />
      <AuthInput
        name="password"
        label={t.newPassword}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        icon={<Lock />}
        required
        minLength={8}
        error={state.fieldErrors?.password}
        hint={t.passwordHint}
        trailing={<PasswordVisibility visible={visible} onToggle={() => setVisible((value) => !value)} />}
      />
      <Button type="submit" size="lg" loading={pending} className="h-12 rounded-xl text-base">
        {t.savePassword}
        {pending ? null : <ArrowRight className="size-4" />}
      </Button>
    </form>
  );
}
