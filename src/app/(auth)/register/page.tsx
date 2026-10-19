import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { getMessages } from "@/lib/i18n/server";
import { register } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.auth.registerTitle };
}

export default async function RegisterPage() {
  const t = (await getMessages()).auth;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t.registerHeading}</h1>
        <p className="text-muted-foreground">{t.registerLead}</p>
      </div>
      <AuthForm mode="register" action={register} />
    </div>
  );
}
