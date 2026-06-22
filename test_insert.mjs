import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ceqgqdvabqelmdvcpiou.supabase.co';
const supabaseKey = 'sb_publishable_7amam_1tAFFpahoxowREOQ_ARUZzPgg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  // First login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'alanis.salon@gmail.com',
    password: 'alanis2026',
  });
  if (authError) {
    console.error('Login error:', authError.message);
    return;
  }
  console.log('Logged in:', authData.user.email);

  const course = {
    id: 'test-course',
    title: 'Test',
    description: 'Test',
    price: 100,
    image_url: null,
    type: 'on-demand',
    duration: '1h',
    level: 'Beginner',
    topics: ['test'],
    meet_link: null,
    status: 'draft',
    badge: null,
    access_code: 'TEST',
    curriculum: [],
    next_date: null
  };

  const { error } = await supabase.from('courses').upsert(course);
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success');
  }
}

testInsert();
