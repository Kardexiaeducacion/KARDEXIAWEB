const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://jaubiayixcicaoywfqxy.supabase.co', 'sb_publishable_BNn8hdTiq0ZqIWQOzzRY1A_YM0HseUc');

async function test() {
  const { data, error } = await supabase.from('perfiles').select('*');
  if (error) console.error("Error:", error);
  else console.log("Success! Found users:", data?.length);
}

test();
