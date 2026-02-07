import type { Profile, ProductStatus, AutonomyLevel, LeadStatus } from "./database";

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  subcategories?: MarketplaceSubcategory[];
}

export interface MarketplaceSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface MarketplaceProduct {
  id: string;
  vendor_id: string;
  subcategory_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  autonomy_level: AutonomyLevel | null;
  is_verified: boolean;
  status: ProductStatus;
  rejection_reason: string | null;
  avg_rating: number;
  review_count: number;
  problem_keywords: string[];
  created_at: string;
  updated_at: string;
  vendor?: Profile;
  media?: ProductMedia[];
  features?: ProductFeature[];
  subcategory?: MarketplaceSubcategory;
}

export interface ProductMedia {
  id: string;
  product_id: string;
  media_type: "image" | "video_url" | "video_upload";
  url: string;
  display_order: number;
}

export interface ProductFeature {
  id: string;
  product_id: string;
  feature_text: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  author_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  author?: Profile;
}

export interface ServiceLead {
  id: string;
  product_id: string | null;
  user_id: string | null;
  user_name: string;
  company: string;
  problem_description: string;
  budget: string | null;
  contractor_id: string | null;
  status: LeadStatus;
  created_at: string;
  product?: MarketplaceProduct;
  user?: Profile;
  contractor?: Profile;
}
