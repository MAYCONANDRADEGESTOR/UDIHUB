"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ChevronDown, Search, Heart, X, UserPlus, ArrowRight, Grid3X3, MessageCircle, CheckCircle, Zap, Sparkles, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import ProCarousel from "@/app/components/ui/ProCarousel";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

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

const PROFISSIONAL_BENEFITS = [
  { icon: Search, text: "Apareça nas buscas por categoria e bairro" },
  { icon: MessageCircle, text: "Cliente chama direto no seu WhatsApp" },
  { icon: CheckCircle, text: "Comece de graça, sem cartão de crédito" },
];

const STATS = [
  { icon: Grid3X3, value: "108+", label: "Categorias", color: "#3B82F6" },
  { icon: MessageCircle, value: "100%", label: "Via WhatsApp", color: "#22c55e" },
  { icon: MapPin, value: "UDI", label: "Uberlândia", color: "#a855f7" },
];

export default function InicioPage() {
  const router = useRouter();
  const [neighborhood, setNeighborhood] = useState("");
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"whatsapp" | "profile" | null>(null);
  const [recentPros, setRecentPros] = useState<any[]>([]);
  const [recentCount, setRecentCount] = useState(0);
  const [disponiveisAgora, setDisponiveisAgora] = useState(0);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("udihub_location");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNeighborhood(parsed.neighborhood || "");
    }
    loadUser();
    loadDynamicData();
  }, []);

  async function loadUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: userData } = await supabase.from("users").select("name").eq("id", user.id).single();
      setUserName(userData?.name?.split(" ")[0] || null);
    }
  }

  async function loadDynamicData() {
    const supabase = createClient();

    // Últimos 8 profissionais cadastrados
    const { data: recent } = await supabase
      .from("professionals")
      .select("id, slug, avatar, created_at, users(name), categories(name, icon)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);
    if (recent) setRecentPros(recent);

    // Contagem últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: weekCount } = await supabase
      .from("professionals")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gte("created_at", sevenDaysAgo.toISOString());
    if (weekCount) setRecentCount(weekCount);

    // Disponíveis agora
    const { count: dispCount } = await supabase
      .from("professionals")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("available_now", true);
    if (dispCount) setDisponiveisAgora(dispCount);

    // Avaliações recentes 5 estrelas
    const { data: reviews } = await supabase
      .from("reviews")
      .select(`
        id, rating, comment, created_at,
        users(name),
        professionals(
          slug,
          users(name),
          categories(name, icon)
        )
      `)
      .eq("rating", 5)
      .order("created_at", { ascending: false })
      .limit(5);
    if (reviews && reviews.length > 0) setRecentReviews(reviews);
  }

  function saveLocation(n: string) {
    localStorage.setItem("udihub_location", JSON.stringify({ city: "Uberlandia", neighborhood: n }));
    setNeighborhood(n);
    setShowLocationSelect(false);
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
              <div className="text-[10px] text-muted">Sua localização</div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                {neighborhood ? `${neighborhood}, ` : ""}Uberlândia
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
              <option value="">Todos os bairros de Uberlândia</option>
              {uberlandia.neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="px-4 pt-5 pb-4 space-y-6">

        {/* Hero */}
        <div>
          <p className="text-xs text-muted mb-1">
            {userName ? `Olá, ${userName}! 👋` : "Bem-vindo ao UDIHUB 👋"}
          </p>
          <h1 className="font-syne font-bold text-2xl text-foreground leading-tight mb-4">
            Encontre o profissional{" "}
            <span style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #60a5fa 50%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              certo
            </span>{" "}
            para você
          </h1>
          <div className="grid grid-cols-3 gap-2">
            {STATS.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="text-center p-3 rounded-xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                  style={{ background: `${color}15` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div className="font-syne font-extrabold text-base" style={{ color }}>{value}</div>
                <div className="text-[10px] text-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de urgência — disponíveis agora */}
        {disponiveisAgora > 0 && (
          <Link href="/servicos"
            className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl w-full"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold" style={{ color: "#22c55e" }}>
              {disponiveisAgora} profissionais disponíveis agora para te atender
            </span>
            <ArrowRight size={12} style={{ color: "#22c55e" }} />
          </Link>
        )}

        {/* Busca rapida */}
        <Link href="/servicos"
          className="flex items-center gap-3 px-4 py-3.5 rounded-full w-full"
          style={{ background: "#111113", border: "1px solid rgba(59,130,246,0.25)", boxShadow: "0 0 16px rgba(59,130,246,0.08)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(59,130,246,0.12)" }}>
            <Search size={13} style={{ color: "#3B82F6" }} />
          </div>
          <span className="text-sm text-muted flex-1">Buscar por serviço ou profissão...</span>
          <ArrowRight size={14} className="text-muted" />
        </Link>

        {/* Categorias */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-widest text-muted">CATEGORIAS</span>
            <Link href="/servicos" className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "#3B82F6" }}>
              Ver todas 108 <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_CATS.map((cat) => (
              <Link key={cat.slug} href={`/servicos/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center transition-colors"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.1)" }}>
                  <span className="text-lg">{cat.icon}</span>
                </div>
                <span className="text-[10px] text-muted leading-tight line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </div>
          <Link href="/servicos"
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", color: "#93c5fd" }}>
            <Grid3X3 size={13} /> Ver todas as 108 categorias
          </Link>
        </div>

        {/* Carrossel de profissionais em destaque */}
        <ProCarousel userId={userId} onLoginRequired={() => {
          setPendingAction("whatsapp");
          setShowLoginModal(true);
        }} />

        {/* Novos na plataforma */}
        {recentPros.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={13} style={{ color: "#a855f7" }} />
                <span className="text-xs font-bold tracking-widest text-muted">NOVOS NA PLATAFORMA</span>
              </div>
              {recentCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                  +{recentCount} essa semana
                </span>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {recentPros.map((pro) => (
                <Link key={pro.id} href={`/profissional/${pro.slug}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl w-[72px]"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  {pro.avatar ? (
                    <img src={pro.avatar} alt={pro.users?.name}
                      className="w-11 h-11 rounded-full object-cover"
                      style={{ border: "2px solid rgba(168,85,247,0.3)" }} />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#2d1b69,#7c3aed)", color: "#c4b5fd", border: "2px solid rgba(168,85,247,0.3)" }}>
                      {getInitials(pro.users?.name || "?")}
                    </div>
                  )}
                  <div className="text-center w-full">
                    <div className="text-[10px] font-semibold text-foreground leading-tight truncate">
                      {pro.users?.name?.split(" ")[0]}
                    </div>
                    <div className="text-[9px] text-muted mt-0.5 truncate">
                      {pro.categories?.icon} {pro.categories?.name?.split("/")[0].trim()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-2 text-center">
              Seu serviço também pode estar aqui —{" "}
              <Link href="/seja-profissional" className="font-semibold" style={{ color: "#a855f7" }}>
                cadastro grátis
              </Link>
            </p>
          </div>
        )}

        {/* O que dizem os clientes — aparece automaticamente quando houver avaliações */}
        {recentReviews.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} fill="#FBBF24" className="text-yellow-400" />
              <span className="text-xs font-bold tracking-widest text-muted">O QUE DIZEM OS CLIENTES</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {recentReviews.map((review) => (
                <Link key={review.id}
                  href={`/profissional/${review.professionals?.slug}`}
                  className="flex-shrink-0 p-3 rounded-2xl w-56"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={10} fill="#FBBF24" className="text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed mb-2 line-clamp-2">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}>
                      {getInitials(review.users?.name || "?")}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-foreground">
                        {review.users?.name?.split(" ")[0]}
                      </span>
                      <span className="text-[9px] text-muted"> para </span>
                      <span className="text-[10px] font-semibold" style={{ color: "#60a5fa" }}>
                        {review.professionals?.categories?.icon} {review.professionals?.users?.name?.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Banner seja profissional */}
        <div className="relative p-5 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0F1729, #1a2f5a)", border: "1px solid #3B82F6" }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />

          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.15)" }}>
              <Zap size={14} style={{ color: "#22c55e" }} />
            </div>
            <p className="text-[10px] font-bold tracking-wide" style={{ color: "#93c5fd" }}>
              É PROFISSIONAL AUTÔNOMO? CADASTRO GRATUITO
            </p>
          </div>

          <h3 className="font-syne font-bold text-lg text-white mb-1">
            Receba clientes no seu WhatsApp
          </h3>
          <p className="text-xs text-muted mb-4 leading-relaxed">
            Crie seu perfil e apareça nas buscas de clientes de Uberlândia sem pagar nada. Quer destaque e clientes ilimitados? Assine a partir de R$59,90/mês quando quiser.
          </p>

          <div className="flex flex-col gap-2 mb-4">
            {PROFISSIONAL_BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <Icon size={13} style={{ color: "#60a5fa" }} className="flex-shrink-0" />
                <span className="text-[11px] text-muted leading-tight">{text}</span>
              </div>
            ))}
          </div>

          <Link href="/seja-profissional"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.3)" }}>
            Criar perfil grátis <ArrowRight size={14} />
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
              O UDIHUB é para clientes. Crie sua conta em menos de 1 minuto.
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
                Já tenho conta — Entrar
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
