import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types'; // 👈 Must import from the file above

export function createClient() {
  return createBrowserClient<Database>( // 👈 Must pass <Database> generic here
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}