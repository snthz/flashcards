import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { getMessages } from "@/lib/i18n/server";
import { isMailConfigured } from "@/lib/mail";
import { login } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.auth.loginTitle };
}

export default async function LoginPage() {
  const t = (await getMessages()).auth;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t.loginHeading}</h1>
        <p className="text-muted-foreground">{t.loginLead}</p>
      </div>
      <AuthForm mode="login" action={login} showForgotPassword={isMailConfigured() || process.env.NODE_ENV !== "production"} />
    </div>
  );
}
