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

    // Profissional na landing OU em /inicio -> vai para /painel
    if ((pathname === "/" || pathname === "/inicio") && userData?.role === "professional") {
      return NextResponse.redirect(new URL("/painel", request.url));
    }

    // Admin na landing OU em /inicio -> vai para /admin
    if ((pathname === "/" || pathname === "/inicio") && userData?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Cliente na landing -> vai para /inicio
    if (pathname === "/" && userData?.role === "client") {
      return NextResponse.redirect(new URL("/inicio", request.url));
    }

    // Cliente tentando acessar /painel -> manda para /inicio
    if (pathname.startsWith("/painel") && userData?.role === "client") {
      return NextResponse.redirect(new URL("/inicio", request.url));
    }

    // Nao-admin tentando acessar /admin -> manda para /inicio
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
