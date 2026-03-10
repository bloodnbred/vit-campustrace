
-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  roll_number TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-assign student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Campus locations
CREATE TABLE public.campus_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('block', 'room', 'custom')),
  parent_id UUID REFERENCES public.campus_locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locations viewable by everyone" ON public.campus_locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON public.campus_locations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'claimed', 'returned')),
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  image_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  location_id UUID REFERENCES public.campus_locations(id),
  location_name TEXT NOT NULL,
  reporter_id UUID NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items viewable by everyone" ON public.items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create items" ON public.items FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporters can update own items" ON public.items FOR UPDATE USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can update any item" ON public.items FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete items" ON public.items FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Claim requests
CREATE TABLE public.claim_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL,
  claimant_name TEXT NOT NULL,
  explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Claims viewable by item reporter and claimant" ON public.claim_requests FOR SELECT USING (
  auth.uid() = claimant_id OR 
  auth.uid() IN (SELECT reporter_id FROM public.items WHERE id = item_id)
);
CREATE POLICY "Authenticated users can create claims" ON public.claim_requests FOR INSERT WITH CHECK (auth.uid() = claimant_id);
CREATE POLICY "Item reporter can update claims" ON public.claim_requests FOR UPDATE USING (
  auth.uid() IN (SELECT reporter_id FROM public.items WHERE id = item_id)
);

-- Storage bucket for item images
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);
CREATE POLICY "Item images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
CREATE POLICY "Authenticated users can upload item images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed default locations
INSERT INTO public.campus_locations (id, name, type) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'M Block', 'block'),
  ('b2000000-0000-0000-0000-000000000001', 'A Block', 'block'),
  ('b3000000-0000-0000-0000-000000000001', 'B Block', 'block');

INSERT INTO public.campus_locations (name, type, parent_id) VALUES
  ('M201', 'room', 'b1000000-0000-0000-0000-000000000001'),
  ('M202', 'room', 'b1000000-0000-0000-0000-000000000001'),
  ('M203', 'room', 'b1000000-0000-0000-0000-000000000001'),
  ('M301', 'room', 'b1000000-0000-0000-0000-000000000001'),
  ('A101', 'room', 'b2000000-0000-0000-0000-000000000001'),
  ('A102', 'room', 'b2000000-0000-0000-0000-000000000001'),
  ('A201', 'room', 'b2000000-0000-0000-0000-000000000001'),
  ('B101', 'room', 'b3000000-0000-0000-0000-000000000001'),
  ('B102', 'room', 'b3000000-0000-0000-0000-000000000001');

INSERT INTO public.campus_locations (name, type) VALUES
  ('Library', 'custom'),
  ('Canteen', 'custom'),
  ('Playground', 'custom'),
  ('Parking Area', 'custom'),
  ('Student Den', 'custom'),
  ('Main Corridor', 'custom'),
  ('Pathway - Gate 1', 'custom');
