CREATE TYPE user_role AS ENUM ('member', 'vendor', 'admin', 'super_admin');
CREATE TYPE industry_segment AS ENUM ('veterinary', 'cpg', 'retail', 'other');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  job_title TEXT,
  industry_segment industry_segment DEFAULT 'other',
  role user_role DEFAULT 'member',
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
