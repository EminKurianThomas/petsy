// Diagnostic script to check Supabase connection and tables
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  console.log('🔍 Checking Supabase project connection...');
  console.log('Project URL:', process.env.SUPABASE_URL);

  const checks = [
    { name: 'profiles table', fn: () => sb.from('profiles').select('id', { head: true, count: 'exact' }) },
    { name: 'pets table',     fn: () => sb.from('pets').select('id', { head: true, count: 'exact' }) },
    { name: 'admins table',   fn: () => sb.from('admins').select('user_id', { head: true, count: 'exact' }) },
    { name: 'is_admin() RPC', fn: () => sb.rpc('is_admin') },
  ];

  let allGood = true;
  for (const c of checks) {
    const res = await c.fn();
    if (res.error) {
      console.log(`❌  ${c.name}: NOT FOUND (${res.error.message})`);
      allGood = false;
    } else {
      console.log(`✅  ${c.name}: OK`);
    }
  }

  if (!allGood) {
    console.log('\n👉 Action needed: Run supabase_complete_setup.sql in your Supabase SQL Editor!');
  } else {
    console.log('\n🎉 Everything is configured and ready!');
  }
}

check();
