import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const dest = searchParams.get("dest") || "/inicio";

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                maxAge: 60 * 60 * 24 * 365,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
              })
            );
          } catch {}
        },
      },
    }
  );

  // Força o Supabase SSR a ler a sessão do browser e criar os cookies
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Redireciona para o destino com os cookies já criados
  return NextResponse.redirect(`${origin}${dest}`);
}
