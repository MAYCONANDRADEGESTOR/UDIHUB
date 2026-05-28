"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Heart, User, Sparkles } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/servicos", icon: Search, label: "Buscar" },
  { href: "/seja-profissional", icon: Plus, label: "Anunciar", cta: true },
  { href: "/favoritos", icon: Heart, label: "Favoritos" },
  { href: "/perfil", icon: User, label: "Perfil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const hidden = ["/login", "/cadastro", "/admin"].some((p) =>
    pathname.startsWith(p)
  );
  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(9,9,11,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid #1F1F23",
      }}
    >
      {/* Neon blue top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #3B82F6 30%, #3B82F6 70%, transparent 100%)",
          boxShadow: "0 0 12px rgba(59,130,246,0.6)",
        }}
      />

      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {navItems.map(({ href, icon: Icon, label, cta }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");

          if (cta) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 -mt-5"
              >
                {/* Pulse rings */}
                <div className="relative flex items-center justify-center">
                  <span
                    className="absolute w-14 h-14 rounded-2xl"
                    style={{
                      background: "rgba(59,130,246,0.3)",
                      animation: "ctaPulse 2s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="absolute w-14 h-14 rounded-2xl"
                    style={{
                      background: "rgba(59,130,246,0.15)",
                      animation: "ctaPulse 2s ease-in-out infinite 0.4s",
                    }}
                  />
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                      boxShadow: "0 0 24px rgba(59,130,246,0.6)",
                    }}
                  >
                    <Icon size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <span
                  className="text-[10px] font-semibold mt-1"
                  style={{ color: "#3B82F6" }}
                >
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1 rounded-xl transition-all duration-200 active:scale-95"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  color: isActive ? "#3B82F6" : "#A1A1AA",
                  filter: isActive
                    ? "drop-shadow(0 0 6px rgba(59,130,246,0.6))"
                    : "none",
                  transition: "all 200ms ease",
                }}
              />
              <span
                className="text-[10px] font-medium transition-colors duration-200"
                style={{ color: isActive ? "#3B82F6" : "#A1A1AA" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Pulse animation keyframes */}
      <style jsx>{`
        @keyframes ctaPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(1.25); opacity: 0; }
        }
      `}</style>
    </nav>
  );
}
