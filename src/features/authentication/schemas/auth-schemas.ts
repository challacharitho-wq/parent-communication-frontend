import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changeTempPasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const twoFactorSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangeTempPasswordInput = z.infer<typeof changeTempPasswordSchema>;
export type TwoFactorVerifyInput = z.infer<typeof twoFactorSchema>;
