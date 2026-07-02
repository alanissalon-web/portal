import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.replace(/["']/g, '').trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Signing in as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'alanis.salon@gmail.com',
    password: 'alanis2026',
  });
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  const token = authData.session.access_token;
  console.log("Fetching schema with admin token...");
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const doc = await res.json();
    console.log("Keys of doc:", Object.keys(doc));
    if (doc.paths) {
      console.log("Available paths:", Object.keys(doc.paths));
    }
  } catch (err) {
    console.error("Schema fetch error:", err);
  }
}

run();
