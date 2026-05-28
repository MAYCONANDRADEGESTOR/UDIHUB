"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, LogOut, Star, Heart, Settings,
  ChevronRight, Shield, HelpCircle, Instagram, Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

interface Profile {
  name: string;
  email: string;
  role: string;
  neighborhood?: string;
  city?: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("users")
        .select("name, email, role, neighborhood, city")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
      else setProfile({ name: user.email?.split("@")[0] || "Usuário", email: user.email || "", role: "client" });
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Até logo!");
    router.push("/");
    router.refresh();
  }

  const MENU_ITEMS = [
    { icon: Star, label: "Minhas avaliações", href: "/avaliacoes", desc: "Avaliações enviadas" },
    { icon: Heart, label: "Favoritos", href: "/favoritos", desc: "Profissionais salvos" },
    { icon: Shield, label: "Privacidade", href: "/privacidade", desc: "Política de privacidade" },
    { icon: HelpCircle, label: "Como funciona", href: "/como-funciona", desc: "Ajuda e tutorial" },
    { icon: Settings, label: "Termos de uso", href: "/termos", desc: "Termos e condições" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <h1 className="font-syne font-bold text-xl text-foreground">Perfil</h1>
      </div>

      <div className="px-4 py-6">
        {/* Avatar */}
        {profile ? (
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-syne font-bold text-xl"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
              {getInitials(profile.name)}
            </div>
            <div>
              <h2 className="font-syne font-bold text-lg text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted">{profile.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
                  {profile.role === "professional" ? "Profissional" : "Cliente"}
                </span>
                {profile.neighborhood && (
                  <>
                    <span className="text-muted text-xs">·</span>
                    <span className="text-xs text-muted">{profile.neighborhood}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl skeleton" />
            <div className="space-y-2">
              <div className="w-32 h-4 rounded skeleton" />
              <div className="w-24 h-3 rounded skeleton" />
            </div>
          </div>
        )}

        {/* Switch to professional CTA */}
        {profile?.role === "client" && (
          <Link href="/seja-profissional"
            className="flex items-center gap-3 p-4 rounded-2xl mb-6"
            style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.15)" }}>
              <span className="text-xl">💼</span>
            </div>
            <div className="flex-1">
              <p className="font-syne font-bold text-sm text-white">Seja um profissional</p>
              <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>Crie seu perfil e receba clientes</p>
            </div>
            <ChevronRight size={16} style={{ color: "#3B82F6" }} />
          </Link>
        )}

        {/* Painel profissional CTA */}
        {profile?.role === "professional" && (
          <Link href="/painel"
            className="flex items-center gap-3 p-4 rounded-2xl mb-6"
            style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.15)" }}>
              <span className="text-xl">📊</span>
            </div>
            <div className="flex-1">
              <p className="font-syne font-bold text-sm text-white">Meu painel</p>
              <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>Ver leads e métricas</p>
            </div>
            <ChevronRight size={16} style={{ color: "#3B82F6" }} />
          </Link>
        )}

        {/* Menu */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1F1F23" }}>
          {MENU_ITEMS.map(({ icon: Icon, label, href, desc }, i) => (
            <Link key={href} href={href}
              className="flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-white/[0.02]"
              style={{ borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid #1F1F23" : "none", background: "#111113" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.08)" }}>
                <Icon size={15} style={{ color: "#3B82F6" }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
              <ChevronRight size={14} className="text-muted" />
            </Link>
          ))}
        </div>

        {/* Social */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <a href="https://www.instagram.com/udihub" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted">
            <Instagram size={14} /> @udihub
          </a>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} disabled={loggingOut}
          className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          {loggingOut ? "Saindo..." : "Sair da conta"}
        </button>

        <p className="text-center text-[10px] text-muted mt-6">UDIHUB v0.1.0 · Uberlândia, MG</p>
      </div>
    </div>
  );
}
