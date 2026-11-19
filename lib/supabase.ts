import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

// Placeholder values keep the build working when the keys are missing;
// the UI checks isSupabaseConfigured before making any request.
export const supabase = createClient(
  url || "http://localhost:54321",
  key || "missing-anon-key",
);
