"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useBrowserTimeZone } from "@/lib/hooks/use-is-client";
import type { AuthState } from "@/app/(auth)/actions";

interface AuthFormProps {
  mode: "login" | "register";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}

interface AuthInputProps {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  inputMode?: "email" | "text";
  hint?: string;
  trailing?: React.ReactNode;
  defaultValue?: string;
}

function AuthInput({ name, label, type = "text", autoComplete, icon, error, required, minLength, maxLength, inputMode, hint, trailing, defaultValue }: AuthInputProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border bg-card px-3 transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-ring",
          error && "border-danger/60",
        )}
      >
        <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          inputMode={inputMode}
          defaultValue={defaultValue}
          aria-invalid={Boolean(error)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {trailing}
      </div>
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const timezone = useBrowserTimeZone();
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormError message={state.error} />
      {isRegister ? (
        <AuthInput
          name="name"
          label="Nombre"
          autoComplete="name"
          icon={<User />}
          required
          maxLength={80}
          error={state.fieldErrors?.name}
          defaultValue={state.values?.name}
        />
      ) : null}
      <AuthInput
        name="email"
        label="Correo"
        type="email"
        autoComplete="email"
        inputMode="email"
        icon={<Mail />}
        required
        error={state.fieldErrors?.email}
        defaultValue={state.values?.email}
      />
      <AuthInput
        name="password"
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        autoComplete={isRegister ? "new-password" : "current-password"}
        icon={<Lock />}
        required
        minLength={isRegister ? 8 : 1}
        error={state.fieldErrors?.password}
        hint={isRegister ? "Mínimo 8 caracteres." : undefined}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      />
      <input type="hidden" name="timezone" value={timezone} />
      <Button type="submit" size="lg" loading={pending} className="mt-1 h-12 rounded-xl text-base">
        {isRegister ? "Crear cuenta" : "Entrar"}
        {pending ? null : <ArrowRight className="size-4" />}
      </Button>
      {isRegister ? (
        <p className="text-center text-xs text-muted-foreground">Al crear la cuenta se guardará tu zona horaria ({timezone}) para calcular los días de estudio.</p>
      ) : null}
      <div className="relative py-1">
        <div className="h-px w-full bg-border" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          {isRegister ? "¿Ya tienes cuenta?" : "¿Eres nuevo?"}
        </span>
      </div>
      <Link
        href={isRegister ? "/login" : "/register"}
        className="inline-flex h-11 items-center justify-center rounded-xl border bg-card text-sm font-medium transition-colors hover:bg-muted"
      >
        {isRegister ? "Iniciar sesión" : "Crear una cuenta gratis"}
      </Link>
    </form>
  );
}
