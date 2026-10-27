import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getMessages } from "@/lib/i18n/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountForm, LogoutButton, PasswordForm, ProfileForm } from "@/components/settings/settings-forms";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ExportButton } from "@/components/export/export-dialog";
import { ReminderSettings } from "@/components/settings/reminder-settings";
import { vapidPublicKey } from "@/lib/reminders/push";
import { prisma } from "@/lib/db";
import { Download } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.settings.title };
}

export default async function SettingsPage() {
  const user = await requireUser();
  const messages = await getMessages();
  const t = messages.settings;
  const reminder = await prisma.user.findUnique({ where: { id: user.id }, select: { reminderHour: true, reminderNudges: true } });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.title} description={user.email} actions={<LogoutButton />} />
      <InstallPrompt />
      <Card>
        <CardHeader>
          <CardTitle>{t.profileTitle}</CardTitle>
          <CardDescription>{t.profileDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} timezone={user.timezone} dayStartHour={user.dayStartHour} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.remindersTitle}</CardTitle>
          <CardDescription>{t.remindersDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReminderSettings publicKey={vapidPublicKey()} initialHour={reminder?.reminderHour ?? null} initialNudges={reminder?.reminderNudges ?? true} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.languageTitle}</CardTitle>
          <CardDescription>{t.languageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher label={t.languageTitle} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.passwordTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{messages.exporter.backupTitle}</CardTitle>
          <CardDescription>{messages.exporter.backupDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton target={null} variant="secondary">
            <Download className="size-4" />
            {messages.exporter.exportAll}
          </ExportButton>
        </CardContent>
      </Card>
      <Card className="border-danger/40">
        <CardHeader>
          <CardTitle className="text-danger">{t.dangerTitle}</CardTitle>
          <CardDescription>{t.dangerDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm email={user.email} />
        </CardContent>
      </Card>
    </div>
  );
}
