-- =====================================================
-- RLS Policies for the "messages" table
-- Run this in Supabase → SQL Editor
-- =====================================================

-- 1. Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist to avoid duplicates
DROP POLICY IF EXISTS "Allow public insert on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public select on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow admin update on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow admin delete on messages" ON public.messages;

-- 3. Allow ANYONE (anonymous visitors) to send messages (contact form / chat)
CREATE POLICY "Allow public insert on messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- 4. Allow public users to read messages (required for client chat widget to see their own history)
CREATE POLICY "Allow public select on messages"
  ON public.messages FOR SELECT
  USING (true);

-- 5. Allow authenticated admins to update messages (change status to read, etc.)
CREATE POLICY "Allow admin update on messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (true);

-- 6. Allow authenticated admins to delete messages
CREATE POLICY "Allow admin delete on messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (true);
