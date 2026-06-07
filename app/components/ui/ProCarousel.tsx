"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MessageCircle, Star, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";

interface ProProf {
  id: string;
  slug: string;
  whatsapp: string;
  avg_rating: number;
  available_now: boolean;
  instagram?: string;
  users: { name: string; avatar: string | null };
  categories: { name: string; icon: string };
  professional_neighborhoods: { neighborhoods: { name: string } }[];
}

export default function ProCarousel() {
  const [professionals, setProfessionals] = useState<ProProf[]>([]);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Verifica se carrossel está ativo
      const { data: setting } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "pro_carousel_active")
        .single();

      if (setting?.value !== "true") { setLoading(false); return; }
      setActive(true);

      // Busca profissionais PRO ativos
      const { data } = await supabase
        .from("professionals")
        .select(`id, slug, whatsapp, avg_rating, available_now, instagram,
          users(name, avatar),
          categories(name, icon),
          professional_neighborhoods(neighborhoods(name))`)
        .eq("status", "active")
        .eq("plan", "pro")
        .order("avg_rating", { ascending: false })
        .limit(10);

      setProfessionals((data as any) || []);
      setLoading(false);
    }
    load();
  }, []);

  // Auto-play
  useEffect(() => {
    if (professionals.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % professionals.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [professionals.length]);

  function prev() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrent((p) => (p - 1 + professionals.length) % professionals.length);
  }

  function next() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrent((p) => (p + 1) % professionals.length);
  }

  if (loading || !active || professionals.length === 0) return null;

  const prof = professionals[current];
  const neighborhood = (prof.professional_neighborhoods as any)?.[0]?.neighborhoods?.name;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown size={14} style={{ color: "#FBBF24" }} />
          <span className="text-xs font-bold tracking-widest text-muted">PROFISSIONAIS PRO</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted">{current + 1}/{professionals.length}</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #0F1729, #1a2f5a)", border: "2px solid rgba(59,130,246,0.4)", boxShadow: "0 0 30px rgba(59,130,246,0.1)" }}>

        {/* Badge PRO */}
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold"
            style={{ background: "rgba(251,191,36,0.2)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.4)" }}>
            <Crown size={9} /> PRO
          </span>
        </div>

        {/* Disponível */}
        {prof.available_now && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Disponível
          </div>
        )}

        <Link href={`/profissional/${prof.slug}`} className="block p-5 pt-10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {(prof.users as any)?.avatar ? (
                <img src={(prof.users as any).avatar} alt={(prof.users as any).name}
                  className="w-20 h-20 rounded-2xl object-cover"
                  style={{ border: "2px solid rgba(59,130,246,0.5)" }} />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl"
                  style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                  {getInitials((prof.users as any)?.name || "?")}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-syne font-bold text-base text-white truncate mb-0.5">
                {(prof.users as any)?.name}
              </h3>
              <p className="text-sm mb-1" style={{ color: "#93c5fd" }}>
                {(prof.categories as any)?.icon} {(prof.categories as any)?.name}
              </p>
              <div className="flex items-center gap-3">
                {prof.avg_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={11} fill="#FBBF24" style={{ color: "#FBBF24" }} />
                    <span className="text-xs text-white font-semibold">{Number(prof.avg_rating).toFixed(1)}</span>
                  </div>
                )}
                {neighborhood && (
                  <span className="text-xs text-muted truncate">{neighborhood}</span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Botão WhatsApp */}
        <div className="px-5 pb-5">
          <button onClick={() => window.open(buildWhatsAppUrl(prof.whatsapp, `Olá ${(prof.users as any)?.name}! Vi seu perfil em destaque no UDIHUB.`), "_blank")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 16px rgba(22,163,74,0.3)" }}>
            <MessageCircle size={15} /> Chamar no WhatsApp
          </button>
        </div>

        {/* Navegação */}
        {professionals.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(9,9,11,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <ChevronLeft size={16} style={{ color: "#A1A1AA" }} />
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: "rgba(9,9,11,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <ChevronRight size={16} style={{ color: "#A1A1AA" }} />
            </button>
          </>
        )}

        {/* Dots */}
        {professionals.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {professionals.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === current ? 16 : 6, height: 6, background: i === current ? "#3B82F6" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
