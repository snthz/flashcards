"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { changePassword, deleteAccount, updateProfile, type SettingsState } from "@/app/(app)/settings/actions";
import { logout } from "@/app/(auth)/actions";

const hours = Array.from({ length: 24 }, (_, i) => i);

function SuccessMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{message}</p>;
}

export function ProfileForm({ name, timezone, dayStartHour }: { name: string; timezone: string; dayStartHour: number }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateProfile, {});
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [timezone];
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <SuccessMessage message={state.success} />
      <Field label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
        <Input id="name" name="name" defaultValue={name} required maxLength={80} />
      </Field>
      <Field label="Zona horaria" htmlFor="timezone" error={state.fieldErrors?.timezone}>
        <Select id="timezone" name="timezone" defaultValue={timezone}>
          {zones.includes(timezone) ? null : <option value={timezone}>{timezone}</option>}
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Inicio del día" htmlFor="dayStartHour" hint="Hora a la que empieza un nuevo día de estudio, igual que en Anki.">
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
          Guardar
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(changePassword, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <SuccessMessage message={state.success} />
      <Field label="Contraseña actual" htmlFor="currentPassword" error={state.fieldErrors?.currentPassword}>
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Nueva contraseña" htmlFor="newPassword" error={state.fieldErrors?.newPassword}>
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending}>
          Cambiar contraseña
        </Button>
      </div>
    </form>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="outline">
        Cerrar sesión
      </Button>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [value, setValue] = useState("");
  return (
    <form action={deleteAccount} className="flex flex-col gap-3">
      <Field label={`Escribe ${email} para confirmar`} htmlFor="confirmation">
        <Input id="confirmation" name="confirmation" value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" />
      </Field>
      <div>
        <Button type="submit" variant="danger" disabled={value !== email}>
          Eliminar cuenta y todos los datos
        </Button>
      </div>
    </form>
  );
}
