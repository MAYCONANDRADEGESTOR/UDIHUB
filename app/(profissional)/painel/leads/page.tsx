"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, MapPin, TrendingUp } from "lucide-react";

type Period = "today" | "week" | "month";

const MOCK_LEADS = [
  { id: "1", city: "Uberlândia", neighborhood: "Tibery", created_at: "2025-01-27T10:30:00Z" },
  { id: "2", city: "Uberlândia", neighborhood: "Santa Mônica", created_at: "2025-01-27T08:15:00Z" },
  { id: "3", city: "Uberlândia", neighborhood: "Morumbi", created_at: "2025-01-26T16:45:00Z" },
  { id: "4", city: "Uberlândia", neighborhood: "Jardim Karaíba", created_at: "2025-01-26T11:20:00Z" },
  { id: "5", city: "Uberlândia", neighborhood: "Tibery", created_at: "2025-01-25T14:00:00Z" },
  { id: "6", city: "Uberlândia", neighborhood: "Copacabana", created_at: "2025-01-24T09:30:00Z" },
  { id: "7", city: "Uberlândia", neighborhood: "Saraiva", created_at: "2025-01-23T17:15:00Z" },
];

function formatLeadTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);

  if (diffH < 1) return "Agora há pouco";
  if (diffH < 24) return `há ${diffH}h`;
  if (diffD === 1) return "Ontem";
  return date.toLocaleDateString("pt-BR");
}

export default function LeadsPage() {
  const [period, setPeriod] = useState<Period>("week");

  const totals = {
    today: MOCK_LEADS.filter(
      (l) => new Date(l.created_at).toDateString() === new Date().toDateString()
    ).length,
    week: MOCK_LEADS.length,
    month: MOCK_LEADS.length,
  };

  // Group by neighborhood for chart
  const byNeighborhood: Record<string, number> = {};
  MOCK_LEADS.forEach((l) => {
    byNeighborhood[l.neighborhood] = (byNeighborhood[l.neighborhood] || 0) + 1;
  });
  const topNeighborhoods = Object.entries(byNeighborhood)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <Link href="/painel" className="text-muted">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">
          Leads recebidos
        </h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Period tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          {(["today", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: period === p ? "#3B82F6" : "transparent",
                color: period === p ? "white" : "#A1A1AA",
                boxShadow: period === p ? "0 0 12px rgba(59,130,246,0.4)" : "none",
              }}
            >
              {p === "today" ? "Hoje" : p === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>

        {/* Total */}
        <div
          className="p-5 rounded-2xl text-center"
          style={{
            background: "linear-gradient(135deg, #0F1729, #1e3a5f)",
            border: "1px solid rgba(59,130,246,0.3)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <MessageCircle size={18} style={{ color: "#3B82F6" }} />
            <span className="text-xs font-bold text-muted">
              {period === "today" ? "HOJE" : period === "week" ? "ESTA SEMANA" : "ESTE MÊS"}
            </span>
          </div>
          <div className="font-syne font-extrabold text-4xl" style={{ color: "#3B82F6" }}>
            {totals[period]}
          </div>
          <div className="text-xs text-muted mt-1">leads via WhatsApp</div>
        </div>

        {/* Top neighborhoods */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: "#3B82F6" }} />
            <h2 className="font-syne font-bold text-sm text-foreground">
              Bairros que mais chamam
            </h2>
          </div>
          <div className="space-y-2">
            {topNeighborhoods.map(([neighborhood, count], i) => {
              const maxCount = topNeighborhoods[0][1];
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div
                  key={neighborhood}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}
                >
                  <span className="text-xs font-bold text-muted w-4">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{neighborhood}</span>
                      <span className="text-xs font-bold" style={{ color: "#3B82F6" }}>
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1F1F23" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #3B82F6, #1d4ed8)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead list */}
        <div>
          <h2 className="font-syne font-bold text-sm text-foreground mb-3">
            Histórico
          </h2>
          <div className="space-y-2">
            {MOCK_LEADS.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.1)" }}
                >
                  <MessageCircle size={14} style={{ color: "#22c55e" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-muted" />
                    <span className="text-sm font-medium text-foreground">
                      {lead.neighborhood}
                    </span>
                  </div>
                  <span className="text-xs text-muted">{lead.city}</span>
                </div>
                <span className="text-xs text-muted">{formatLeadTime(lead.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
