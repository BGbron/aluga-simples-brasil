
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yuelwxpecsitfsywzbno.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWx3eHBlY3NpdGZzeXd6Ym5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTcyNjIsImV4cCI6MjA2NDYzMzI2Mn0.wyw2-kjbTuDlYlNrpoq-S73KXlAXvBFhFgCNh9XFTeM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
