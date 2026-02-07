CREATE TYPE product_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE autonomy_level AS ENUM ('human_in_the_loop', 'semi_autonomous', 'fully_autonomous');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'in_progress', 'closed');

CREATE TABLE marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE marketplace_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  display_order INT DEFAULT 0,
  UNIQUE(category_id, slug)
);

CREATE TABLE marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES marketplace_subcategories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  autonomy_level autonomy_level,
  is_verified BOOLEAN DEFAULT false,
  status product_status DEFAULT 'pending',
  rejection_reason TEXT,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  problem_keywords TEXT[],
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE product_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL
);

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES marketplace_products(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE service_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES marketplace_products(id),
  user_id UUID REFERENCES profiles(id),
  user_name TEXT NOT NULL,
  company TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  budget TEXT,
  contractor_id UUID REFERENCES profiles(id),
  status lead_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE forum_threads
  ADD CONSTRAINT fk_linked_product
  FOREIGN KEY (linked_product_id) REFERENCES marketplace_products(id) ON DELETE SET NULL;

CREATE FUNCTION update_product_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.tagline, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(array_to_string(NEW.problem_keywords, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_search_vector_trigger
  BEFORE INSERT OR UPDATE ON marketplace_products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

CREATE INDEX idx_marketplace_products_search ON marketplace_products USING GIN(search_vector);
