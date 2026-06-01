import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role, banned")
      .eq("id", user.id)
      .single();

    // Usuario banido
    if (userData?.banned) {
      const response = NextResponse.redirect(new URL("/banido", request.url));
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return response;
    }

    // PROFISSIONAL: verifica se esta ativo
    if (userData?.role === "professional") {
      const { data: prof } = await supabase
        .from("professionals")
        .select("status, coupon_code, trial_ends_at")
        .eq("user_id", user.id)
        .single();

      const isActive = prof?.status === "active";
      const hasCoupon = !!prof?.coupon_code;
      const inTrial = prof?.trial_ends_at && new Date(prof.trial_ends_at) > new Date();
      const liberado = isActive || hasCoupon || inTrial;

      // Paginas liberadas mesmo sem pagar
      const allowedPaths = [
        "/painel/assinatura",
        "/painel/perfil",
        "/painel/retorno",
        "/api",
        "/sair",
        "/logout",
      ];
      const isAllowed = allowedPaths.some((p) => pathname.startsWith(p));

      // Se NAO esta liberado e tenta acessar area restrita
      if (!liberado && pathname.startsWith("/painel") && !isAllowed) {
        return NextResponse.redirect(new URL("/painel/assinatura", request.url));
      }

      // Profissional liberado em /inicio vai pro painel
      if (pathname === "/inicio" && liberado) {
        return NextResponse.redirect(new URL("/painel", request.url));
      }
    }

    // Admin em /inicio vai para /admin
    if (pathname === "/inicio" && userData?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Cliente tentando acessar /painel vai para /inicio
    if (pathname.startsWith("/painel") && userData?.role === "client") {
      return NextResponse.redirect(new URL("/inicio", request.url));
    }

    // Nao-admin tentando acessar /admin vai para /inicio
    if (pathname.startsWith("/admin") && userData?.role !== "admin") {
      return NextResponse.redirect(new URL("/inicio", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|banido|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
