import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ceqgqdvabqelmdvcpiou.supabase.co';
const supabaseKey = 'sb_publishable_7amam_1tAFFpahoxowREOQ_ARUZzPgg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  console.log('Creando usuario...');
  const { data, error } = await supabase.auth.signUp({
    email: 'alanis.salon@gmail.com',
    password: 'alanis2026',
  });

  if (error) {
    console.error('Error al crear usuario:', error.message);
  } else {
    console.log('Usuario creado exitosamente:', data.user?.email);
  }
}

createUser();
