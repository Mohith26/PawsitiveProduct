-- Auto-create a profile when a new auth user signs up
-- Uses SECURITY DEFINER to bypass RLS
-- Sets search_path to public so enum types are found
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
