"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Period = "today" | "week" | "month";

interface Lead {
  id: string;
  city: string;
  neighborhood: string;
  created_at: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("week");
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: prof } = await supabase
        .from("professionals").select("id").eq("user_id", user.id).single();
      if (!prof) { router.push("/painel"); return; }

      setProfessionalId(prof.id);

      const { data } = await supabase
        .from("whatsapp_clicks")
        .select("id, city, neighborhood, created_at")
        .eq("professional_id", prof.id)
        .order("created_at", { ascending: false })
        .limit(100);

      setLeads(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function filterByPeriod(leads: Lead[]) {
    const now = new Date();
    return leads.filter((l) => {
      const d = new Date(l.created_at);
      if (period === "today") return d.toDateString() === now.toDateString();
      if (period === "week") return now.getTime() - d.getTime() <= 7 * 24 * 60 * 60 * 1000;
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (h < 1) return "Agora";
    if (h < 24) return `há ${h}h`;
    if (d === 1) return "Ontem";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  }

  const filtered = filterByPeriod(leads);

  // Top neighborhoods
  const byNeighborhood: Record<string, number> = {};
  filtered.forEach((l) => {
    if (l.neighborhood) byNeighborhood[l.neighborhood] = (byNeighborhood[l.neighborhood] || 0) + 1;
  });
  const topNeighborhoods = Object.entries(byNeighborhood).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = topNeighborhoods[0]?.[1] || 1;

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/painel" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Leads recebidos</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Period tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          {(["today", "week", "month"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: period === p ? "#3B82F6" : "transparent",
                color: period === p ? "white" : "#A1A1AA",
                boxShadow: period === p ? "0 0 12px rgba(59,130,246,0.4)" : "none",
              }}>
              {p === "today" ? "Hoje" : p === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="p-5 rounded-2xl text-center"
          style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <MessageCircle size={18} style={{ color: "#3B82F6" }} />
            <span className="text-xs font-bold text-muted">
              {period === "today" ? "HOJE" : period === "week" ? "ESTA SEMANA" : "ESTE MÊS"}
            </span>
          </div>
          <div className="font-syne font-extrabold text-4xl" style={{ color: "#3B82F6" }}>
            {filtered.length}
          </div>
          <div className="text-xs text-muted mt-1">leads via WhatsApp</div>
        </div>

        {/* Top neighborhoods */}
        {topNeighborhoods.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} style={{ color: "#3B82F6" }} />
              <h2 className="font-syne font-bold text-sm text-foreground">Bairros que mais chamam</h2>
            </div>
            <div className="space-y-2">
              {topNeighborhoods.map(([neighborhood, count], i) => (
                <div key={neighborhood} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  <span className="text-xs font-bold text-muted w-4">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{neighborhood}</span>
                      <span className="text-xs font-bold" style={{ color: "#3B82F6" }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1F1F23" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: "linear-gradient(90deg, #3B82F6, #1d4ed8)" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead list */}
        <div>
          <h2 className="font-syne font-bold text-sm text-foreground mb-3">Histórico</h2>
          {filtered.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <MessageCircle size={28} className="text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">Nenhum lead neste período</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(34,197,94,0.1)" }}>
                    <MessageCircle size={14} style={{ color: "#22c55e" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-muted" />
                      <span className="text-sm font-medium text-foreground">{lead.neighborhood || "—"}</span>
                    </div>
                    <span className="text-xs text-muted">{lead.city || "Uberlândia"}</span>
                  </div>
                  <span className="text-xs text-muted">{timeAgo(lead.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
