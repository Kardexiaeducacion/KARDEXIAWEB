import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Leer .env.local
const envVars = fs.readFileSync('.env.local', 'utf-8').split('\n');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

for (const line of envVars) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
}

console.log("URL:", SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runTest() {
  const email = `bot_${Date.now()}@kardexia.com`;
  console.log(`Intentando registrar: ${email}...`);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
  });

  if (authError || !authData?.user) {
    console.error("❌ ERROR EN AUTH SIGNUP:", authError);
    return;
  }

  console.log("✅ AUTH SIGNUP EXITOSO. User ID:", authData.user.id);
  console.log("Intentando insertar en la tabla usuarios...");

  const { error: profileError } = await supabase.from('usuarios').insert([{
    id: authData.user.id,
    email: email,
    nombre: "Robot Test",
    rol: "Maestro",
    escuela: "Test School",
    estado_suscripcion: "trial",
    fecha_fin_prueba: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  }]);

  if (profileError) {
    console.error("❌ ERROR INSERTANDO EN USUARIOS:", profileError);
    return;
  }

  console.log("✅ INSERT EXITOSO EN USUARIOS!");
}

runTest();
