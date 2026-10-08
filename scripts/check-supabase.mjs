import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

if (!url || !key) {
  console.error("Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

async function check(table) {
  const r = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const body = await r.text();
  const ok = r.status < 400 || r.status === 401;
  console.log(`${ok ? "OK " : "ERR"} ${table}: HTTP ${r.status} ${body.slice(0, 140)}`);
  return r.status !== 404;
}

const a = await check("profiles");
const b = await check("learning_analytics");

if (a && b) {
  console.log("\nTablas presentes. Ejecuta la app, inicia sesion y vuelve a correr este script.");
  process.exit(0);
}

console.log("\nLas tablas NO existen. Pega supabase/schema.sql en Supabase Dashboard > SQL Editor > Run");
process.exit(1);
