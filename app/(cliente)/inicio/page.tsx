"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Search, Zap } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { ProfessionalCardSkeleton } from "@/app/components/ui/Skeletons";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

export default function InicioPage() {
  const [city, setCity] = useState("Uberlândia");
  const [neighborhood, setNeighborhood] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [showNeighborhoodSelect, setShowNeighborhoodSelect] = useState(false);

  useEffect(() => {
    // Load saved location from localStorage
    const saved = localStorage.getItem("udihub_location");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCity(parsed.city || "Uberlândia");
      setNeighborhood(parsed.neighborhood || "");
    }
  }, []);

  function saveLocation(c: string, n: string) {
    localStorage.setItem("udihub_location", JSON.stringify({ city: c, neighborhood: n }));
    setCity(c);
    setNeighborhood(n);
  }

  function requestGPS() {
    setLocationLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        // TODO: reverse geocode with Supabase function or external API
        // For now, default to Uberlândia
        saveLocation("Uberlândia", "");
        setLocationLoading(false);
      },
      () => {
        setShowNeighborhoodSelect(true);
        setLocationLoading(false);
      }
    );
  }

  const QUICK_CATS = CATEGORIES.slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        {/* Location bar */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowNeighborhoodSelect(!showNeighborhoodSelect)}
            className="flex items-center gap-1.5 group"
          >
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
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}
            >
              <Search size={16} className="text-muted" />
            </div>
          </Link>
        </div>

        {/* Location select panel */}
        {showNeighborhoodSelect && (
          <div
            className="p-3 rounded-2xl mb-2 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted">Selecionar bairro</span>
              <button
                onClick={requestGPS}
                className="text-[10px] font-bold flex items-center gap-1"
                style={{ color: "#3B82F6" }}
              >
                <MapPin size={10} />
                {locationLoading ? "Detectando..." : "Usar GPS"}
              </button>
            </div>
            <select
              value={neighborhood}
              onChange={(e) => {
                saveLocation(city, e.target.value);
                setShowNeighborhoodSelect(false);
              }}
              className="w-full px-3 py-2 rounded-xl text-xs text-foreground"
              style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none" }}
            >
              <option value="">Todos os bairros de {city}</option>
              {uberlandia.neighborhoods.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="font-syne font-extrabold text-2xl text-foreground">
            O que você precisa?
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Encontre profissionais em {neighborhood || city}
          </p>
        </div>

        {/* Quick categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-widest text-muted">CATEGORIAS</span>
            <Link href="/servicos" className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_CATS.map((cat) => (
              <Link
                key={cat.slug}
                href={`/servicos/${cat.slug}`}
                className="card-hover flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
                style={{ background: "#111113" }}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[10px] text-muted leading-tight">
                  {cat.name.split("/")[0].trim()}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pro professionals highlight */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: "#3B82F6" }} />
            <span className="text-xs font-bold tracking-widest text-muted">EM DESTAQUE</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {[...Array(3)].map((_, i) => (
              <ProfessionalCardSkeleton key={i} />
            ))}
          </div>
          {/* TODO: replace with real data */}
        </div>
      </div>
    </div>
  );
}
