import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/inicio";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options ?? {});
            });
          } catch {}
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Upsert user — funciona para Google OAuth e email/senha
  try {
    await supabase.from("users").upsert(
      {
        id: data.user.id,
        email: data.user.email!,
        name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email!.split("@")[0],
        avatar: data.user.user_metadata?.avatar_url || null,
        role: "client",
        banned: false,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  } catch {}

  return NextResponse.redirect(`${origin}${next}`);
}
