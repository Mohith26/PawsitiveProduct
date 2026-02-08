-- BATCH 2: RLS + Policies + Trigger + Realtime + Seed Data
-- Paste this into the Supabase SQL Editor AFTER batch 1 succeeds

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles policies
-- ============================================
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- Chat channels policies
-- ============================================
CREATE POLICY "Public channels are viewable" ON chat_channels FOR SELECT TO authenticated USING (NOT is_private OR id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create channels" ON chat_channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- ============================================
-- Chat channel members policies
-- ============================================
CREATE POLICY "Members can view channel membership" ON chat_channel_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join channels" ON chat_channel_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave channels" ON chat_channel_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- Chat messages policies (public channels open to all authenticated)
-- ============================================
CREATE POLICY "Users can view messages in public channels" ON chat_messages
  FOR SELECT TO authenticated
  USING (
    channel_id IN (SELECT id FROM chat_channels WHERE NOT is_private)
    OR channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages in public channels" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      channel_id IN (SELECT id FROM chat_channels WHERE NOT is_private)
      OR channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

-- ============================================
-- Direct messages policies
-- ============================================
CREATE POLICY "Users can view own DMs" ON direct_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send DMs" ON direct_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update DMs" ON direct_messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- ============================================
-- Forums policies
-- ============================================
CREATE POLICY "Forum categories are viewable by all" ON forum_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Forum threads are viewable by all" ON forum_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create threads" ON forum_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own threads" ON forum_threads FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Forum posts are viewable by all" ON forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON forum_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Admin: manage forum categories
CREATE POLICY "Admins can create forum categories" ON forum_categories
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ============================================
-- Courses policies
-- ============================================
CREATE POLICY "Course categories are viewable" ON course_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Courses are viewable" ON courses
  FOR SELECT TO authenticated
  USING (status = 'published' OR created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Lessons of published courses are viewable" ON lessons FOR SELECT TO authenticated USING (course_id IN (SELECT id FROM courses WHERE status = 'published'));

-- Admin: create/update courses and lessons
CREATE POLICY "Admins can create courses" ON courses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update courses" ON courses FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can create lessons" ON lessons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can update lessons" ON lessons FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Admin: manage course categories
CREATE POLICY "Admins can create course categories" ON course_categories
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ============================================
-- Course enrollments & progress policies
-- ============================================
CREATE POLICY "Users can view own enrollments" ON course_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll" ON course_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can track progress" ON lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- Marketplace policies
-- ============================================
CREATE POLICY "Marketplace categories viewable" ON marketplace_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Marketplace subcategories viewable" ON marketplace_subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Products are viewable" ON marketplace_products
  FOR SELECT TO authenticated
  USING (status = 'approved' OR vendor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Vendors can create products" ON marketplace_products FOR INSERT TO authenticated WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors and admins can update products" ON marketplace_products
  FOR UPDATE TO authenticated
  USING (auth.uid() = vendor_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Product media is viewable" ON product_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "Product features are viewable" ON product_features FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reviews are viewable" ON product_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Verified users can create reviews" ON product_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- ============================================
-- Service leads policies
-- ============================================
CREATE POLICY "Users and admins can view leads" ON service_leads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can create leads" ON service_leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update service leads" ON service_leads
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ============================================
-- Agent policies
-- ============================================
CREATE POLICY "Agent config is viewable" ON agent_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update agent config" ON agent_config FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can insert agent config" ON agent_config FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can view own conversations" ON agent_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON agent_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own agent messages" ON agent_messages FOR SELECT TO authenticated USING (conversation_id IN (SELECT id FROM agent_conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can create agent messages" ON agent_messages FOR INSERT TO authenticated WITH CHECK (conversation_id IN (SELECT id FROM agent_conversations WHERE user_id = auth.uid()));
CREATE POLICY "Documents readable by authenticated" ON documents FOR SELECT TO authenticated USING (true);

-- ============================================
-- Auto-create profile trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company, job_title, industry_segment)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'job_title', ''),
    COALESCE(NEW.raw_user_meta_data->>'industry_segment', 'other')::public.industry_segment
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    company = COALESCE(NULLIF(EXCLUDED.company, ''), profiles.company),
    job_title = COALESCE(NULLIF(EXCLUDED.job_title, ''), profiles.job_title),
    industry_segment = COALESCE(NULLIF(EXCLUDED.industry_segment, 'other'::public.industry_segment), profiles.industry_segment);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Enable Realtime for chat_messages
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- ============================================
-- Seed: Agent config
-- ============================================
INSERT INTO agent_config (agent_type, display_name, system_prompt) VALUES
('engagement', 'Pawsitive Pulse', 'You are the Pawsitive Pulse engagement agent for a pet industry executive community. Help admins create announcements, polls, and engaging content. Help members stay informed about community activity.'),
('recommendation', 'Pawsitive Advisor', 'You are the Pawsitive Advisor, an AI tool recommendation agent. You help pet industry executives discover the right AI tools for their business. Use the provided knowledge base context to ground your recommendations in real products and community feedback. Only recommend products that exist in the marketplace.')
ON CONFLICT (agent_type) DO NOTHING;

-- ============================================
-- Seed: Chat Channels
-- ============================================
INSERT INTO chat_channels (name, slug, description, is_private) VALUES
  ('General', 'general', 'General discussion for the community', false),
  ('AI Tools', 'ai-tools', 'Discuss AI tools and automation for pet businesses', false),
  ('Veterinary Tech', 'vet-tech', 'Veterinary technology discussions', false),
  ('Pet Retail', 'pet-retail', 'Pet retail industry conversations', false),
  ('Introductions', 'introductions', 'Introduce yourself to the community', false);

-- ============================================
-- Seed: Forum Categories
-- ============================================
INSERT INTO forum_categories (name, slug, description, display_order) VALUES
  ('Getting Started', 'getting-started', 'New to AI? Start here for beginner guides and questions', 1),
  ('AI Implementation', 'ai-implementation', 'Share and discuss AI implementation strategies', 2),
  ('Product Reviews', 'product-reviews', 'Review and discuss AI tools from the marketplace', 3),
  ('Industry News', 'industry-news', 'Latest news and trends in pet industry AI', 4),
  ('Technical Support', 'technical-support', 'Get help with technical issues', 5);

-- ============================================
-- Seed: Marketplace Categories & Subcategories
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
-- Seed: Course Categories
-- ============================================
INSERT INTO course_categories (name, slug, display_order) VALUES
  ('AI Fundamentals', 'ai-fundamentals', 1),
  ('Veterinary AI', 'veterinary-ai', 2),
  ('Pet Retail AI', 'pet-retail-ai', 3),
  ('Leadership & Strategy', 'leadership-strategy', 4);
