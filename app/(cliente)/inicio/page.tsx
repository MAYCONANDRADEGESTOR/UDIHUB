"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Search, X, UserPlus, ArrowRight, MessageCircle, CheckCircle, Zap, ChevronRight, Star, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/lib/constants";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

const QUICK_CATS = [
  { slug: "eletricista", name: "Eletricista", icon: "⚡", color: "#FBBF24" },
  { slug: "encanador", name: "Encanador", icon: "🔧", color: "#3B82F6" },
  { slug: "diarista", name: "Diarista", icon: "🧹", color: "#22c55e" },
  { slug: "pintor", name: "Pintor", icon: "🎨", color: "#a855f7" },
  { slug: "ar-condicionado", name: "Ar condicionado", icon: "❄️", color: "#06b6d4" },
  { slug: "cabeleireiro", name: "Cabeleireiro", icon: "✂️", color: "#f43f5e" },
  { slug: "personal-trainer", name: "Personal", icon: "💪", color: "#f97316" },
  { slug: "montador-moveis", name: "Montador", icon: "🪑", color: "#8b5cf6" },
  { slug: "pedreiro", name: "Pedreiro", icon: "🧱", color: "#84cc16" },
  { slug: "marceneiro", name: "Marceneiro", icon: "🪵", color: "#f59e0b" },
];

const PROFISSIONAL_BENEFITS = [
  { icon: Search, text: "Apareça nas buscas por categoria e bairro" },
  { icon: MessageCircle, text: "Cliente chama direto no seu WhatsApp" },
  { icon: CheckCircle, text: "Comece de graça, sem cartão de crédito" },
];

const PLAN_RANK: Record<string, number> = {
  professional_annual: 3,
  professional: 2,
  pro: 2,
  basic: 1,
  free: 0,
};

interface Prof {
  id: string;
  slug: string;
  whatsapp: string;
  avg_rating: number;
  available_now: boolean;
  plan: string;
  users: { name: string; avatar: string | null };
  categories: { name: string; icon: string };
}

