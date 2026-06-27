import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://rjdcuhxskwnchzaakjgv.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_iH7r3lGIYm0RepR9pj-Nyg_sO4-JErJ";

export const SUPABASE_ENDPOINT = `${SUPABASE_URL}/functions/v1/gemma-node-app`;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
