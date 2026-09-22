import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { register } from "../actions";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="text-muted-foreground">Importa tus mazos de Anki y estudia desde cualquier dispositivo.</p>
      </div>
      <AuthForm mode="register" action={register} />
    </div>
  );
}
