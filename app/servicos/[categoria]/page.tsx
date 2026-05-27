"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  SlidersHorizontal,
  Star,
  MapPin,
  MessageCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { ProfessionalCardSkeleton } from "@/app/components/ui/Skeletons";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import type { Professional } from "@/types";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

// Mock data for development
const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "1",
    user_id: "u1",
    slug: "joao-silva-encanador",
    bio: "15 anos de experiência em hidráulica residencial e comercial. Atendo emergências.",
    whatsapp: "34999991111",
    category_id: "encanador",
    status: "active",
    plan: "pro",
    featured: true,
    views_count: 342,
    avg_rating: 4.8,
    available_now: true,
    created_at: new Date().toISOString(),
    user: { id: "u1", name: "João Silva", email: "", role: "professional", banned: false, created_at: "" },
    neighborhoods: [{ id: "n1", city_id: "c1", name: "Tibery", slug: "tibery" }],
  },
  {
    id: "2",
    user_id: "u2",
    slug: "carlos-hidraulica",
    bio: "Especialista em detecção de vazamentos e instalação de sistemas hidráulicos.",
    whatsapp: "34999992222",
    category_id: "encanador",
    status: "active",
    plan: "basic",
    featured: false,
    views_count: 127,
    avg_rating: 4.5,
    available_now: false,
    created_at: new Date().toISOString(),
    user: { id: "u2", name: "Carlos Mendes", email: "", role: "professional", banned: false, created_at: "" },
    neighborhoods: [{ id: "n2", city_id: "c1", name: "Santa Mônica", slug: "santa-monica" }],
  },
  {
    id: "3",
    user_id: "u3",
    slug: "rafael-encanamentos",
    bio: "Serviços de encanamento residencial. Preço justo e garantia no serviço.",
    whatsapp: "34999993333",
    category_id: "encanador",
    status: "active",
    plan: "basic",
    featured: false,
    views_count: 89,
    avg_rating: 4.2,
    available_now: false,
    created_at: new Date().toISOString(),
    user: { id: "u3", name: "Rafael Souza", email: "", role: "professional", banned: false, created_at: "" },
    neighborhoods: [{ id: "n3", city_id: "c1", name: "Morumbi", slug: "morumbi" }],
  },
  {
    id: "4",
    user_id: "u4",
    slug: "ana-hidraulica",
    bio: "Especialista em instalação de chuveiros, pias e sistemas de aquecimento.",
    whatsapp: "34999994444",
    category_id: "encanador",
    status: "active",
    plan: "pro",
    featured: false,
    views_count: 215,
    avg_rating: 5.0,
    available_now: true,
    created_at: new Date().toISOString(),
    user: { id: "u4", name: "Ana Paula", email: "", role: "professional", banned: false, created_at: "" },
    neighborhoods: [{ id: "n4", city_id: "c1", name: "Jardim Karaíba", slug: "jardim-karaiba" }],
  },
];

interface Filters {
  neighborhood: string;
  minRating: number;
  availableOnly: boolean;
  sortBy: "pro_first" | "best_rated" | "newest";
}

