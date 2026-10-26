import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.auth.forgotTitle };
}

export default async function ForgotPasswordPage() {
  const t = (await getMessages()).auth;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t.forgotHeading}</h1>
        <p className="text-muted-foreground">{t.forgotLead}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
