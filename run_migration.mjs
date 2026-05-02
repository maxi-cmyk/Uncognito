import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const supabaseUrl = "https://dgsqalakuycjxdnsdrnl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc3FhbGFrdXljanhkbnNkcm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY4OTgwOCwiZXhwIjoyMDkzMjY1ODA4fQ.pS_DGYSErJrMQfYgDoiqJkf_2vbjQlrfUkXxDRD94Wg";

const client = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const sqlPath = resolve(process.cwd(), "backend/services/storage/migrations/001_initial_supabase_storage.sql");
const sql = readFileSync(sqlPath, "utf8");

console.log("Executing migration...");

const statements = [];
let current = '';
let inDollarBlock = false;

const lines = sql.split('\n');
for (const line of lines) {
  if (line.trim().startsWith('do $$')) {
    inDollarBlock = true;
    current += line + '\n';
  } else if (inDollarBlock && line.trim() === 'end $$;') {
    current += line + '\n';
    inDollarBlock = false;
    statements.push(current.trim());
    current = '';
  } else if (inDollarBlock) {
    current += line + '\n';
  } else if (!line.trim() || line.trim().startsWith('--')) {
    if (current.trim()) {
      statements.push(current.trim());
      current = '';
    }
  } else {
    current += line + '\n';
    if (line.trim().endsWith(';')) {
      statements.push(current.trim());
      current = '';
    }
  }
}
if (current.trim()) statements.push(current.trim());

console.log(`Found ${statements.length} statements`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  try {
    const { data, error } = await client.sql(stmt);
    if (error) {
      console.error(`Statement ${i+1} ERROR:`, error.message);
      console.error(`SQL: ${stmt.substring(0, 200)}...`);
    } else {
      console.log(`Statement ${i+1}: OK`);
    }
  } catch (e) {
    console.error(`Statement ${i+1} EXCEPTION:`, e.message);
    console.error(`SQL preview: ${stmt.substring(0, 200)}...`);
  }
}

console.log("\n=== VERIFICATION ===");

const { data: tables, error: tErr } = await client.sql(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`);
if (tErr) {
  console.error("Tables query error:", tErr.message);
} else {
  console.log("\n1. Public tables:", JSON.stringify(tables, null, 2));
}

const { data: enums, error: eErr } = await client.sql(`SELECT typname, enum_range(NULL::public.roast_status) as statuses, enum_range(NULL::public.share_status) as share_statuses, enum_range(NULL::public.capture_mode) as capture_modes FROM pg_type WHERE typname IN ('roast_status', 'share_status', 'capture_mode');`);
if (eErr) {
  console.error("Enums query error:", eErr.message);
} else {
  console.log("\n2. Enum types:", JSON.stringify(enums, null, 2));
}

const { data: buckets, error: bErr } = await client.sql(`SELECT id, name, public FROM storage.buckets;`);
if (bErr) {
  console.error("Buckets query error:", bErr.message);
} else {
  console.log("\n3. Storage buckets:", JSON.stringify(buckets, null, 2));
}

const { data: roasts, error: rErr } = await client.sql(`SELECT * FROM public.roasts LIMIT 0;`);
if (rErr) {
  console.error("Roasts query error:", rErr.message);
} else {
  console.log("\n4. Roasts table: queryable (no rows returned)");
}

console.log("\n=== DONE ===");
