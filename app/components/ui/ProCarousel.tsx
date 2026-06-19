"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Star, MapPin, ChevronLeft, ChevronRight, Zap, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";

interface Prof {
  id: string;
  slug: string;
  whatsapp: string;
  avg_rating: number;
  available_now: boolean;
  plan: string;
  users: { name: string; avatar: string | null };
  categories: { name: string; icon: string };
  professional_neighborhoods: { neighborhoods: { name: string } }[];
}

// Planos pagos reais ordenados por prioridade de destaque no carrossel.
// "pro" e "basic" mantidos como legado, por segurança.
const PLAN_RANK: Record<string, number> = {
  professional_annual: 3,
  professional: 2,
  pro: 2,
  basic: 1,
  free: 0,
};

const ROTATE_MS = 4000;

export default function ProCarousel({ userId, onLoginRequired }: { userId?: string | null; onLoginRequired?: () => void } = {}) {
  const [professionals, setProfessionals] = useState<Prof[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("professionals")
        .select(`id, slug, whatsapp, avg_rating, available_now, plan,
          users(name, avatar),
          categories(name, icon),
          professional_neighborhoods(neighborhoods(name))`)
        .eq("status", "active")
        .order("avg_rating", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      // Reordena no JS por prioridade de plano (Anual > Profissional/Pro > Básico > Gratuito),
      // já que ordenar por "plan" no banco é alfabético e não reflete a hierarquia real dos planos.
      const sorted = ((data as any) || []).sort((a: Prof, b: Prof) => {
        const rankA = PLAN_RANK[a.plan] ?? 0;
        const rankB = PLAN_RANK[b.plan] ?? 0;
        return rankB - rankA;
      });

      setProfessionals(sorted);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!autoplay || professionals.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % professionals.length);
    }, ROTATE_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [professionals.length, autoplay]);

  function stopAutoplay() {
    setAutoplay(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function prev() {
    stopAutoplay();
    setCurrent((p) => (p - 1 + professionals.length) % professionals.length);
  }

  function next() {
    stopAutoplay();
    setCurrent((p) => (p + 1) % professionals.length);
  }

  if (loading || professionals.length === 0) return null;

  const prof = professionals[current];
  const neighborhood = (prof.professional_neighborhoods as any)?.[0]?.neighborhoods?.name;
  // Planos pagos reais: professional, professional_annual (e "pro" legado, por segurança).
  const isPro = prof.plan === "professional" || prof.plan === "professional_annual" || prof.plan === "pro";
  const planBadgeLabel = prof.plan === "professional_annual" ? "ANUAL" : "PRO";

  return (
    <div>
      <style>{`
        @keyframes udihub-carousel-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: "#3B82F6" }} />
          <span className="text-xs font-bold tracking-widest text-muted">EM DESTAQUE</span>
        </div>
        <span className="text-[10px] text-muted">{current + 1}/{professionals.length}</span>
      </div>

      {/* Barra de progresso estilo stories — substitui os pontinhos, escala bem com qualquer quantidade */}
      {professionals.length > 1 && (
        <div className="h-[3px] rounded-full overflow-hidden mb-3" style={{ background: "#1F1F23" }}>
          {autoplay ? (
            <div key={current} className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #3B82F6, #60a5fa)",
                width: "0%",
                animation: `udihub-carousel-progress ${ROTATE_MS}ms linear forwards`,
              }} />
          ) : (
            <div className="h-full rounded-full transition-all duration-300"
              style={{ background: "#3B82F6", width: `${((current + 1) / professionals.length) * 100}%` }} />
          )}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl"
        style={{
          background: isPro ? "linear-gradient(135deg, #0F1729, #1a2f5a)" : "#111113",
          border: isPro ? "2px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
          boxShadow: isPro ? "0 0 30px rgba(59,130,246,0.1)" : "none"
        }}>

        {/* Zona de cima: avatar, info e setas — isolada da zona do botão abaixo,
            pra setas nunca ficarem perto o suficiente do WhatsApp pra causar clique acidental */}
        <div className="relative">

          {/* Badge plano pago */}
          {isPro && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(251,191,36,0.2)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.4)" }}>
              <Crown size={10} /> {planBadgeLabel}
            </div>
          )}

          {/* Disponível */}
          {prof.available_now && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Disponivel
            </div>
          )}

          <Link href={`/profissional/${prof.slug}`} className="block p-5 pt-10">
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {(prof.users as any)?.avatar ? (
                  <img src={(prof.users as any).avatar} alt={(prof.users as any).name}
                    className="w-20 h-20 rounded-2xl object-cover"
                    style={{
                      border: isPro ? "2px solid rgba(251,191,36,0.6)" : "1px solid #1F1F23",
                      boxShadow: isPro ? "0 0 14px rgba(251,191,36,0.25)" : "none",
                    }} />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl"
                    style={{
                      background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                      color: "#93c5fd",
                      border: isPro ? "2px solid rgba(251,191,36,0.6)" : "none",
                      boxShadow: isPro ? "0 0 14px rgba(251,191,36,0.25)" : "none",
                    }}>
                    {getInitials((prof.users as any)?.name || "?")}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-syne font-bold text-base truncate mb-0.5"
                  style={{ color: isPro ? "#ffffff" : "#FAFAFA" }}>
                  {(prof.users as any)?.name}
                </h3>
                <p className="text-sm mb-1" style={{ color: isPro ? "#93c5fd" : "#A1A1AA" }}>
                  {(prof.categories as any)?.icon} {(prof.categories as any)?.name}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star size={11} fill="#FBBF24" style={{ color: "#FBBF24" }} />
                    <span className="text-xs font-semibold" style={{ color: isPro ? "#ffffff" : "#FAFAFA" }}>
                      {prof.avg_rating > 0 ? Number(prof.avg_rating).toFixed(1) : "Novo"}
                    </span>
                  </div>
                  {neighborhood && (
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-muted" />
                      <span className="text-xs text-muted truncate">{neighborhood}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {/* Navegação — confinada a esta zona de cima (relative pai termina aqui) */}
          {professionals.length > 1 && (
            <>
              <button onClick={prev} aria-label="Profissional anterior"
                className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(9,9,11,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <ChevronLeft size={16} style={{ color: "#A1A1AA" }} />
              </button>
              <button onClick={next} aria-label="Próximo profissional"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(9,9,11,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <ChevronRight size={16} style={{ color: "#A1A1AA" }} />
              </button>
            </>
          )}
        </div>

        {/* Divisor sutil separando a zona de navegação da zona de ação */}
        <div className="mx-5" style={{ borderTop: `1px solid ${isPro ? "rgba(59,130,246,0.15)" : "#1F1F23"}` }} />

        <div className="px-5 pt-3 pb-4">
          <button onClick={() => window.open(buildWhatsAppUrl(prof.whatsapp, `Ola ${(prof.users as any)?.name}! Vi seu perfil no UDIHUB.`), "_blank")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white active:scale-[0.98] transition-transform"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 16px rgba(22,163,74,0.3)" }}>
            <MessageCircle size={15} /> Chamar no WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
