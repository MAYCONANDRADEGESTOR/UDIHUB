"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ArrowRight, MapPin, Star, MessageCircle, Loader2, X, Eye, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import toast from "react-hot-toast";

interface FavoriteProfessional {
  id: string;
  professional_id: string;
  professionals: {
    id: string;
    slug: string;
    whatsapp: string;
    avg_rating: number;
    available_now: boolean;
    plan: string;
    avatar: string | null;
    users: { name: string; avatar: string | null };
    categories: { name: string; icon: string };
    professional_neighborhoods: { neighborhoods: { name: string } }[];
  };
}

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data } = await supabase
        .from("favorites")
        .select(`id, professional_id,
          professionals(id, slug, whatsapp, avg_rating, available_now, plan, avatar,
            users(name, avatar),
            categories(name, icon),
            professional_neighborhoods(neighborhoods(name))
          )`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setFavorites((data as any) || []);
      setLoading(false);
    }
    load();
  }, []);

  async function removeFavorite(favoriteId: string) {
    setRemoving(favoriteId);
    const supabase = createClient();
    await supabase.from("favorites").delete().eq("id", favoriteId);
    setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    setRemoving(null);
    toast.success("Removido dos favoritos");
  }

  async function handleWhatsApp(prof: any) {
    try {
      await fetch("/api/whatsapp-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professional_id: prof.id }),
      });
    } catch {}
    window.open(buildWhatsAppUrl(prof.whatsapp, `Olá ${prof.users?.name}! Vi seu perfil no UDIHUB.`), "_blank");
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header com botão voltar */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <ArrowLeft size={18} className="text-muted" />
          </button>
          <div className="flex-1">
            <h1 className="font-syne font-bold text-xl text-foreground">Favoritos</h1>
            {favorites.length > 0 && (
              <p className="text-xs text-muted">
                {favorites.length} profissional{favorites.length !== 1 ? "is" : ""} salvo{favorites.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(239,68,68,0.1)" }}>
              <Heart size={28} style={{ color: "#ef4444" }} />
            </div>
            <h2 className="font-syne font-bold text-lg text-foreground mb-2">Nenhum favorito ainda</h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
              Toque no coração nos perfis dos profissionais para salvar seus favoritos aqui.
            </p>
            <Link href="/servicos"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.3)" }}>
              Explorar serviços <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {favorites.map((fav) => {
              const prof = fav.professionals as any;
              const neighborhood = prof?.professional_neighborhoods?.[0]?.neighborhoods?.name;
              const avatarUrl = prof?.avatar || prof?.users?.avatar || null;
              const isPaidPlan = prof?.plan === "professional" || prof?.plan === "professional_annual" || prof?.plan === "pro";
              const planBadgeLabel = prof?.plan === "professional_annual" ? "ANUAL" : "PRO";
              return (
                <div key={fav.id} className="rounded-2xl overflow-hidden"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Link href={`/profissional/${prof?.slug}`} className="relative flex-shrink-0">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt={prof?.users?.name || "Profissional"}
                            width={56} height={56} className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center font-syne font-bold text-lg"
                            style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                            {getInitials(prof?.users?.name || "?")}
                          </div>
                        )}
                        {prof?.available_now && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                            style={{ background: "#22c55e", borderColor: "#111113" }} />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/profissional/${prof?.slug}`} className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-syne font-bold text-sm text-foreground truncate">{prof?.users?.name}</h3>
                              {isPaidPlan && <span className="badge-pro">{planBadgeLabel}</span>}
                            </div>
                            <p className="text-xs text-muted">{prof?.categories?.icon} {prof?.categories?.name}</p>
                          </Link>
                          <button onClick={() => removeFavorite(fav.id)} disabled={removing === fav.id}
                            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(239,68,68,0.1)" }}>
                            {removing === fav.id
                              ? <Loader2 size={12} style={{ color: "#f87171" }} className="animate-spin" />
                              : <X size={12} style={{ color: "#f87171" }} />}
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
                              {prof?.avg_rating > 0 ? Number(prof.avg_rating).toFixed(1) : "Novo"}
                            </span>
                          </div>
                          {prof?.available_now && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                              style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                              Disponível
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                    <Link href={`/profissional/${prof?.slug}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
                      <Eye size={15} /> Ver perfil
                    </Link>
                    <button onClick={() => handleWhatsApp(prof)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                      <MessageCircle size={15} /> WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
