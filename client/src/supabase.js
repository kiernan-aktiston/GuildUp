import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://emdodkszhwulhcjebdqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_455p_jeew6nNULW_hD_ABA_UOCEfQDm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);