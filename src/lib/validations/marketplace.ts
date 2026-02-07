import { z } from "zod";

export const productSubmitSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  tagline: z.string().max(200).optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  website_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  autonomy_level: z.enum(["human_in_the_loop", "semi_autonomous", "fully_autonomous"]).optional(),
  subcategory_id: z.string().uuid().optional(),
  problem_keywords: z.array(z.string()).max(10).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

export const serviceLeadSchema = z.object({
  product_id: z.string().uuid(),
  user_name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  problem_description: z.string().min(20, "Please describe your needs in more detail"),
  budget: z.string().optional(),
});

export type ProductSubmitInput = z.infer<typeof productSubmitSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ServiceLeadInput = z.infer<typeof serviceLeadSchema>;
