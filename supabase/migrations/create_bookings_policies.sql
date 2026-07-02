-- =====================================================
-- RLS Policies for the "bookings" table
-- Run this in Supabase → SQL Editor
-- =====================================================

-- 1. Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist to avoid duplicates
DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow admin all on bookings" ON public.bookings;

-- 3. Allow ANYONE (anonymous visitors) to submit booking requests (via the Booking Wizard)
CREATE POLICY "Allow public insert on bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

-- 4. Allow authenticated admins to do everything on bookings (select, insert, update, delete)
CREATE POLICY "Allow admin all on bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
