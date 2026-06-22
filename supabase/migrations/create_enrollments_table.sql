-- 1. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active',
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


-- 2. Product Favorites Table
CREATE TABLE IF NOT EXISTS public.product_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.product_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites" ON public.product_favorites
  FOR ALL TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all favorites" ON public.product_favorites
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- 3. Product Reservations Table
CREATE TABLE IF NOT EXISTS public.product_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and insert their own reservations" ON public.product_reservations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations" ON public.product_reservations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reservations" ON public.product_reservations
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
