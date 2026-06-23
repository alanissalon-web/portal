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
  console.log("Testing signInAnonymously...");
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  if (authError) {
    console.log("Anonymous sign-in failed:", authError);
    return;
  }
  console.log("Signed in anonymously! Session:", authData.session?.user?.id);

  console.log("Testing insert as authenticated anon...");
  const newItem = { 
    name: "Anonymous User",
    email: "anon@example.com",
    phone: "CHAT_MSG",
    message: "Test message from authenticated anon",
    status: "new"
  };

  const { data, error } = await supabase.from('messages').insert([newItem]).select();
  console.log("Result:", data);
  console.log("Error:", error);
}

run();
