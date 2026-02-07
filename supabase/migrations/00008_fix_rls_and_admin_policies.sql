-- Fix chat messages RLS: allow all authenticated users to read/write in public channels
DROP POLICY IF EXISTS "Channel members can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Channel members can send messages" ON chat_messages;

-- All authenticated users can view messages in public channels; private channel messages require membership
CREATE POLICY "Users can view messages in public channels" ON chat_messages
  FOR SELECT TO authenticated
  USING (
    channel_id IN (
      SELECT id FROM chat_channels WHERE NOT is_private
    )
    OR
    channel_id IN (
      SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid()
    )
  );

-- All authenticated users can send messages in public channels; private channels require membership
CREATE POLICY "Users can send messages in public channels" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      channel_id IN (
        SELECT id FROM chat_channels WHERE NOT is_private
      )
      OR
      channel_id IN (
        SELECT channel_id FROM chat_channel_members WHERE user_id = auth.uid()
      )
    )
  );

-- Allow message updates (edit own messages)
CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

-- Admin policies: admins can create courses
CREATE POLICY "Admins can create courses" ON courses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can update courses
CREATE POLICY "Admins can update courses" ON courses
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can view all courses (including drafts)
DROP POLICY IF EXISTS "Published courses are viewable" ON courses;
CREATE POLICY "Courses are viewable" ON courses
  FOR SELECT TO authenticated
  USING (
    status = 'published'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can create lessons
CREATE POLICY "Admins can create lessons" ON lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can update lessons
CREATE POLICY "Admins can update lessons" ON lessons
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can approve/reject marketplace products
DROP POLICY IF EXISTS "Vendors can update own products" ON marketplace_products;
CREATE POLICY "Vendors and admins can update products" ON marketplace_products
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = vendor_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can update agent config
CREATE POLICY "Admins can update agent config" ON agent_config
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can insert agent config
CREATE POLICY "Admins can insert agent config" ON agent_config
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can view all service leads
DROP POLICY IF EXISTS "Users can view own leads" ON service_leads;
CREATE POLICY "Users and admins can view leads" ON service_leads
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can update service leads
CREATE POLICY "Admins can update service leads" ON service_leads
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can manage forum categories
CREATE POLICY "Admins can create forum categories" ON forum_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can manage course categories
CREATE POLICY "Admins can create course categories" ON course_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admin policies: admins can view all marketplace products
DROP POLICY IF EXISTS "Approved products are viewable" ON marketplace_products;
CREATE POLICY "Products are viewable" ON marketplace_products
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR vendor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
