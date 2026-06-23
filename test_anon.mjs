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
  console.log("Testing anonymous insert...");
  const newItem = { 
    name: "Anonymous User",
    email: "anon@example.com",
    phone: "CHAT_MSG",
    message: "Test message from anon",
    status: "new"
  };

  const { data, error } = await supabase.from('messages').insert([newItem]).select();
  console.log("Result:", data);
  console.log("Error:", error);
}

run();
