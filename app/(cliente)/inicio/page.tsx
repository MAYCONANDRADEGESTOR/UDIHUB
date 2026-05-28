"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Search, Zap, MessageCircle, Star, Heart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import { ProfessionalCardSkeleton } from "@/app/components/ui/Skeletons";
import toast from "react-hot-toast";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

interface Professional {
  id: string;
  slug: string;
  whatsapp: string;
  avg_rating: number;
  available_now: boolean;
  plan: string;
  users: { name: string };
  categories: { name: string; icon: string; slug: string };
  professional_neighborhoods: { neighborhoods: { name: string } }[];
}

export default function InicioPage() {
  const [city, setCity] = useState("Uberlândia");
  const [neighborhood, setNeighborhood] = useState("");
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const QUICK_CATS = CATEGORIES.slice(0, 6);

  useEffect(() => {
    const saved = localStorage.getItem("udihub_location");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCity(parsed.city || "Uberlândia");
      setNeighborhood(parsed.neighborhood || "");
    }
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: favs } = await supabase
        .from("favorites").select("professional_id").eq("user_id", user.id);
      setFavorites(favs?.map((f) => f.professional_id) || []);
    }

    const { data } = await supabase
      .from("professionals")
      .select(`id, slug, whatsapp, avg_rating, available_now, plan,
        users(name), categories(name, icon, slug),
        professional_neighborhoods(neighborhoods(name))`)
      .eq("status", "active")
      .order("plan", { ascending: false })
      .order("avg_rating", { ascending: false })
      .limit(10);

    setProfessionals((data as any) || []);
    setLoading(false);
  }

  function saveLocation(n: string) {
    localStorage.setItem("udihub_location", JSON.stringify({ city: "Uberlândia", neighborhood: n }));
    setNeighborhood(n);
    setShowLocationSelect(false);
  }

  async function toggleFavorite(profId: string) {
    if (!userId) { toast.error("Faça login para favoritar"); return; }
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
    try {
      await fetch("/api/whatsapp-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professional_id: prof.id, city, neighborhood }),
      });
    } catch {}
    window.open(buildWhatsAppUrl(prof.whatsapp, `Olá ${prof.users?.name}! Vi seu perfil no UDIHUB.`), "_blank");
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setShowLocationSelect(!showLocationSelect)} className="flex items-center gap-1.5">
            <MapPin size={14} style={{ color: "#3B82F6" }} />
            <div className="text-left">
              <div className="text-[10px] text-muted">Sua localização</div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                {neighborhood ? `${neighborhood}, ` : ""}{city}
                <ChevronDown size={12} className="text-muted" />
              </div>
            </div>
          </button>
          <Link href="/servicos">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <Search size={16} className="text-muted" />
            </div>
          </Link>
        </div>

        {showLocationSelect && (
          <div className="p-3 rounded-2xl mb-2 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <select value={neighborhood} onChange={(e) => saveLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs text-foreground"
              style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none" }}>
              <option value="">Todos os bairros de {city}</option>
              {uberlandia.neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-syne font-extrabold text-2xl text-foreground">O que você precisa?</h1>
          <p className="text-sm text-muted mt-0.5">Profissionais em {neighborhood || city}</p>
        </div>

        {/* Quick categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-widest text-muted">CATEGORIAS</span>
            <Link href="/servicos" className="text-xs font-semibold" style={{ color: "#3B82F6" }}>Ver todas</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_CATS.map((cat) => (
              <Link key={cat.slug} href={`/servicos/${cat.slug}`}
                className="card-hover flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                style={{ background: "#111113" }}>
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[10px] text-muted leading-tight">{cat.name.split("/")[0].trim()}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured professionals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: "#3B82F6" }} />
            <span className="text-xs font-bold tracking-widest text-muted">EM DESTAQUE</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {[...Array(3)].map((_, i) => <ProfessionalCardSkeleton key={i} />)}
            </div>
          ) : professionals.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <p className="font-syne font-bold text-foreground mb-1">Nenhum profissional ainda</p>
              <p className="text-sm text-muted">Seja o primeiro a anunciar!</p>
              <Link href="/seja-profissional" className="text-sm font-bold mt-2 block" style={{ color: "#3B82F6" }}>
                Anunciar agora →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {professionals.map((prof) => {
                const neighborhood = (prof.professional_neighborhoods as any)?.[0]?.neighborhoods?.name;
                const isFav = favorites.includes(prof.id);
                return (
                  <div key={prof.id} className="rounded-2xl overflow-hidden"
                    style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                    <Link href={`/profissional/${prof.slug}`} className="block p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center font-syne font-bold text-lg"
                            style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                            {getInitials(prof.users?.name || "?")}
                          </div>
                          {prof.available_now && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                              style={{ background: "#22c55e", borderColor: "#111113" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-syne font-bold text-sm text-foreground">{prof.users?.name}</h3>
                                {prof.plan === "pro" && <span className="badge-pro">PRO</span>}
                              </div>
                              <p className="text-xs text-muted">{(prof.categories as any)?.icon} {(prof.categories as any)?.name}</p>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); toggleFavorite(prof.id); }}
                              className="p-1.5 rounded-lg"
                              style={{ background: isFav ? "rgba(239,68,68,0.1)" : "transparent" }}>
                              <Heart size={16} fill={isFav ? "#ef4444" : "transparent"}
                                className={isFav ? "text-red-500" : "text-muted"} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            {neighborhood && (
                              <div className="flex items-center gap-1">
                                <MapPin size={10} className="text-muted" />
                                <span className="text-xs text-muted">{neighborhood}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Star size={10} fill="#FBBF24" className="star-filled" />
                              <span className="text-xs text-muted">
                                {prof.avg_rating > 0 ? Number(prof.avg_rating).toFixed(1) : "Novo"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <button onClick={() => handleWhatsApp(prof)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 12px rgba(22,163,74,0.25)" }}>
                        <MessageCircle size={15} /> Chamar no WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
