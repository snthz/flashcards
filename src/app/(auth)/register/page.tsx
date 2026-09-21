import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { register } from "../actions";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">Tus mazos y progreso se sincronizan en todos tus dispositivos.</p>
      </div>
      <AuthForm mode="register" action={register} />
    </div>
  );
}
