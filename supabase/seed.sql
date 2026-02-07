-- Seed data for Pawsitive Intelligence platform
-- Run via: npx supabase db reset

-- ============================================
-- Chat Channels
-- ============================================
INSERT INTO chat_channels (name, slug, description, is_private) VALUES
  ('General', 'general', 'General discussion for the community', false),
  ('AI Tools', 'ai-tools', 'Discuss AI tools and automation for pet businesses', false),
  ('Veterinary Tech', 'vet-tech', 'Veterinary technology discussions', false),
  ('Pet Retail', 'pet-retail', 'Pet retail industry conversations', false),
  ('Introductions', 'introductions', 'Introduce yourself to the community', false);

-- ============================================
-- Forum Categories
-- ============================================
INSERT INTO forum_categories (name, slug, description, display_order) VALUES
  ('Getting Started', 'getting-started', 'New to AI? Start here for beginner guides and questions', 1),
  ('AI Implementation', 'ai-implementation', 'Share and discuss AI implementation strategies', 2),
  ('Product Reviews', 'product-reviews', 'Review and discuss AI tools from the marketplace', 3),
  ('Industry News', 'industry-news', 'Latest news and trends in pet industry AI', 4),
  ('Technical Support', 'technical-support', 'Get help with technical issues', 5);

-- ============================================
-- Marketplace Categories & Subcategories
-- ============================================
DO $$
DECLARE
  cat_practice uuid := gen_random_uuid();
  cat_comm uuid := gen_random_uuid();
  cat_diag uuid := gen_random_uuid();
  cat_inventory uuid := gen_random_uuid();
  cat_marketing uuid := gen_random_uuid();
BEGIN
  INSERT INTO marketplace_categories (id, name, slug, display_order) VALUES
    (cat_practice, 'Practice Management', 'practice-management', 1),
    (cat_comm, 'Client Communication', 'client-communication', 2),
    (cat_diag, 'Diagnostics & Imaging', 'diagnostics-imaging', 3),
    (cat_inventory, 'Inventory & Supply Chain', 'inventory-supply-chain', 4),
    (cat_marketing, 'Marketing & Growth', 'marketing-growth', 5);

  INSERT INTO marketplace_subcategories (category_id, name, slug, display_order) VALUES
    (cat_practice, 'Scheduling', 'scheduling', 1),
    (cat_practice, 'Patient Records', 'patient-records', 2),
    (cat_practice, 'Billing & Payments', 'billing-payments', 3),
    (cat_comm, 'Chatbots', 'chatbots', 1),
    (cat_comm, 'Email Automation', 'email-automation', 2),
    (cat_comm, 'SMS & Notifications', 'sms-notifications', 3),
    (cat_diag, 'Image Analysis', 'image-analysis', 1),
    (cat_diag, 'Lab Results', 'lab-results', 2),
    (cat_inventory, 'Auto-Ordering', 'auto-ordering', 1),
    (cat_inventory, 'Demand Forecasting', 'demand-forecasting', 2),
    (cat_marketing, 'Social Media', 'social-media', 1),
    (cat_marketing, 'SEO & Content', 'seo-content', 2);
END $$;

-- ============================================
-- Course Categories
-- ============================================
INSERT INTO course_categories (name, slug, display_order) VALUES
  ('AI Fundamentals', 'ai-fundamentals', 1),
  ('Veterinary AI', 'veterinary-ai', 2),
  ('Pet Retail AI', 'pet-retail-ai', 3),
  ('Leadership & Strategy', 'leadership-strategy', 4);

-- ============================================
-- Role promotion helpers (run manually in Supabase Studio SQL editor)
-- ============================================
-- To test admin features:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
--
-- To test vendor features:
-- UPDATE profiles SET role = 'vendor' WHERE email = 'your@email.com';
--
-- To make a user both admin and vendor (super_admin has all access):
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
