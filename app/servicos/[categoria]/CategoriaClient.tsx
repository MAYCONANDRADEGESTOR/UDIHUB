"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, SlidersHorizontal, Star, MapPin, MessageCircle, X, UserPlus, Eye } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { ProfessionalCardSkeleton } from "@/app/components/ui/Skeletons";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

const PLAN_PRIORITY: Record<string, number> = {
  professional_annual: 1,
  professional: 2,
  pro: 2,
  free: 3,
  basic: 3,
};

function getPlanPriority(plan: string | null | undefined): number {
  return PLAN_PRIORITY[plan ?? ""] ?? 4;
}

interface Filters {
  neighborhood: string;
  minRating: number;
  availableOnly: boolean;
  sortBy: "pro_first" | "best_rated" | "newest";
}

// ← única mudança: recebe categoria via prop em vez de useParams
interface Props {
  categoria: string;
}

export default function CategoriaClient({ categoria }: Props) {
  const router = useRouter();
  const slug = categoria; // ← era: const slug = params.categoria as string
  const category = CATEGORIES.find((c) => c.slug === slug);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"whatsapp" | "profile" | null>(null);
  const [filters, setFilters] = useState<Filters>({
    neighborhood: "", minRating: 0, availableOnly: false, sortBy: "pro_first",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: cat } = await supabase
        .from("categories").select("id").eq("slug", slug).single();
      if (!cat) { setLoading(false); return; }

      const { data: profCatIds } = await supabase
        .from("professional_categories")
        .select("professional_id")
        .eq("category_id", cat.id);

      const profIdsFromCats = profCatIds?.map((pc: any) => pc.professional_id) || [];

      let query = supabase
        .from("professionals")
        .select(`id, slug, bio, whatsapp, avg_rating, available_now, plan, created_at,
          users(name, avatar),
          categories(name, icon, slug),
          professional_neighborhoods(neighborhoods(name))`)
        .eq("status", "active");

      if (profIdsFromCats.length > 0) {
        query = query.or(`category_id.eq.${cat.id},id.in.(${profIdsFromCats.join(",")})`);
      } else {
        query = query.eq("category_id", cat.id);
      }

      if (filters.minRating > 0) query = query.gte("avg_rating", filters.minRating);
      if (filters.availableOnly) query = query.eq("available_now", true);

      if (filters.sortBy === "best_rated") query = query.order("avg_rating", { ascending: false });
      if (filters.sortBy === "newest") query = query.order("created_at", { ascending: false });

      const { data } = await query;
      let result = data || [];

      result = result.filter((p: any, index: number, self: any[]) =>
        index === self.findIndex((t) => t.id === p.id)
      );

      if (filters.neighborhood) {
        result = result.filter((p: any) =>
          p.professional_neighborhoods?.some((pn: any) => pn.neighborhoods?.name === filters.neighborhood)
        );
      }

      if (filters.sortBy === "pro_first") {
        result = [...result].sort((a: any, b: any) => {
          const planDiff = getPlanPriority(a.plan) - getPlanPriority(b.plan);
          if (planDiff !== 0) return planDiff;
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        });
      }

      setProfessionals(result);
      setLoading(false);
    }
    load();
  }, [slug, filters]);

  async function handleWhatsAppClick(prof: any) {
    if (!userId) {
      setPendingAction("whatsapp");
      setShowLoginModal(true);
      return;
    }
    try {
      await fetch("/api/whatsapp-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: prof.id,
          city: "Uberlândia",
          neighborhood: prof.professional_neighborhoods?.[0]?.neighborhoods?.name,
        }),
      });
    } catch {}
    window.open(buildWhatsAppUrl(prof.whatsapp, `Olá! Vi seu perfil no UDIHUB e gostaria de um orçamento.`), "_blank");
  }

  function handleProfileClick(e: React.MouseEvent) {
    if (!userId) {
      e.preventDefault();
      setPendingAction("profile");
      setShowLoginModal(true);
    }
  }

  if (!category) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <p className="text-foreground font-syne font-bold text-lg">Categoria não encontrada</p>
        <Link href="/servicos" className="text-sm mt-2 block" style={{ color: "#3B82F6" }}>Ver todas</Link>
      </div>
    </div>
  );

  const activeFilterCount = [filters.neighborhood, filters.minRating > 0, filters.availableOnly, filters.sortBy !== "pro_first"].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center gap-3 mb-3">
          <Link href="/servicos" className="text-muted"><ArrowLeft size={20} /></Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{category.icon}</span>
            <h1 className="font-syne font-bold text-lg text-foreground">{category.name}</h1>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: activeFilterCount > 0 ? "rgba(59,130,246,0.15)" : "#111113",
              border: activeFilterCount > 0 ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
              color: activeFilterCount > 0 ? "#3B82F6" : "#A1A1AA",
            }}>
            <SlidersHorizontal size={14} /> Filtros
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: "#3B82F6" }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-2 p-3 rounded-2xl space-y-3 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Bairro</label>
              <select value={filters.neighborhood} onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs text-foreground"
                style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none" }}>
                <option value="">Todos os bairros</option>
                {uberlandia.neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Avaliação mínima</label>
              <div className="flex gap-2">
                {[0, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setFilters({ ...filters, minRating: r })}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: filters.minRating === r ? "rgba(59,130,246,0.2)" : "#09090B",
                      border: filters.minRating === r ? "1px solid #3B82F6" : "1px solid #1F1F23",
                      color: filters.minRating === r ? "#3B82F6" : "#A1A1AA",
                    }}>
                    {r === 0 ? "Todos" : `${r}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as Filters["sortBy"] })}
                className="flex-1 px-3 py-2 rounded-xl text-xs text-foreground"
                style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none" }}>
                <option value="pro_first">Pro primeiro</option>
                <option value="best_rated">Melhor avaliados</option>
                <option value="newest">Mais recentes</option>
              </select>
              <button onClick={() => setFilters({ ...filters, availableOnly: !filters.availableOnly })}
                className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                style={{
                  background: filters.availableOnly ? "rgba(34,197,94,0.15)" : "#09090B",
                  border: filters.availableOnly ? "1px solid rgba(34,197,94,0.4)" : "1px solid #1F1F23",
                  color: filters.availableOnly ? "#22c55e" : "#A1A1AA",
                }}>
                <span className={`w-1.5 h-1.5 rounded-full ${filters.availableOnly ? "bg-green-500" : "bg-gray-500"}`} />
                Disponível
              </button>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => setFilters({ neighborhood: "", minRating: 0, availableOnly: false, sortBy: "pro_first" })}
                className="text-xs text-muted flex items-center gap-1">
                <X size={10} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {!loading && (
          <p className="text-xs text-muted mb-4">
            {professionals.length} profissional{professionals.length !== 1 ? "is" : ""} em Uberlândia
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(3)].map((_, i) => <ProfessionalCardSkeleton key={i} />)}
          </div>
        ) : professionals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">{category.icon}</div>
            <h2 className="font-syne font-bold text-lg text-foreground mb-2">Nenhum profissional ainda</h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
              Ainda não temos profissionais de <strong className="text-foreground">{category.name}</strong> cadastrados em Uberlândia.
            </p>
            <Link href="/seja-profissional"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.3)" }}>
              Seja o primeiro a anunciar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {professionals.map((prof) => (
              <div key={prof.id} className="rounded-2xl overflow-hidden"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Link href={`/profissional/${prof.slug}`} className="block p-4"
                  onClick={handleProfileClick}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      {(prof.users as any)?.avatar ? (
                        <Image src={(prof.users as any).avatar} alt={(prof.users as any).name}
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
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <h3 className="font-syne font-bold text-sm text-foreground">{(prof.users as any)?.name}</h3>
                        {(prof.plan === "professional" || prof.plan === "professional_annual" || prof.plan === "pro") && (
                          <span className="badge-pro">
                            {prof.plan === "professional_annual" ? "ANUAL" : "PRO"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mb-1">{(prof.categories as any)?.icon} {(prof.categories as any)?.name}</p>
                      {prof.bio && <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-2">{prof.bio}</p>}
                      <div className="flex items-center gap-3">
                        {prof.professional_neighborhoods?.[0]?.neighborhoods?.name && (
                          <div className="flex items-center gap-1">
                            <MapPin size={10} className="text-muted" />
                            <span className="text-xs text-muted">{prof.professional_neighborhoods[0].neighborhoods.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star size={10} fill="#FBBF24" className="star-filled" />
                          <span className="text-xs text-muted">{prof.avg_rating > 0 ? Number(prof.avg_rating).toFixed(1) : "Novo"}</span>
                        </div>
                        {prof.available_now && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                            Disponível
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                  <Link href={`/profissional/${prof.slug}`}
                    onClick={handleProfileClick}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
                    <Eye size={15} /> Ver perfil
                  </Link>
                  <button onClick={() => handleWhatsAppClick(prof)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 12px rgba(22,163,74,0.25)" }}>
                    <MessageCircle size={15} /> WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              {pendingAction === "whatsapp" ? "Cadastre-se para falar com o profissional" : "Cadastre-se para ver o perfil completo"}
            </h3>
            <p className="text-sm text-muted text-center mb-6 leading-relaxed">
              O UDIHUB é gratuito para clientes. Crie sua conta em menos de 1 minuto.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/cadastro"
                className="w-full py-4 rounded-2xl font-bold text-base text-white text-center"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
                Criar conta grátis
              </Link>
              <Link href="/login"
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-center"
                style={{ background: "#09090B", border: "1px solid #1F1F23", color: "#94a3b8" }}>
                Já tenho conta — Entrar
              </Link>
            </div>
            <p className="text-center text-[10px] text-muted mt-4">
              100% gratuito · Sem cartão de crédito
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
