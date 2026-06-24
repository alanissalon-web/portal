import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function testUpload() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const fileContent = "Test content";
  const { data, error } = await supabase.storage.from('site-images').upload('cms/test.txt', fileContent, { upsert: true, contentType: 'text/plain' });

  console.log('Upload result:', data);
  if (error) console.error('Upload error:', error);
}

testUpload();
