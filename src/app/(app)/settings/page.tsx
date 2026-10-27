import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar";
import { DeleteAccountForm, LogoutButton, PasswordForm, ProfileForm, StudyDayForm } from "@/components/settings/settings-forms";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ExportButton } from "@/components/export/export-dialog";
import { ReminderSettings } from "@/components/settings/reminder-settings";
import { FocusSettings } from "@/components/settings/focus-settings";
import { TranslatorSettings } from "@/components/settings/translator-settings";
import { translatorStatus } from "@/lib/translate/queries";
import { vapidPublicKey } from "@/lib/reminders/push";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.settings.title };
}

export default async function SettingsPage() {
  const user = await requireUser();
  const { locale, t: messages } = await getI18n();
  const t = messages.settings;
  const [record, translator] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { reminderHour: true, reminderNudges: true, createdAt: true } }),
    translatorStatus(user.id),
  ]);
  const since = record ? formatDate(record.createdAt, locale, { month: "long", year: "numeric" }) : null;

  const profile = (
    <>
      <Card className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} className="size-16 text-lg" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-lg font-semibold tracking-tight">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            {since ? <p className="text-xs text-muted-foreground">{t.memberSince(since)}</p> : null}
          </div>
        </div>
        <div className="border-t pt-5">
          <ProfileForm name={user.name} />
        </div>
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
    </>
  );

  const study = (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t.studyDayTitle}</CardTitle>
          <CardDescription>{t.studyDayDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyDayForm timezone={user.timezone} dayStartHour={user.dayStartHour} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.remindersTitle}</CardTitle>
          <CardDescription>{t.remindersDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReminderSettings publicKey={vapidPublicKey()} initialHour={record?.reminderHour ?? null} initialNudges={record?.reminderNudges ?? true} />
        </CardContent>
      </Card>
      <FocusSettings />
    </>
  );

  const account = (
    <>
      <InstallPrompt />
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
      <Card>
        <CardHeader>
          <CardTitle>{t.sessionTitle}</CardTitle>
          <CardDescription>{t.sessionDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <LogoutButton />
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
    </>
  );

  return (
    <div className="flex flex-col">
      <PageHeader title={t.title} description={t.description} />
      <SettingsTabs panels={{ profile, study, translator: <TranslatorSettings keyHint={translator.keyHint} model={translator.model} />, account }} />
    </div>
  );
}
