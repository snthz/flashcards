import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";
import { findValidResetToken } from "@/lib/auth/reset";
import { buttonStyles } from "@/components/ui/button";
import { getMessages } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.auth.resetTitle, referrer: "no-referrer" };
}

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const t = (await getMessages()).auth;
  const value = typeof token === "string" ? token : "";
  const valid = value ? await findValidResetToken(value) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t.resetHeading}</h1>
        <p className="text-muted-foreground">{valid ? t.resetLead : t.resetInvalid}</p>
      </div>
      {valid ? (
        <ResetPasswordForm token={value} />
      ) : (
        <Link href="/forgot-password" className={buttonStyles("primary", "lg", "h-12 rounded-xl")}>
          {t.requestNewLink}
        </Link>
      )}
    </div>
  );
}
