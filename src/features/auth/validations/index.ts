import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address").max(254),
  password: z.string().min(1, "Password is required").max(128),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name must be 60 characters or fewer"),
    email: z.string().email("Enter a valid email address").max(254),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer"),
    confirmPassword: z.string().max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
