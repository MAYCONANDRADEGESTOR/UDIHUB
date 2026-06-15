"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, Plus, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const [painelHref, setPainelHref] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPainelHref("/login");
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("role, avatar, name")
        .eq("id", user.id)
        .single();
      setAvatar(data?.avatar || null);
      setUserName(data?.name || null);
      if (data?.role === "admin") setPainelHref("/admin");
      else if (data?.role === "professional") setPainelHref("/painel");
      else setPainelHref("/perfil");
      setLoaded(true);
    }
    loadUser();
  }, [pathname]);

  // Esconde o BottomNav nessas rotas
  const hidden = ["/login", "/cadastro", "/recuperar-senha", "/admin", "/bem-vindo"]
    .some((p) => pathname.startsWith(p));
  if (hidden) return null;

  const isHomeActive = pathname === "/";
  const isSearchActive = pathname === "/inicio" || pathname === "/servicos" || pathname.startsWith("/servicos/");
  const isFavActive = pathname === "/favoritos";

  // Ativo quando está no painel ou em qualquer sub-rota do painel
  const isPainelActive = painelHref
    ? pathname === painelHref || pathname.startsWith(painelHref + "/") || pathname.startsWith("/painel")
    : false;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="px-4 pb-3 pt-1">
        <div className="flex items-center justify-between px-5"
          style={{
            background: "rgba(18,18,20,0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 -2px 30px rgba(0,0,0,0.4), 0 4px 30px rgba(0,0,0,0.3)",
            height: "64px",
          }}>

          {/* Home */}
          <Link href="/"
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 active:scale-90"
            style={{ background: isHomeActive ? "rgba(59,130,246,0.12)" : "transparent" }}>
            <Home size={24} strokeWidth={isHomeActive ? 2.5 : 1.8}
              style={{ color: isHomeActive ? "#3B82F6" : "rgba(255,255,255,0.5)", transition: "all 0.2s ease" }} />
          </Link>

          {/* Buscar */}
          <Link href="/inicio"
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 active:scale-90"
            style={{ background: isSearchActive ? "rgba(59,130,246,0.12)" : "transparent" }}>
            <Search size={22} strokeWidth={isSearchActive ? 2.5 : 1.8}
              style={{ color: isSearchActive ? "#3B82F6" : "rgba(255,255,255,0.5)", transition: "all 0.2s ease" }} />
          </Link>

          {/* Botão central */}
          <Link href="/seja-profissional"
            className="flex items-center justify-center active:scale-90 transition-transform duration-150"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%)",
              flexShrink: 0,
            }}>
            <Plus size={24} className="text-white" strokeWidth={2.5} />
          </Link>

          {/* Favoritos */}
          <Link href="/favoritos"
            className="flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 active:scale-90"
            style={{ background: isFavActive ? "rgba(239,68,68,0.1)" : "transparent" }}>
            <Heart size={22}
              strokeWidth={isFavActive ? 0 : 1.8}
              fill={isFavActive ? "#ef4444" : "none"}
              style={{ color: isFavActive ? "#ef4444" : "rgba(255,255,255,0.5)", transition: "all 0.2s ease" }} />
          </Link>

          {/* Perfil / Painel */}
          {!loaded ? (
            <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
          ) : (
            <Link href={painelHref || "/login"}
              className="flex items-center justify-center active:scale-90 transition-all duration-200 flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                padding: isPainelActive ? "2px" : "0",
                background: isPainelActive ? "linear-gradient(135deg, #3B82F6, #1d4ed8)" : "transparent",
                transition: "all 0.2s ease",
              }}>
              {avatar ? (
                <img src={avatar} alt={userName || "Perfil"}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: painelHref === "/login" ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#93c5fd",
                }}>
                  {painelHref === "/login" ? "?" : getInitials(userName || "U")}
                </div>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
