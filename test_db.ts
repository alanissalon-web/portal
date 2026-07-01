import { supabase } from './src/lib/supabase';
import { LocalDB } from './src/services/LocalDatabase';

async function test() {
  console.log("Fetching all messages...");
  const { data, error } = await supabase.from('messages').select('*');
  console.log("All messages:", data);
  console.log("Error:", error);
}

test();
