-- ====================================================
-- APLIKASI WISHLIST BERDUA - SQL DDL FOR SUPABASE
-- Paste skrip ini di SQL Editor Supabase Dashboard
-- ====================================================

-- 1. TABEL PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Trigger untuk membuat profil otomatis saat user register via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABEL CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📌',
  color TEXT DEFAULT '#7C9A8C',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Insert Default Categories (jika belum ada)
INSERT INTO public.categories (name, icon, color, is_default) 
SELECT 'Jalan-jalan', '🚗', '#10B981', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Jalan-jalan');

INSERT INTO public.categories (name, icon, color, is_default) 
SELECT 'Barang', '🛍️', '#F59E0B', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Barang');

INSERT INTO public.categories (name, icon, color, is_default) 
SELECT 'Nonton / Jajan', '🎬', '#EC4899', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Nonton / Jajan');

-- 3. TABEL WISHLIST_ITEMS
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount BIGINT DEFAULT 0,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  note TEXT,
  image_url TEXT,
  product_url TEXT,
  is_shared BOOLEAN DEFAULT TRUE,
  status TEXT CHECK (status IN ('pending', 'done')) DEFAULT 'pending',
  purchased_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purchased_type TEXT CHECK (purchased_type IN ('self', 'gift')),
  purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. TABEL SAVINGS
CREATE TABLE IF NOT EXISTS public.savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID REFERENCES public.wishlist_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. TABEL NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- DROP OLD POLICIES IF RE-RUNNING
DROP POLICY IF EXISTS "Authenticated profiles policy" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated categories policy" ON public.categories;
DROP POLICY IF EXISTS "Authenticated wishlist policy" ON public.wishlist_items;
DROP POLICY IF EXISTS "Authenticated savings policy" ON public.savings;
DROP POLICY IF EXISTS "Authenticated notifications policy" ON public.notifications;

-- CREATE POLICIES (Allow authenticated users to read/write shared data for couple app)
CREATE POLICY "Authenticated profiles policy" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated categories policy" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated wishlist policy" ON public.wishlist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated savings policy" ON public.savings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated notifications policy" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STORAGE BUCKET CREATION FOR WISHLIST IMAGES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wishlist-images', 'wishlist-images', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public Read Wishlist Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Wishlist Images" ON storage.objects;

CREATE POLICY "Public Read Wishlist Images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'wishlist-images');

CREATE POLICY "Authenticated Upload Wishlist Images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'wishlist-images') WITH CHECK (bucket_id = 'wishlist-images');

-- ENABLE REALTIME REPLICATION (Ignored if already enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE savings;
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
