"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Power, Loader2 } from "lucide-react";
import { CITIES } from "@/lib/constants";

interface CityItem {
  slug: string;
  name: string;
  state: string;
  enabled: boolean;
  professionals?: number;
}

const INITIAL_CITIES: CityItem[] = CITIES.map((c, i) => ({
  ...c,
  professionals: c.enabled ? Math.floor(Math.random() * 50) + 5 : 0,
}));

export default function AdminCidadesPage() {
  const [cities, setCities] = useState(INITIAL_CITIES);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleCity(slug: string) {
    setToggling(slug);
    // TODO: update Supabase
    setTimeout(() => {
      setCities((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, enabled: !c.enabled } : c
        )
      );
      setToggling(null);
    }, 800);
  }

  const enabled = cities.filter((c) => c.enabled);
  const disabled = cities.filter((c) => !c.enabled);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <Link href="/admin" className="text-muted">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Cidades</h1>
        <span className="text-xs text-muted">{enabled.length} ativas</span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Info banner */}
        <div
          className="flex items-start gap-3 p-3 rounded-xl"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <MapPin size={14} style={{ color: "#3B82F6" }} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted leading-relaxed">
            Cidades desabilitadas não aparecem nos filtros do marketplace. Habilite quando estiver pronto para expandir.
          </p>
        </div>

        {/* Enabled cities */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#22c55e" }}>
            ATIVAS ({enabled.length})
          </p>
          <div className="space-y-2">
            {enabled.map((city) => (
              <CityRow
                key={city.slug}
                city={city}
                onToggle={() => toggleCity(city.slug)}
                loading={toggling === city.slug}
              />
            ))}
          </div>
        </div>

        {/* Disabled cities */}
        {disabled.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-widest mb-3 text-muted">
              DESABILITADAS ({disabled.length})
            </p>
            <div className="space-y-2">
              {disabled.map((city) => (
                <CityRow
                  key={city.slug}
                  city={city}
                  onToggle={() => toggleCity(city.slug)}
                  loading={toggling === city.slug}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CityRow({
  city,
  onToggle,
  loading,
}: {
  city: CityItem;
  onToggle: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
      style={{
        background: "#111113",
        border: city.enabled
          ? "1px solid rgba(34,197,94,0.2)"
          : "1px solid #1F1F23",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: city.enabled
            ? "rgba(34,197,94,0.1)"
            : "rgba(161,161,170,0.08)",
        }}
      >
        <MapPin
          size={16}
          style={{ color: city.enabled ? "#22c55e" : "#A1A1AA" }}
        />
      </div>

      <div className="flex-1">
        <div className="font-semibold text-sm text-foreground">{city.name}</div>
        <div className="text-xs text-muted">
          {city.state}
          {city.professionals !== undefined && city.professionals > 0 && (
            <> · {city.professionals} profissionais</>
          )}
        </div>
      </div>

      <button
        onClick={onToggle}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
        style={{
          background: city.enabled
            ? "rgba(239,68,68,0.1)"
            : "rgba(34,197,94,0.1)",
          border: city.enabled
            ? "1px solid rgba(239,68,68,0.3)"
            : "1px solid rgba(34,197,94,0.3)",
          color: city.enabled ? "#f87171" : "#22c55e",
        }}
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Power size={13} />
        )}
        {city.enabled ? "Desabilitar" : "Habilitar"}
      </button>
    </div>
  );
}
