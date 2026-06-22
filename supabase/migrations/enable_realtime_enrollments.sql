-- =====================================================
-- Enable Realtime on enrollments table
-- Run in Supabase → SQL Editor
-- =====================================================

-- 1. Enable Realtime for enrollments table
ALTER TABLE enrollments REPLICA IDENTITY FULL;

-- Add to realtime publication (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'enrollments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;
  END IF;
END$$;

-- 2. Make sure RLS allows students to read their own enrollments
-- Drop existing if any and re-create cleanly
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON enrollments;

CREATE POLICY "Students can view own enrollments"
  ON enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Enable RLS on enrollments (if not already)
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
