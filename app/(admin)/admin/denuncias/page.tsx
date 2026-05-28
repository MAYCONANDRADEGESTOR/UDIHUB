"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flag, CheckCircle, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

type ReportStatus = "pending" | "reviewed" | "resolved";

interface ReportItem {
  id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  users: { name: string } | null;
  professionals: {
    slug: string;
    users: { name: string } | null;
  } | null;
}

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

export default function AdminDenunciasPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReportStatus | "all">("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    const supabase = createClient();
    const { data } = await supabase
      .from("reports")
      .select(`id, reason, status, created_at,
        users(name),
        professionals(slug, users(name))`)
      .order("created_at", { ascending: false });
    setReports((data as any) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: ReportStatus) {
    setUpdating(id);
    const supabase = createClient();
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  }

  const filtered = reports.filter((r) => activeTab === "all" || r.status === activeTab);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Denúncias</h1>
        {pendingCount > 0 && (
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "#ef4444" }}>{pendingCount}</span>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          {(["pending", "reviewed", "resolved", "all"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{ background: activeTab === tab ? "#3B82F6" : "transparent", color: activeTab === tab ? "white" : "#A1A1AA" }}>
              {tab === "pending" ? "Pendentes" : tab === "reviewed" ? "Análise" : tab === "resolved" ? "Resolvidas" : "Todas"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={32} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">Nenhuma denúncia aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => (
              <div key={report.id} className="p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flag size={14} style={{ color: statusColor[report.status] }} />
                    <div>
                      <span className="font-semibold text-sm text-foreground">
                        {(report.professionals as any)?.users?.name || "Profissional"}
                      </span>
                      <span className="text-xs text-muted block">
                        Denunciado por {(report.users as any)?.name || "Usuário"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${statusColor[report.status]}15`, color: statusColor[report.status], border: `1px solid ${statusColor[report.status]}30` }}>
                    {statusLabel[report.status]}
                  </span>
                </div>

                <p className="text-xs text-muted leading-relaxed mb-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  "{report.reason}"
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">{formatDate(report.created_at)}</span>
                  <div className="flex gap-2">
                    <Link href={`/profissional/${(report.professionals as any)?.slug}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)" }}>
                      Ver perfil
                    </Link>
                    {report.status === "pending" && (
                      <button onClick={() => updateStatus(report.id, "reviewed")}
                        disabled={updating === report.id}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                        {updating === report.id && <Loader2 size={11} className="animate-spin" />}
                        Analisar
                      </button>
                    )}
                    {report.status !== "resolved" && (
                      <button onClick={() => updateStatus(report.id, "resolved")}
                        disabled={updating === report.id}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                        {updating === report.id && <Loader2 size={11} className="animate-spin" />}
                        Resolver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
