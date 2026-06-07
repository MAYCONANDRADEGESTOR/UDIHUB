"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, Plus, Heart, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BottomNav() {
  const pathname = usePathname();
  const [painelHref, setPainelHref] = useState<string | null>(null);

  useEffect(() => {
    async function loadRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPainelHref("/login"); return; }
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
      if (data?.role === "admin") setPainelHref("/admin");
      else if (data?.role === "professional") setPainelHref("/painel");
      else setPainelHref("/perfil");
    }
    loadRole();
  }, []);

  // Ocultar em páginas de auth e admin (admin tem nav própria)
  const hidden = [
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/admin",
  ].some((p) => pathname.startsWith(p));

  if (hidden) return null;

  const navItems = [
    { href: "/inicio", icon: Home, label: "Home" },
    { href: "/servicos", icon: Search, label: "Buscar" },
    { href: "/seja-profissional", icon: Plus, label: "Anunciar", cta: true },
    { href: "/favoritos", icon: Heart, label: "Favoritos" },
    { href: painelHref, icon: LayoutDashboard, label: "Painel" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: "rgba(9,9,11,0.97)", borderTop: "1px solid #1F1F23", willChange: "transform" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent 0%, #3B82F6 30%, #3B82F6 70%, transparent 100%)", boxShadow: "0 0 10px rgba(59,130,246,0.5)" }} />
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {navItems.map(({ href, icon: Icon, label, cta }) => {
          const resolvedHref = href || "/login";
          const isActive = resolvedHref === "/inicio"
            ? pathname === "/inicio"
            : pathname === resolvedHref || pathname.startsWith(resolvedHref + "/");

          if (cta) return (
            <Link key={label} href={resolvedHref}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-10 h-10 rounded-xl animate-ping"
                  style={{ background: "rgba(59,130,246,0.25)", animationDuration: "2s" }} />
                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform duration-150"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.5)" }}>
                  <Icon size={20} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: "#3B82F6" }}>{label}</span>
            </Link>
          );

          // Botão Painel — mostra spinner enquanto carrega o role
          if (label === "Painel" && !painelHref) return (
            <div key={label} className="flex flex-col items-center gap-1 min-w-[56px] py-1 opacity-50">
              <Icon size={22} strokeWidth={1.8} style={{ color: "#A1A1AA" }} />
              <span className="text-[10px] font-medium" style={{ color: "#A1A1AA" }}>{label}</span>
            </div>
          );

          return (
            <Link key={label} href={resolvedHref}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1 rounded-xl active:scale-95 transition-transform duration-150">
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? "#3B82F6" : "#A1A1AA", filter: isActive ? "drop-shadow(0 0 5px rgba(59,130,246,0.5))" : "none" }} />
              <span className="text-[10px] font-medium"
                style={{ color: isActive ? "#3B82F6" : "#A1A1AA" }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
