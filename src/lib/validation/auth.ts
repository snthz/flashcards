import { z } from "./zod";

export const emailSchema = z.string().trim().toLowerCase().email("Ingresa un correo válido").max(254);

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña es demasiado larga");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Ingresa tu nombre").max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
  newPassword: passwordSchema,
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Ingresa tu nombre").max(80),
  timezone: z.string().min(1).max(64),
  dayStartHour: z.coerce.number().int().min(0).max(23),
});
