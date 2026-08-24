import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.email().trim().toLowerCase(),
    password: z.string().trim().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email").trim(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;