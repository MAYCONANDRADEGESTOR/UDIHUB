import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  "/", "/seja-profissional", "/servicos", "/profissional",
  "/como-funciona", "/privacidade", "/termos", "/banido",
  "/excluir-conta", "/inicio", "/login", "/cadastro",
  "/recuperar-senha", "/auth",
];

const PRIVATE_ROUTES = ["/painel", "/admin", "/favoritos", "/perfil"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas — passa direto
  const isPublic = PUBLIC_ROUTES.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Só processa rotas privadas
  const isPrivate = PRIVATE_ROUTES.some((p) => pathname.startsWith(p));
  if (!isPrivate) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              maxAge: 60 * 60 * 24 * 365,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role, banned")
    .eq("id", user.id)
    .single();

  if (userData?.banned) {
    const res = NextResponse.redirect(new URL("/banido", request.url));
    res.cookies.delete("sb-access-token");
    res.cookies.delete("sb-refresh-token");
    return res;
  }

  const role = userData?.role;

  if (role === "admin") {
    if (pathname.startsWith("/painel")) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  if (role === "professional") {
    if (pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/painel", request.url));
    if (pathname.startsWith("/painel")) {
      const allowedPaths = ["/painel/assinatura", "/painel/perfil", "/painel/retorno"];
      const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));
      if (!isAllowed) {
        const { data: prof } = await supabase
          .from("professionals")
          .select("status, trial_ends_at")
          .eq("user_id", user.id)
          .single();
        const isActive = prof?.status === "active";
        const inTrial = prof?.trial_ends_at && new Date(prof.trial_ends_at) > new Date();
        if (!isActive && !inTrial) {
          return NextResponse.redirect(new URL("/painel/assinatura", request.url));
        }
      }
    }
    return response;
  }

  if (role === "client") {
    if (pathname.startsWith("/painel")) return NextResponse.redirect(new URL("/perfil", request.url));
    if (pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/inicio", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|banido|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
