"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronDown, Search, Zap, MessageCircle, Star, Heart, X, UserPlus, ArrowRight, Grid3X3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import { ProfessionalCardSkeleton } from "@/app/components/ui/Skeletons";
import ProCarousel from "@/app/components/ui/ProCarousel";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

interface Professional {
  id: string;
  slug: string;
  whatsapp: string;
  avg_rating: number;
  available_now: boolean;
  plan: string;
  users: { name: string; avatar: string | null };
  categories: { name: string; icon: string; slug: string };
  professional_neighborhoods: { neighborhoods: { name: string } }[];
}

const QUICK_CATS = [
  { slug: "eletricista", name: "Eletricista", icon: "⚡" },
  { slug: "encanador", name: "Encanador", icon: "🔧" },
  { slug: "diarista", name: "Diarista", icon: "🧹" },
  { slug: "pintor", name: "Pintor", icon: "🎨" },
  { slug: "ar-condicionado", name: "Ar Condicionado", icon: "❄️" },
  { slug: "cabeleireiro", name: "Cabeleireiro", icon: "✂️" },
  { slug: "personal-trainer", name: "Personal", icon: "💪" },
  { slug: "montador-moveis", name: "Montador", icon: "🪑" },
];

export default function InicioPage() {
  const router = useRouter();
  const [neighborhood, setNeighborhood] = useState("");
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"whatsapp" | "profile" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("udihub_location");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNeighborhood(parsed.neighborhood || "");
    }
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: userData } = await supabase.from("users").select("name").eq("id", user.id).single();
      setUserName(userData?.name?.split(" ")[0] || null);
      const { data: favs } = await supabase
        .from("favorites").select("professional_id").eq("user_id", user.id);
      setFavorites(favs?.map((f) => f.professional_id) || []);
    }

    const { data } = await supabase
      .from("professionals")
      .select(`id, slug, whatsapp, avg_rating, available_now, plan,
        users(name, avatar),
        categories(name, icon, slug),
        professional_neighborhoods(neighborhoods(name))`)
      .eq("status", "active")
      .order("plan", { ascending: false })
      .order("avg_rating", { ascending: false })
      .limit(10);

    setProfessionals((data as any) || []);
    setLoading(false);
  }

  function saveLocation(n: string) {
    localStorage.setItem("udihub_location", JSON.stringify({ city: "Uberlandia", neighborhood: n }));
    setNeighborhood(n);
    setShowLocationSelect(false);
  }

  async function toggleFavorite(profId: string) {
    if (!userId) { toast.error("Faca login para favoritar"); return; }
    const supabase = createClient();
    if (favorites.includes(profId)) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("professional_id", profId);
      setFavorites((prev) => prev.filter((id) => id !== profId));
    } else {
      await supabase.from("favorites").insert({ user_id: userId, professional_id: profId });
      setFavorites((prev) => [...prev, profId]);
    }
  }

  async function handleWhatsApp(prof: Professional) {
    if (!userId) {
      setPendingAction("whatsapp");
      setShowLoginModal(true);
      return;
    }
    try {
      await fetch("/api/whatsapp-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professional_id: prof.id, city: "Uberlandia", neighborhood }),
      });
    } catch {}
    window.open(buildWhatsAppUrl(prof.whatsapp, `Ola ${prof.users?.name}! Vi seu perfil no UDIHUB.`), "_blank");
  }

  function handleProfileClick(e: React.MouseEvent) {
    if (!userId) {
      e.preventDefault();
      setPendingAction("profile");
      setShowLoginModal(true);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setShowLocationSelect(!showLocationSelect)}
            className="flex items-center gap-1.5">
            <MapPin size={14} style={{ color: "#3B82F6" }} />
            <div className="text-left">
              <div className="text-[10px] text-muted">Sua localizacao</div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                {neighborhood ? `${neighborhood}, ` : ""}Uberlandia
                <ChevronDown size={12} className="text-muted" />
              </div>
            </div>
          </button>
          <Link href="/servicos"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <Search size={14} /> Buscar
          </Link>
        </div>

        {showLocationSelect && (
          <div className="mt-2 p-3 rounded-2xl animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <select value={neighborhood} onChange={(e) => saveLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs text-foreground"
              style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none" }}>
              <option value="">Todos os bairros de Uberlandia</option>
              {uberlandia.neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="px-4 pt-5 pb-4 space-y-6">

        {/* Hero */}
        <div>
          <p className="text-xs text-muted mb-0.5">
            {userName ? `Ola, ${userName}! 👋` : "Bem-vindo ao UDIHUB 👋"}
          </p>
          <h1 className="font-syne font-extrabold text-2xl text-foreground leading-tight mb-4">
            Encontre o profissional<br />certo para voce
          </h1>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "107+", label: "Categorias", color: "#3B82F6" },
              { value: "100%", label: "Via WhatsApp", color: "#22c55e" },
              { value: "UDI", label: "Uberlandia", color: "#a855f7" },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center p-2.5 rounded-xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="font-syne font-extrabold text-base" style={{ color }}>{value}</div>
                <div className="text-[10px] text-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Busca rapida */}
        <Link href="/servicos"
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <Search size={16} className="text-muted flex-shrink-0" />
          <span className="text-sm text-muted flex-1">Buscar por servico ou profissao...</span>
          <ArrowRight size={14} className="text-muted" />
        </Link>

        {/* Categorias */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-widest text-muted">CATEGORIAS</span>
            <Link href="/servicos" className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "#3B82F6" }}>
              Ver todas 107 <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_CATS.map((cat) => (
              <Link key={cat.slug} href={`/servicos/${cat.slug}`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] text-muted leading-tight line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </div>
          <Link href="/servicos"
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", color: "#93c5fd" }}>
            <Grid3X3 size={13} /> Ver todas as 107 categorias
          </Link>
        </div>

        {/* Carrossel PRO */}
        <ProCarousel />

        {/* Profissionais em destaque */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: "#3B82F6" }} />
            <span className="text-xs font-bold tracking-widest text-muted">EM DESTAQUE</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <ProfessionalCardSkeleton key={i} />)}
            </div>
          ) : professionals.length === 0 ? (
            <div className="text-center py-10 rounded-2xl"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-syne font-bold text-foreground mb-1">Nenhum profissional ainda</p>
              <p className="text-xs text-muted mb-4">Seja o primeiro a anunciar em Uberlandia!</p>
              <Link href="/seja-profissional"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                Anunciar agora
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {professionals.map((prof) => {
                const profNeighborhood = (prof.professional_neighborhoods as any)?.[0]?.neighborhoods?.name;
                const isFav = favorites.includes(prof.id);
                const avatarUrl = (prof.users as any)?.avatar;
                return (
                  <div key={prof.id} className="rounded-2xl overflow-hidden"
                    style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                    <Link href={`/profissional/${prof.slug}`}
                      className="block p-4" onClick={handleProfileClick}>
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          {avatarUrl ? (
                            <Image src={avatarUrl} alt={(prof.users as any)?.name || ""}
                              width={56} height={56} className="w-14 h-14 rounded-xl object-cover" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center font-syne font-bold text-lg"
                              style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                              {getInitials((prof.users as any)?.name || "?")}
                            </div>
                          )}
                          {prof.available_now && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                              style={{ background: "#22c55e", borderColor: "#111113" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-syne font-bold text-sm text-foreground truncate">
                                  {(prof.users as any)?.name}
                                </h3>
                                {prof.plan === "pro" && <span className="badge-pro">PRO</span>}
                              </div>
                              <p className="text-xs text-muted">
                                {(prof.categories as any)?.icon} {(prof.categories as any)?.name}
                              </p>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); toggleFavorite(prof.id); }}
                              className="p-1.5 rounded-lg flex-shrink-0"
                              style={{ background: isFav ? "rgba(239,68,68,0.1)" : "transparent" }}>
                              <Heart size={16} fill={isFav ? "#ef4444" : "transparent"}
                                className={isFav ? "text-red-500" : "text-muted"} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            {profNeighborhood && (
                              <div className="flex items-center gap-1">
                                <MapPin size={10} className="text-muted" />
                                <span className="text-xs text-muted">{profNeighborhood}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Star size={10} fill="#FBBF24" className="star-filled" />
                              <span className="text-xs text-muted">
                                {prof.avg_rating > 0 ? Number(prof.avg_rating).toFixed(1) : "Novo"}
                              </span>
                            </div>
                            {prof.available_now && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                                Disponivel
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                      <Link href={`/profissional/${prof.slug}`}
                        onClick={handleProfileClick}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
                        Ver perfil
                      </Link>
                      <button onClick={() => handleWhatsApp(prof)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                        <MessageCircle size={13} /> WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}

              <Link href="/servicos"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: "#111113", border: "1px solid #1F1F23", color: "#A1A1AA" }}>
                Ver todos os profissionais <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Banner seja profissional */}
        <div className="relative p-5 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0F1729, #1a2f5a)", border: "1px solid #3B82F6" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
          <p className="text-xs font-bold mb-1" style={{ color: "#93c5fd" }}>E profissional autonomo?</p>
          <h3 className="font-syne font-extrabold text-lg text-white mb-1">
            Receba clientes no seu WhatsApp
          </h3>
          <p className="text-xs text-muted mb-4 leading-relaxed">
            Crie seu perfil e apareca nas buscas de clientes de Uberlandia por apenas R$69/mes.
          </p>
          <Link href="/seja-profissional"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.3)" }}>
            Anunciar agora <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* Modal Login */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <button onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <UserPlus size={26} style={{ color: "#3B82F6" }} />
              </div>
            </div>
            <h3 className="font-syne font-bold text-xl text-foreground text-center mb-2">
              {pendingAction === "whatsapp" ? "Entre para falar com o profissional" : "Entre para ver o perfil completo"}
            </h3>
            <p className="text-sm text-muted text-center mb-6 leading-relaxed">
              O UDIHUB e para clientes. Crie sua conta em menos de 1 minuto.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/cadastro"
                className="w-full py-4 rounded-2xl font-bold text-base text-white text-center"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
                Criar conta
              </Link>
              <Link href="/login"
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-center"
                style={{ background: "#09090B", border: "1px solid #1F1F23", color: "#94a3b8" }}>
                Ja tenho conta — Entrar
              </Link>
            </div>
            <p className="text-center text-[10px] text-muted mt-4">
              Sem fidelidade · Cancele quando quiser
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
