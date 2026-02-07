CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model_id TEXT DEFAULT 'claude-sonnet-4-5-20250929',
  max_tokens INT DEFAULT 1024,
  temperature NUMERIC(2,1) DEFAULT 0.7,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_embedding ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  filter_source_type TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, source_type TEXT, source_id UUID, content TEXT, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.source_type, d.source_id, d.content,
         1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents d
  WHERE 1 - (d.embedding <=> query_embedding) > match_threshold
    AND (filter_source_type IS NULL OR d.source_type = filter_source_type)
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

INSERT INTO agent_config (agent_type, display_name, system_prompt) VALUES
('engagement', 'Pawsitive Pulse', 'You are the Pawsitive Pulse engagement agent for a pet industry executive community. Help admins create announcements, polls, and engaging content. Help members stay informed about community activity.'),
('recommendation', 'Pawsitive Advisor', 'You are the Pawsitive Advisor, an AI tool recommendation agent. You help pet industry executives discover the right AI tools for their business. Use the provided knowledge base context to ground your recommendations in real products and community feedback. Only recommend products that exist in the marketplace.');
