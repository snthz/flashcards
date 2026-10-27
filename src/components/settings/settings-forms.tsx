"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/ui/dialog";
import { changePassword, deleteAccount, updateProfile, type SettingsState } from "@/app/(app)/settings/actions";
import { logout } from "@/app/(auth)/actions";
import { forgetOfflineData } from "@/lib/study/offline/sync";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { useMessages } from "@/lib/i18n/client";

const hours = Array.from({ length: 24 }, (_, i) => i);

function SuccessMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{message}</p>;
}

export function ProfileForm({ name, timezone, dayStartHour }: { name: string; timezone: string; dayStartHour: number }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateProfile, {});
  const isClient = useIsClient();
  const t = useMessages().settings;
  const zones = isClient && typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [timezone];
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <SuccessMessage message={state.success} />
      <Field label={t.name} htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={name} required maxLength={80} />
      </Field>
      <Field label={t.timezone} htmlFor="timezone" error={state.fieldErrors?.timezone}>
        <Select id="timezone" name="timezone" defaultValue={timezone}>
          {zones.includes(timezone) ? null : <option value={timezone}>{timezone}</option>}
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.dayStart} htmlFor="dayStartHour" hint={t.dayStartHint}>
        <Select id="dayStartHour" name="dayStartHour" defaultValue={String(dayStartHour)}>
          {hours.map((hour) => (
            <option key={hour} value={hour}>
              {String(hour).padStart(2, "0")}:00
            </option>
          ))}
        </Select>
      </Field>
      <div>
        <Button type="submit" loading={pending}>
          {t.save}
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(changePassword, {});
  const t = useMessages().settings;
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <SuccessMessage message={state.success} />
      <Field label={t.currentPassword} htmlFor="currentPassword" error={state.fieldErrors?.currentPassword}>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label={t.newPassword} htmlFor="newPassword" error={state.fieldErrors?.newPassword}>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending}>
          {t.changePassword}
        </Button>
      </div>
    </form>
  );
}

export function LogoutButton() {
  const t = useMessages().settings;
  return (
    <form
      action={async () => {
        await forgetOfflineData();
        await logout();
      }}
    >
      <Button type="submit" variant="outline">
        {t.logout}
      </Button>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const t = useMessages().settings;
  const close = () => {
    setOpen(false);
    setValue("");
  };
  return (
    <div>
      <Button variant="danger" onClick={() => setOpen(true)}>
        {t.deleteAccount}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={close}
        onConfirm={async () => {
          const data = new FormData();
          data.set("confirmation", value);
          await forgetOfflineData();
          await deleteAccount(data);
        }}
        title={t.deleteAccountTitle}
        description={t.deleteAccountDescription}
        confirmLabel={t.deleteAccountConfirm}
        disabled={value !== email}
      >
        <Field label={t.typeToConfirm(email)} htmlFor="confirmation">
          <Input id="confirmation" name="confirmation" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" autoFocus spellCheck={false} autoCapitalize="none" />
        </Field>
      </ConfirmDialog>
    </div>
  );
}
