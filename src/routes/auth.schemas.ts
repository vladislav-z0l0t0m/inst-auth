import { z } from "zod";

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .email("Invalid email format");

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    "Invalid phone format. Use E.164 format (e.g., +1234567890)"
  );

export const registerSchema = z.object({
  email: emailSchema,
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters long"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "identifier is required" })
    .trim()
    .min(1, "identifier is required"),
  identifierType: z.enum(["email", "phone", "username"], {
    required_error: "identifierType is required",
  }),
  password: z
    .string({ required_error: "password is required" })
    .min(1, "password is required"),
});

export const oauthSchema = z.object({
  email: emailSchema,
  provider: z.enum(["google", "facebook"], {
    required_error: "provider is required",
  }),
  name: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthInput = z.infer<typeof oauthSchema>;
