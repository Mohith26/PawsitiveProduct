import type { Profile } from "./database";

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  thread_count?: number;
}

export interface ForumThread {
  id: string;
  category_id: string;
  author_id: string | null;
  title: string;
  slug: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_resolved: boolean;
  view_count: number;
  reply_count: number;
  linked_product_id: string | null;
  last_reply_at: string | null;
  last_reply_by: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: ForumCategory;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string | null;
  parent_post_id: string | null;
  body: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: ForumPost[];
}
