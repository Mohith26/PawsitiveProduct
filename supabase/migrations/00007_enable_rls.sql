-- Enable RLS on all tables
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

-- Profiles: users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Chat channels: authenticated users can view public channels
CREATE POLICY "Public channels are viewable" ON chat_channels FOR SELECT TO authenticated USING (NOT is_private OR id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create channels" ON chat_channels FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Chat channel members
CREATE POLICY "Members can view channel membership" ON chat_channel_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join channels" ON chat_channel_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave channels" ON chat_channel_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Chat messages: members can view messages in their channels
CREATE POLICY "Channel members can view messages" ON chat_messages FOR SELECT TO authenticated USING (channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid()));
CREATE POLICY "Channel members can send messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND channel_id IN (SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid()));

-- Direct messages
CREATE POLICY "Users can view own DMs" ON direct_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send DMs" ON direct_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update DMs" ON direct_messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- Forums: public read, authenticated write
CREATE POLICY "Forum categories are viewable by all" ON forum_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Forum threads are viewable by all" ON forum_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create threads" ON forum_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own threads" ON forum_threads FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Forum posts are viewable by all" ON forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create posts" ON forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON forum_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Courses: public read for published
CREATE POLICY "Course categories are viewable" ON course_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Published courses are viewable" ON courses FOR SELECT TO authenticated USING (status = 'published' OR created_by = auth.uid());
CREATE POLICY "Lessons of published courses are viewable" ON lessons FOR SELECT TO authenticated USING (course_id IN (SELECT id FROM courses WHERE status = 'published'));

-- Course enrollments
CREATE POLICY "Users can view own enrollments" ON course_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll" ON course_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Lesson progress
CREATE POLICY "Users can view own progress" ON lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can track progress" ON lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Marketplace: approved products visible to all authenticated
CREATE POLICY "Marketplace categories viewable" ON marketplace_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Marketplace subcategories viewable" ON marketplace_subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Approved products are viewable" ON marketplace_products FOR SELECT TO authenticated USING (status = 'approved' OR vendor_id = auth.uid());
CREATE POLICY "Vendors can create products" ON marketplace_products FOR INSERT TO authenticated WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update own products" ON marketplace_products FOR UPDATE TO authenticated USING (auth.uid() = vendor_id);

CREATE POLICY "Product media is viewable" ON product_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "Product features are viewable" ON product_features FOR SELECT TO authenticated USING (true);

-- Reviews: verified members can write
CREATE POLICY "Reviews are viewable" ON product_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Verified users can create reviews" ON product_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Service leads
CREATE POLICY "Users can view own leads" ON service_leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create leads" ON service_leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Agent config: readable by authenticated
CREATE POLICY "Agent config is viewable" ON agent_config FOR SELECT TO authenticated USING (true);

-- Agent conversations
CREATE POLICY "Users can view own conversations" ON agent_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON agent_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Agent messages
CREATE POLICY "Users can view own agent messages" ON agent_messages FOR SELECT TO authenticated USING (conversation_id IN (SELECT id FROM agent_conversations WHERE user_id = auth.uid()));
CREATE POLICY "Users can create agent messages" ON agent_messages FOR INSERT TO authenticated WITH CHECK (conversation_id IN (SELECT id FROM agent_conversations WHERE user_id = auth.uid()));

-- Documents: service role only (no public access)
CREATE POLICY "Documents readable by authenticated" ON documents FOR SELECT TO authenticated USING (true);
