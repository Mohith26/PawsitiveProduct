import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(1, "Company is required"),
  job_title: z.string().optional(),
  industry_segment: z.enum(["veterinary", "cpg", "retail", "other"]).default("other"),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  industry_segment: z.enum(["veterinary", "cpg", "retail", "other"]).optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
