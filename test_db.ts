import { supabase } from './src/lib/supabase';
import { LocalDB } from './src/services/LocalDatabase';

async function test() {
  console.log("Testing insert...");
  const { error } = await LocalDB.saveMessage({
    name: "Test User",
    email: "test@example.com",
    message: "Test message",
    date: new Date().toLocaleTimeString(),
    status: "new",
    type: "chat",
    toEmail: "admin@alanissalon.com"
  });
  console.log("Insert result error:", error);

  console.log("Testing select...");
  const { data, error: err2 } = await supabase.from('messages').select('*').limit(1);
  console.log("Select data:", data);
  console.log("Select error:", err2);
}

test();
