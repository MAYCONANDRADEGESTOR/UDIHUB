import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "udihub-auth",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
      global: {
        fetch: (url, options) => fetch(url, { ...options, keepalive: true }),
      },
    }
  );
  return client;
}
