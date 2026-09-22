import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { login } from "../actions";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground">Continúa tu repaso justo donde lo dejaste.</p>
      </div>
      <AuthForm mode="login" action={login} />
    </div>
  );
}
