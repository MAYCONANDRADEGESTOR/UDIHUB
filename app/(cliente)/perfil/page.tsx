"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, LogOut, Star, Heart, Settings,
  ChevronRight, Shield, HelpCircle, Instagram,
  Loader2, Camera, AlertCircle,
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
  phone?: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hasProfessionalPhoto, setHasProfessionalPhoto] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: userData } = await supabase
        .from("users")
        .select("name, email, role, neighborhood, city, phone")
        .eq("id", user.id)
        .single();

      if (userData) {
        setProfile(userData);
        if (userData.role === "professional") {
          const { data: prof } = await supabase
            .from("professionals")
            .select("id, professional_photos(id)")
            .eq("user_id", user.id)
            .single();
          setHasProfessionalPhoto(
            ((prof?.professional_photos as any[])?.length || 0) > 0
          );
        }
      } else {
        // Cria perfil automaticamente para login Google
        const name = user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] || "Usuário";
        await supabase.from("users").upsert({
          id: user.id,
          email: user.email!,
          name,
          role: "client",
          banned: false,
        }, { onConflict: "id" });
        setProfile({ name, email: user.email || "", role: "client" });
      }
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
    { icon: User, label: "Editar perfil", href: "/perfil/editar", desc: "Nome, telefone e bairro" },
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
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-syne font-bold text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
            {getInitials(profile?.name || "?")}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-syne font-bold text-lg text-foreground truncate">{profile?.name}</h2>
            <p className="text-xs text-muted truncate">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
                {profile?.role === "professional" ? "Profissional" : profile?.role === "admin" ? "Admin" : "Cliente"}
              </span>
              {profile?.neighborhood && (
                <>
                  <span className="text-muted text-xs">·</span>
                  <span className="text-xs text-muted">{profile.neighborhood}</span>
                </>
              )}
              {profile?.phone && (
                <>
                  <span className="text-muted text-xs">·</span>
                  <span className="text-xs text-muted">{profile.phone}</span>
                </>
              )}
            </div>
          </div>
          <Link href="/perfil/editar"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3B82F6" }}>
            Editar
          </Link>
        </div>

        {/* Aviso foto profissional */}
        {profile?.role === "professional" && !hasProfessionalPhoto && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-4"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <AlertCircle size={16} style={{ color: "#FBBF24" }} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#FBBF24" }}>Adicione uma foto ao perfil</p>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">
                Profissionais com foto recebem até 3x mais contatos. Transmita mais confiança aos clientes.
              </p>
              <Link href="/painel/fotos"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold"
                style={{ color: "#FBBF24" }}>
                <Camera size={12} /> Adicionar foto agora →
              </Link>
            </div>
          </div>
        )}

        {/* Admin CTA */}
        {profile?.role === "admin" && (
          <Link href="/admin"
            className="flex items-center gap-3 p-4 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.15)" }}>
              <span className="text-xl">🛡️</span>
            </div>
            <div className="flex-1">
              <p className="font-syne font-bold text-sm text-white">Painel Admin</p>
              <p className="text-xs mt-0.5" style={{ color: "#93c5fd" }}>Gerenciar usuários e métricas</p>
            </div>
            <ChevronRight size={16} style={{ color: "#3B82F6" }} />
          </Link>
        )}

        {/* Cliente CTA */}
        {profile?.role === "client" && (
          <Link href="/seja-profissional"
            className="flex items-center gap-3 p-4 rounded-2xl mb-4"
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

        {/* Profissional CTA */}
        {profile?.role === "professional" && (
          <Link href="/painel"
            className="flex items-center gap-3 p-4 rounded-2xl mb-4"
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

        <div className="mt-6 flex items-center justify-center gap-4">
          <a href="https://www.instagram.com/udihub" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted">
            <Instagram size={14} /> @udihub
          </a>
        </div>

        <button onClick={handleLogout} disabled={loggingOut}
          className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
          {loggingOut ? "Saindo..." : "Sair da conta"}
        </button>

        <p className="text-center text-[10px] text-muted mt-6">UDIHUB v1.0 · Uberlândia, MG</p>
      </div>
    </div>
  );
}
