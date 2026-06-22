-- =====================================================
-- Storage Policies for "site-images" bucket
-- Run this in Supabase → SQL Editor
-- =====================================================

-- 1. Allow ANYONE to read/view images (public access)
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-images');

-- 2. Allow ANYONE to upload images (admin uses anon key from browser)
CREATE POLICY "Allow public uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-images');

-- 3. Allow ANYONE to update/replace images
CREATE POLICY "Allow public updates"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-images');

-- 4. Allow ANYONE to delete images
CREATE POLICY "Allow public deletes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-images');