export default function InicioPage() {
  const router = useRouter();
  const [neighborhood, setNeighborhood] = useState("");
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"whatsapp" | "profile" | null>(null);
  const [professionals, setProfessionals] = useState<Prof[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("udihub_location");
    if (saved) setNeighborhood(JSON.parse(saved).neighborhood || "");
    loadUser();
    loadProfessionals();
  }, []);

  async function loadUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data } = await supabase.from("users").select("name").eq("id", user.id).single();
      setUserName(data?.name?.split(" ")[0] || null);
    }
  }

  async function loadProfessionals() {
    const supabase = createClient();
    const { data } = await supabase
      .from("professionals")
      .select(`id, slug, whatsapp, avg_rating, available_now, plan,
        users(name, avatar),
        categories(name, icon)`)
      .eq("status", "active")
      .order("avg_rating", { ascending: false })
      .limit(50);

    const sorted = ((data as any) || []).sort((a: Prof, b: Prof) => {
      return (PLAN_RANK[b.plan] ?? 0) - (PLAN_RANK[a.plan] ?? 0);
    });
    setProfessionals(sorted);
  }

  function saveLocation(n: string) {
    localStorage.setItem("udihub_location", JSON.stringify({ city: "Uberlandia", neighborhood: n }));
    setNeighborhood(n);
    setShowLocationSelect(false);
  }

  function handleWhatsApp(pro: Prof, e: React.MouseEvent) {
    e.preventDefault();
    if (!userId) {
      setPendingAction("whatsapp");
      setShowLoginModal(true);
      return;
    }
    window.open(buildWhatsAppUrl(pro.whatsapp, `Olá ${(pro.users as any)?.name}! Vi seu perfil no UDIHUB.`), "_blank");
  }

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* HEADER */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.97)", backdropFilter: "blur(24px)", borderBottom: "1px solid #1a1a1e" }}>
        <div className="flex items-center justify-between">
          <button onClick={() => setShowLocationSelect(!showLocationSelect)}
            className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.12)" }}>
              <MapPin size={13} style={{ color: "#3B82F6" }} />
            </div>
            <div className="text-left">
              <div className="text-[9px] text-muted uppercase tracking-wider">Localização</div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                {neighborhood || "Uberlândia"}
                <ChevronDown size={11} className="text-muted" />
              </div>
            </div>
          </button>
          <Link href="/servicos"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "#111113", border: "1px solid #1F1F23", color: "#94a3b8" }}>
            <Search size={13} /> Buscar
          </Link>
        </div>

        {showLocationSelect && (
          <div className="mt-3 p-3 rounded-2xl"
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

      {/* HERO */}
      <div className="relative px-4 pt-7 pb-10 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0b111e 0%, #09090B 100%)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 320, height: 120, background: "radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative z-10">
          <p className="text-xs mb-3" style={{ color: "#475569" }}>
            {userName ? `Olá, ${userName} 👋` : "Bem-vindo ao UDIHUB 👋"}
          </p>
          <h1 className="font-syne font-bold leading-tight mb-7"
            style={{ fontSize: 28, color: "#f8fafc", letterSpacing: "-0.3px" }}>
            Encontre o profissional{" "}
            <span style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              certo
            </span>{" "}
            para você
          </h1>

          <Link href="/servicos"
            className="flex items-center gap-3 px-5 py-4 rounded-2xl w-full"
            style={{
              background: "#111113",
              border: "1px solid rgba(59,130,246,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}>
            <Search size={16} style={{ color: "#3B82F6", flexShrink: 0 }} />
            <span className="text-sm flex-1" style={{ color: "#475569" }}>
              Qual serviço você precisa?
            </span>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.15)" }}>
              <ArrowRight size={13} style={{ color: "#3B82F6" }} />
            </div>
          </Link>
        </div>
      </div>

      {/* CATEGORIAS */}
      <div className="mt-6 mb-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <div>
            <h2 className="font-syne font-bold text-sm text-foreground">Categorias</h2>
            <p className="text-[10px] text-muted mt-0.5">108 serviços disponíveis</p>
          </div>
          <Link href="/servicos"
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "#3B82F6" }}>
            Ver todas <ChevronRight size={12} />
          </Link>
        </div>

        <div className="flex gap-3 px-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {QUICK_CATS.map((cat) => (
            <Link key={cat.slug} href={`/servicos/${cat.slug}`}
              className="flex-shrink-0 flex flex-col items-center gap-2.5 p-3 rounded-2xl"
              style={{ background: "#111113", border: "1px solid #1a1a1e", width: 82, minHeight: 90 }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${cat.color}14` }}>
                <span style={{ fontSize: 22 }}>{cat.icon}</span>
              </div>
              <span className="text-center leading-tight font-medium"
                style={{ fontSize: 10, color: "#94a3b8", maxWidth: 68 }}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* EM DESTAQUE — cards deslizáveis manualmente com snap */}
      {professionals.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between px-4 mb-4">
            <div>
              <h2 className="font-syne font-bold text-sm text-foreground">Em destaque</h2>
              <p className="text-[10px] text-muted mt-0.5">Deslize para ver mais</p>
            </div>
            <Link href="/servicos"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "#3B82F6" }}>
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>

          <div
            className="flex gap-4 px-4 overflow-x-auto pb-3"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}>
            {professionals.map((pro, i) => {
              const isPro = pro.plan === "professional" || pro.plan === "professional_annual" || pro.plan === "pro";
              const planLabel = pro.plan === "professional_annual" ? "ANUAL" : "PRO";
              const avatar = (pro.users as any)?.avatar;
              const name = (pro.users as any)?.name;
              const cat = pro.categories as any;

              return (
                <div key={pro.id}
                  className="flex-shrink-0 rounded-2xl overflow-hidden"
                  style={{
                    width: 260,
                    scrollSnapAlign: "start",
                    background: isPro
                      ? "linear-gradient(135deg, #0F1729, #1a2f5a)"
                      : "#111113",
                    border: isPro
                      ? "1.5px solid rgba(59,130,246,0.4)"
                      : "1px solid #1a1a1e",
                    boxShadow: isPro ? "0 0 20px rgba(59,130,246,0.08)" : "none",
                  }}>

                  <Link href={`/profissional/${pro.slug}`} className="block p-4">
                    {/* Badges topo */}
                    <div className="flex items-center justify-between mb-3">
                      {pro.available_now ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-bold" style={{ color: "#22c55e" }}>Disponível</span>
                        </div>
                      ) : <div />}
                      {isPro && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
                          <Crown size={10} style={{ color: "#FBBF24" }} />
                          <span className="text-[10px] font-bold" style={{ color: "#FBBF24" }}>{planLabel}</span>
                        </div>
                      )}
                    </div>

                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 mb-4">
                      {avatar ? (
                        <img src={avatar} alt={name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          style={{ border: isPro ? "2px solid rgba(251,191,36,0.5)" : "1px solid #1F1F23" }} />
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center font-syne font-bold text-xl flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", color: "#93c5fd" }}>
                          {getInitials(name || "?")}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-syne font-bold text-base leading-tight mb-0.5 truncate"
                          style={{ color: isPro ? "#ffffff" : "#f1f5f9" }}>
                          {name}
                        </div>
                        <div className="text-xs truncate mb-1.5"
                          style={{ color: isPro ? "#93c5fd" : "#64748b" }}>
                          {cat?.icon} {cat?.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={12} fill="#FBBF24" style={{ color: "#FBBF24" }} />
                          <span className="text-xs font-semibold"
                            style={{ color: isPro ? "#f8fafc" : "#94a3b8" }}>
                            {pro.avg_rating > 0 ? Number(pro.avg_rating).toFixed(1) : "Novo"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Botão WhatsApp */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => handleWhatsApp(pro, e)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                      style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                      <MessageCircle size={15} /> Chamar no WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BANNER SEJA PROFISSIONAL */}
      <div className="px-4 mb-8">
        <div className="relative rounded-2xl overflow-hidden p-5"
          style={{ background: "linear-gradient(135deg, #0F1729 0%, #162040 100%)", border: "1px solid rgba(59,130,246,0.25)" }}>
          <div className="absolute top-0 right-0 pointer-events-none"
            style={{ width: 140, height: 140, background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.15)" }}>
                <Zap size={12} style={{ color: "#22c55e" }} />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "#60a5fa" }}>
                É profissional autônomo?
              </span>
            </div>

            <h3 className="font-syne font-bold text-lg text-white mb-1.5">
              Receba clientes no WhatsApp
            </h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#64748b" }}>
              Crie seu perfil grátis e apareça para clientes de Uberlândia. Clientes chamam direto, sem comissão.
            </p>

            <div className="flex flex-col gap-2 mb-5">
              {PROFISSIONAL_BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon size={12} style={{ color: "#60a5fa", flexShrink: 0 }} />
                  <span className="text-[11px]" style={{ color: "#64748b" }}>{text}</span>
                </div>
              ))}
            </div>

            <Link href="/seja-profissional"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.25)" }}>
              Criar perfil grátis <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <button onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-muted"><X size={18} /></button>
            <div className="flex justify-center mb-5">
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
            <p className="text-center text-[10px] text-muted mt-4">Sem fidelidade · Cancele quando quiser</p>
          </div>
        </div>
      )}

    </div>
  );
}