export default function CategoriaPage() {
  const params = useParams();
  const slug = params.categoria as string;

  const category = CATEGORIES.find((c) => c.slug === slug);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    neighborhood: "",
    minRating: 0,
    availableOnly: false,
    sortBy: "pro_first",
  });

  useEffect(() => {
    // TODO: fetch from Supabase
    setTimeout(() => {
      let data = [...MOCK_PROFESSIONALS];
      if (filters.neighborhood) data = data.filter((p) => p.neighborhoods?.[0]?.name === filters.neighborhood);
      if (filters.minRating > 0) data = data.filter((p) => p.avg_rating >= filters.minRating);
      if (filters.availableOnly) data = data.filter((p) => p.available_now);
      if (filters.sortBy === "pro_first") data.sort((a, b) => (b.plan === "pro" ? 1 : 0) - (a.plan === "pro" ? 1 : 0));
      if (filters.sortBy === "best_rated") data.sort((a, b) => b.avg_rating - a.avg_rating);
      setProfessionals(data);
      setLoading(false);
    }, 800);
  }, [filters]);

  async function handleWhatsAppClick(prof: Professional) {
    // Register lead
    try {
      await fetch("/api/whatsapp-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: prof.id,
          city: "Uberlândia",
          neighborhood: prof.neighborhoods?.[0]?.name,
        }),
      });
    } catch {}
    // Open WhatsApp
    const url = buildWhatsAppUrl(
      prof.whatsapp,
      `Olá! Vi seu perfil no UDIHUB e gostaria de solicitar um orçamento.`
    );
    window.open(url, "_blank");
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-foreground font-syne font-bold text-lg">Categoria não encontrada</p>
          <Link href="/servicos" className="text-sm mt-2 block" style={{ color: "#3B82F6" }}>
            Ver todas as categorias
          </Link>
        </div>
      </div>
    );
  }

  const activeFilterCount = [
    filters.neighborhood,
    filters.minRating > 0,
    filters.availableOnly,
    filters.sortBy !== "pro_first",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Link href="/servicos" className="text-muted">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{category.icon}</span>
            <h1 className="font-syne font-bold text-lg text-foreground">
              {category.name}
            </h1>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: activeFilterCount > 0 ? "rgba(59,130,246,0.15)" : "#111113",
              border: activeFilterCount > 0 ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
              color: activeFilterCount > 0 ? "#3B82F6" : "#A1A1AA",
            }}
          >
            <SlidersHorizontal size={14} />
            Filtros
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: "#3B82F6" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div
            className="mt-2 p-3 rounded-2xl space-y-3 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}
          >
            {/* Neighborhood */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
                Bairro
              </label>
              <select
                value={filters.neighborhood}
                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs text-foreground"
                style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none" }}
              >
                <option value="">Todos os bairros</option>
                {uberlandia.neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
                Avaliação mínima
              </label>
              <div className="flex gap-2">
                {[0, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilters({ ...filters, minRating: r })}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                    style={{
                      background: filters.minRating === r ? "rgba(59,130,246,0.2)" : "#09090B",
                      border: filters.minRating === r ? "1px solid #3B82F6" : "1px solid #1F1F23",
                      color: filters.minRating === r ? "#3B82F6" : "#A1A1AA",
                    }}
                  >
                    {r === 0 ? "Todos" : `${r}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort + Available */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as Filters["sortBy"] })}
                className="flex-1 px-3 py-2 rounded-xl text-xs text-foreground"
                style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none" }}
              >
                <option value="pro_first">Pro primeiro</option>
                <option value="best_rated">Melhor avaliados</option>
                <option value="newest">Mais recentes</option>
              </select>

              <button
                onClick={() => setFilters({ ...filters, availableOnly: !filters.availableOnly })}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5"
                style={{
                  background: filters.availableOnly ? "rgba(34,197,94,0.15)" : "#09090B",
                  border: filters.availableOnly ? "1px solid rgba(34,197,94,0.4)" : "1px solid #1F1F23",
                  color: filters.availableOnly ? "#22c55e" : "#A1A1AA",
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filters.availableOnly ? "bg-green-500" : "bg-muted"}`} />
                Disponível
              </button>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ neighborhood: "", minRating: 0, availableOnly: false, sortBy: "pro_first" })}
                className="text-xs text-muted flex items-center gap-1"
              >
                <X size={10} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {!loading && (
          <p className="text-xs text-muted mb-4">
            {professionals.length} profissional{professionals.length !== 1 ? "is" : ""} em Uberlândia
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => <ProfessionalCardSkeleton key={i} />)}
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">{category.icon}</div>
            <p className="font-syne font-bold text-foreground">Nenhum profissional encontrado</p>
            <p className="text-sm text-muted mt-1">Tente remover alguns filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {professionals.map((prof) => (
              <ProfessionalListCard
                key={prof.id}
                professional={prof}
                onWhatsApp={() => handleWhatsAppClick(prof)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfessionalListCard({
  professional: prof,
  onWhatsApp,
}: {
  professional: Professional;
  onWhatsApp: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 hover:border-accent"
      style={{ background: "#111113", border: "1px solid #1F1F23" }}
    >
      <Link href={`/profissional/${prof.slug}`} className="block">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {prof.user?.avatar ? (
                <Image
                  src={prof.user.avatar}
                  alt={prof.user.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-syne font-bold text-lg"
                  style={{
                    background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                    color: "#93c5fd",
                  }}
                >
                  {getInitials(prof.user?.name || "?")}
                </div>
              )}
              {prof.available_now && (
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                  style={{
                    background: "#22c55e",
                    borderColor: "#111113",
                    boxShadow: "0 0 8px rgba(34,197,94,0.7)",
                  }}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-syne font-bold text-sm text-foreground">
                      {prof.user?.name}
                    </h3>
                    {prof.plan === "pro" && <span className="badge-pro">PRO</span>}
                  </div>
                  {prof.bio && (
                    <p className="text-xs text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {prof.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Location + rating row */}
              <div className="flex items-center gap-3 mt-2">
                {prof.neighborhoods?.[0] && (
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-muted" />
                    <span className="text-xs text-muted">{prof.neighborhoods[0].name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star size={10} fill="#FBBF24" className="star-filled" />
                  <span className="text-xs text-muted">
                    {prof.avg_rating > 0 ? prof.avg_rating.toFixed(1) : "Novo"}
                  </span>
                </div>
                {prof.available_now && (
                  <span className="badge-available text-[9px] px-1.5 py-0.5">Disponível agora</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* WhatsApp CTA */}
      <div className="px-4 pb-4">
        <button
          onClick={onWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-98"
          style={{
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            boxShadow: "0 0 12px rgba(22,163,74,0.25)",
          }}
        >
          <MessageCircle size={15} />
          Chamar no WhatsApp
        </button>
      </div>
    </div>
  );
}
