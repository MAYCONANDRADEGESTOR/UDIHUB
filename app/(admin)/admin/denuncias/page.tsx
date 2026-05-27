"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flag, CheckCircle, X, AlertTriangle, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ReportStatus = "pending" | "reviewed" | "resolved";

interface ReportItem {
  id: string;
  reporter_name: string;
  professional_name: string;
  professional_slug: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
}

const MOCK_REPORTS: ReportItem[] = [
  {
    id: "1",
    reporter_name: "Maria Oliveira",
    professional_name: "Pedro Costa",
    professional_slug: "pedro-costa",
    reason: "O número de WhatsApp é falso. Tentei ligar e não existe.",
    status: "pending",
    created_at: "2025-01-26T14:00:00Z",
  },
  {
    id: "2",
    reporter_name: "Ana Ferreira",
    professional_name: "Carlos Silva",
    professional_slug: "carlos-silva",
    reason: "Profissional pediu dinheiro antecipado e sumiu.",
    status: "pending",
    created_at: "2025-01-25T10:30:00Z",
  },
  {
    id: "3",
    reporter_name: "João Santos",
    professional_name: "Rafael Mendes",
    professional_slug: "rafael-mendes",
    reason: "Avaliações parecem falsas, todas com 5 estrelas sem comentários.",
    status: "reviewed",
    created_at: "2025-01-20T08:00:00Z",
  },
];

export default function AdminDenunciasPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [activeTab, setActiveTab] = useState<ReportStatus | "all">("pending");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = reports.filter(
    (r) => activeTab === "all" || r.status === activeTab
  );

  async function updateStatus(id: string, status: ReportStatus) {
    setLoading(id);
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      setLoading(null);
    }, 800);
  }

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const statusColor: Record<ReportStatus, string> = {
    pending: "#f59e0b",
    reviewed: "#3B82F6",
    resolved: "#22c55e",
  };
  const statusLabel: Record<ReportStatus, string> = {
    pending: "Pendente",
    reviewed: "Em análise",
    resolved: "Resolvida",
  };

  return (
    <div className="min-h-screen bg-background pb-6">
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
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Denúncias</h1>
        {pendingCount > 0 && (
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "#ef4444" }}
          >
            {pendingCount}
          </span>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          {(["pending", "reviewed", "resolved", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: activeTab === tab ? "#3B82F6" : "transparent",
                color: activeTab === tab ? "white" : "#A1A1AA",
              }}
            >
              {tab === "pending" ? "Pendentes" : tab === "reviewed" ? "Em análise" : tab === "resolved" ? "Resolvidas" : "Todas"}
            </button>
          ))}
        </div>

        {/* Reports */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={32} className="text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">Nenhuma denúncia aqui</p>
            </div>
          ) : (
            filtered.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flag size={14} style={{ color: statusColor[report.status] }} />
                    <div>
                      <span className="font-semibold text-sm text-foreground">
                        {report.professional_name}
                      </span>
                      <span className="text-xs text-muted block">
                        Denunciado por {report.reporter_name}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${statusColor[report.status]}15`,
                      color: statusColor[report.status],
                      border: `1px solid ${statusColor[report.status]}30`,
                    }}
                  >
                    {statusLabel[report.status]}
                  </span>
                </div>

                {/* Reason */}
                <p className="text-xs text-muted leading-relaxed mb-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  "{report.reason}"
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">
                    {formatDate(report.created_at)}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/profissional/${report.professional_slug}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}
                    >
                      Ver perfil
                    </Link>

                    {report.status === "pending" && (
                      <button
                        onClick={() => updateStatus(report.id, "reviewed")}
                        disabled={loading === report.id}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
                      >
                        {loading === report.id ? <Loader2 size={11} className="animate-spin" /> : null}
                        Analisar
                      </button>
                    )}

                    {report.status !== "resolved" && (
                      <button
                        onClick={() => updateStatus(report.id, "resolved")}
                        disabled={loading === report.id}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
                      >
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
