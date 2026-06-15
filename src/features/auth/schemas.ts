import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one symbol");

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.email(),
  password: passwordSchema,
  full_name: z.string().min(2, "Enter your full name"),
});

export const codeSchema = z.object({
  email: z.email(),
  code: z.string().length(6, "Enter the 6 digit code"),
});

export const firstLoginSchema = codeSchema.extend({
  new_password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(24, "Reset link is invalid"),
  new_password: passwordSchema,
  confirm_password: passwordSchema,
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const setupPasswordSchema = z.object({
  new_password: passwordSchema,
  confirm_password: passwordSchema,
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
