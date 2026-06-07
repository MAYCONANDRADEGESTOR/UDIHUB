"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Power, Loader2, Users, Building2, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CityItem {
  id: string;
  name: string;
  slug: string;
  state: string;
  enabled: boolean;
  professionals_count: number;
  neighborhoods_count: number;
}

export default function AdminCidadesPage() {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => { loadCities(); }, []);

  async function loadCities() {
    const supabase = createClient();

    const { data: citiesData } = await supabase
      .from("cities")
      .select("id, name, slug, state, enabled")
      .order("enabled", { ascending: false })
      .order("name");

    if (!citiesData) { setLoading(false); return; }

    const citiesWithCount = await Promise.all(
      citiesData.map(async (city) => {
        const { data: neighborhoodsData } = await supabase
          .from("neighborhoods")
          .select("id")
          .eq("city_id", city.id);

        const neighborhoodIds = neighborhoodsData?.map((n: any) => n.id) || [];

        const { count: profCount } = neighborhoodIds.length > 0
          ? await supabase
              .from("professional_neighborhoods")
              .select("professional_id", { count: "exact", head: true })
              .in("neighborhood_id", neighborhoodIds)
          : { count: 0 };

        return {
          ...city,
          professionals_count: profCount || 0,
          neighborhoods_count: neighborhoodsData?.length || 0,
        };
      })
    );

    setCities(citiesWithCount);
    setLoading(false);
  }

  async function toggleCity(city: CityItem) {
    if (city.slug === "uberlandia") return;
    setToggling(city.id);
    const supabase = createClient();
    await supabase.from("cities").update({ enabled: !city.enabled }).eq("id", city.id);
    setCities((prev) => prev.map((c) =>
      c.id === city.id ? { ...c, enabled: !c.enabled } : c
    ));
    setToggling(null);
  }

  const enabled = cities.filter((c) => c.enabled);
  const disabled = cities.filter((c) => !c.enabled);
  const totalProfs = cities.reduce((s, c) => s + c.professionals_count, 0);
  const totalBairros = cities.reduce((s, c) => s + c.neighborhoods_count, 0);

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Cidades</h1>
        <span className="text-xs text-muted">{enabled.length} ativa{enabled.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Info */}
        <div className="flex items-start gap-3 p-3 rounded-xl"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <MapPin size={14} style={{ color: "#3B82F6" }} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted leading-relaxed">
            Habilite novas cidades quando estiver pronto para expandir. Cidades desabilitadas não aparecem no marketplace.
          </p>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="font-syne font-bold text-lg" style={{ color: "#22c55e" }}>{enabled.length}</div>
            <div className="text-[10px] text-muted">Ativas</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="font-syne font-bold text-lg" style={{ color: "#64748b" }}>{disabled.length}</div>
            <div className="text-[10px] text-muted">Inativas</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="font-syne font-bold text-lg" style={{ color: "#3B82F6" }}>{totalProfs}</div>
            <div className="text-[10px] text-muted">Profissionais</div>
          </div>
          <div className="p-3 rounded-xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="font-syne font-bold text-lg" style={{ color: "#a855f7" }}>{totalBairros}</div>
            <div className="text-[10px] text-muted">Bairros</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
          </div>
        ) : (
          <>
            {enabled.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#22c55e" }}>
                  ATIVAS ({enabled.length})
                </p>
                <div className="space-y-2">
                  {enabled.map((city) => (
                    <CityRow key={city.id} city={city}
                      onToggle={() => toggleCity(city)}
                      loading={toggling === city.id} />
                  ))}
                </div>
              </div>
            )}

            {disabled.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest mb-3 text-muted">
                  DESABILITADAS ({disabled.length})
                </p>
                <div className="space-y-2">
                  {disabled.map((city) => (
                    <CityRow key={city.id} city={city}
                      onToggle={() => toggleCity(city)}
                      loading={toggling === city.id} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CityRow({ city, onToggle, loading }: {
  city: CityItem; onToggle: () => void; loading: boolean;
}) {
  const isUberlandia = city.slug === "uberlandia";
  return (
    <div className="p-4 rounded-2xl"
      style={{
        background: "#111113",
        border: city.enabled ? "1px solid rgba(34,197,94,0.2)" : "1px solid #1F1F23"
      }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: city.enabled ? "rgba(34,197,94,0.1)" : "rgba(161,161,170,0.08)" }}>
          <MapPin size={16} style={{ color: city.enabled ? "#22c55e" : "#A1A1AA" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm text-foreground">{city.name}</span>
            {isUberlandia && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                Principal
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{city.state}</span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Users size={9} /> {city.professionals_count} profissionais
            </span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Building2 size={9} /> {city.neighborhoods_count} bairros
            </span>
          </div>
        </div>
        <button onClick={onToggle} disabled={loading || isUberlandia}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0"
          style={{
            background: city.enabled ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            border: city.enabled ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(34,197,94,0.3)",
            color: city.enabled ? "#f87171" : "#22c55e",
            opacity: isUberlandia ? 0.4 : 1,
            cursor: isUberlandia ? "not-allowed" : "pointer",
          }}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} />}
          {city.enabled ? "Desabilitar" : "Habilitar"}
        </button>
      </div>
    </div>
  );
}
