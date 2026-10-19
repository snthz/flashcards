import { message, z } from "./zod";

export const emailSchema = z.string().trim().toLowerCase().email(message("emailInvalid")).max(254);

export const passwordSchema = z
  .string()
  .min(8, message("passwordMin"))
  .max(128, message("passwordTooLong"));

export const registerSchema = z.object({
  name: z.string().trim().min(1, message("nameRequired")).max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, message("passwordRequired")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, message("currentPasswordRequired")),
  newPassword: passwordSchema,
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, message("nameRequired")).max(80),
  timezone: z.string().min(1).max(64),
  dayStartHour: z.coerce.number().int().min(0).max(23),
});
