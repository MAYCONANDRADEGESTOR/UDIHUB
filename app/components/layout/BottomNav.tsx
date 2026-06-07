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
  }, []);

  // Ocultar em páginas de auth e admin
  const hidden = [
    "/login", "/cadastro", "/recuperar-senha", "/admin",
  ].some((p) => pathname.startsWith(p));

  if (hidden) return null;

  const isHomeActive = pathname === "/inicio";
  const isSearchActive = pathname === "/servicos" || pathname.startsWith("/servicos/");
  const isFavActive = pathname === "/favoritos";
  const isPainelActive = painelHref
    ? pathname === painelHref || pathname.startsWith(painelHref + "/")
    : false;

  return (
    <>
      {/* Espaço para o conteúdo não ficar atrás da navbar */}
      <div style={{ height: "84px" }} />

      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          background: "transparent",
        }}>

        {/* Container da barra */}
        <div className="px-4 pb-3 pt-1">
          <div
            className="flex items-center justify-between px-6 relative"
            style={{
              background: "rgba(18,18,20,0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 -2px 30px rgba(0,0,0,0.4), 0 4px 30px rgba(0,0,0,0.3)",
              height: "64px",
            }}>

            {/* Home */}
            <Link
              href="/inicio"
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 active:scale-90"
              style={{ background: isHomeActive ? "rgba(59,130,246,0.12)" : "transparent" }}>
              <Home
                size={24}
                strokeWidth={isHomeActive ? 2.5 : 1.8}
                style={{
                  color: isHomeActive ? "#3B82F6" : "rgba(255,255,255,0.5)",
                  filter: isHomeActive ? "drop-shadow(0 0 8px rgba(59,130,246,0.6))" : "none",
                  transition: "all 0.2s ease",
                }}
              />
            </Link>

            {/* Buscar */}
            <Link
              href="/servicos"
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 active:scale-90"
              style={{ background: isSearchActive ? "rgba(59,130,246,0.12)" : "transparent" }}>
              <Search
                size={23}
                strokeWidth={isSearchActive ? 2.5 : 1.8}
                style={{
                  color: isSearchActive ? "#3B82F6" : "rgba(255,255,255,0.5)",
                  filter: isSearchActive ? "drop-shadow(0 0 8px rgba(59,130,246,0.6))" : "none",
                  transition: "all 0.2s ease",
                }}
              />
            </Link>

            {/* Botão central flutuante — Anunciar */}
            <div className="relative flex items-center justify-center" style={{ width: "56px" }}>
              <Link
                href="/seja-profissional"
                className="absolute flex items-center justify-center transition-all duration-200 active:scale-90"
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, #3B82F6 0%, #1d4ed8 100%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 20px rgba(59,130,246,0.5), 0 8px 40px rgba(59,130,246,0.25)",
                  bottom: "12px",
                }}>
                {/* Glow animado */}
                <span
                  className="absolute inset-0 rounded-[18px] animate-ping"
                  style={{
                    background: "rgba(59,130,246,0.3)",
                    animationDuration: "2.5s",
                    animationTimingFunction: "ease-out",
                  }}
                />
                <Plus size={26} className="text-white relative z-10" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Favoritos */}
            <Link
              href="/favoritos"
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 active:scale-90"
              style={{ background: isFavActive ? "rgba(239,68,68,0.1)" : "transparent" }}>
              <Heart
                size={23}
                strokeWidth={isFavActive ? 0 : 1.8}
                fill={isFavActive ? "#ef4444" : "none"}
                style={{
                  color: isFavActive ? "#ef4444" : "rgba(255,255,255,0.5)",
                  filter: isFavActive ? "drop-shadow(0 0 8px rgba(239,68,68,0.5))" : "none",
                  transition: "all 0.2s ease",
                }}
              />
            </Link>

            {/* Perfil — avatar do usuário */}
            {!loaded ? (
              <div
                className="w-8 h-8 rounded-full skeleton"
                style={{ flexShrink: 0 }}
              />
            ) : (
              <Link
                href={painelHref || "/login"}
                className="flex items-center justify-center transition-all duration-200 active:scale-90"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  padding: "2px",
                  background: isPainelActive
                    ? "linear-gradient(135deg, #3B82F6, #1d4ed8)"
                    : "transparent",
                  boxShadow: isPainelActive ? "0 0 12px rgba(59,130,246,0.5)" : "none",
                  transition: "all 0.2s ease",
                }}>
                {avatar ? (
                  <img
                    src={avatar}
                    alt={userName || "Perfil"}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: isPainelActive ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#93c5fd",
                      border: isPainelActive ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                    }}>
                    {painelHref === "/login"
                      ? "?"
                      : getInitials(userName || "U")}
                  </div>
                )}
              </Link>
            )}

          </div>
        </div>
      </nav>
    </>
  );
}
