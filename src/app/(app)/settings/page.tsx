import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/user";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountForm, LogoutButton, PasswordForm, ProfileForm } from "@/components/settings/settings-forms";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ajustes" description={user.email} actions={<LogoutButton />} />
      <InstallPrompt />
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Tu nombre y cómo se calculan los días de estudio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} timezone={user.timezone} dayStartHour={user.dayStartHour} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
      <Card className="border-danger/40">
        <CardHeader>
          <CardTitle className="text-danger">Zona de peligro</CardTitle>
          <CardDescription>Eliminar tu cuenta borra mazos, tarjetas, historial y archivos multimedia.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm email={user.email} />
        </CardContent>
      </Card>
    </div>
  );
}
