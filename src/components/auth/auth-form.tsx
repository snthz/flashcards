"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/ui/field";
import { useBrowserTimeZone } from "@/lib/hooks/use-is-client";
import type { AuthState } from "@/app/(auth)/actions";

interface AuthFormProps {
  mode: "login" | "register";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const timezone = useBrowserTimeZone();

  const isRegister = mode === "register";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError message={state.error} />
      {isRegister ? (
        <Field label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
          <Input id="name" name="name" autoComplete="name" required maxLength={80} />
        </Field>
      ) : null}
      <Field label="Correo" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 8 : 1}
        />
      </Field>
      <input type="hidden" name="timezone" value={timezone} />
      <Button type="submit" size="lg" loading={pending} className="mt-2">
        {isRegister ? "Crear cuenta" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
