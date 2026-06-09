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

  // Rotas publicas — passa direto sem nenhuma query
  const isPublic = PUBLIC_ROUTES.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  );
  if (isPublic) return NextResponse.next({ request: { headers: request.headers } });

  // So processa rotas privadas
  const isPrivate = PRIVATE_ROUTES.some((p) => pathname.startsWith(p));
  if (!isPrivate) return NextResponse.next({ request: { headers: request.headers } });

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
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

  // getSession le o JWT local — ZERO round-trip ao servidor
  // muito mais rapido que getUser()
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role vem do JWT injetado pelo hook — sem query ao banco
  const role = session.user?.app_metadata?.role
    || session.user?.user_metadata?.role;

  // Verificar se esta banido via JWT claim
  const banned = session.user?.app_metadata?.banned;
  if (banned) {
    const res = NextResponse.redirect(new URL("/banido", request.url));
    res.cookies.delete("sb-access-token");
    res.cookies.delete("sb-refresh-token");
    return res;
  }

  // Se nao tem role no JWT ainda (cadastro recente), busca no banco
  if (!role) {
    const { data: userData } = await supabase
      .from("users")
      .select("role, banned")
      .eq("id", session.user.id)
      .single();

    if (userData?.banned) {
      const res = NextResponse.redirect(new URL("/banido", request.url));
      res.cookies.delete("sb-access-token");
      res.cookies.delete("sb-refresh-token");
      return res;
    }

    return handleRouting(pathname, userData?.role, session.user.id, supabase, request, response);
  }

  return handleRouting(pathname, role, session.user.id, supabase, request, response);
}

async function handleRouting(
  pathname: string,
  role: string | undefined,
  userId: string,
  supabase: any,
  request: NextRequest,
  response: NextResponse
) {
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
          .eq("user_id", userId)
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
