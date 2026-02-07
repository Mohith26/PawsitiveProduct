import { z } from "zod";

export const createThreadSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  body: z.string().min(20, "Body must be at least 20 characters"),
  linked_product_id: z.string().uuid().optional(),
});

export const createPostSchema = z.object({
  thread_id: z.string().uuid(),
  body: z.string().min(1, "Post content is required"),
  parent_post_id: z.string().uuid().optional(),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
