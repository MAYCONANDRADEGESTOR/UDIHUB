"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, MessageCircle, CreditCard, Target, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Metrics {
  totalProfessionals: number;
  activeProfessionals: number;
  proProfessionals: number;
  totalClients: number;
  totalLeads: number;
  leadsToday: number;
  leadsWeek: number;
  leadsMonth: number;
  monthlyRevenue: number;
  totalReports: number;
  pendingReports: number;
}

export default function AdminMetricasPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMetrics(); }, []);

  async function loadMetrics() {
    const supabase = createClient();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      totalProf, activeProf, proProf,
      totalClients, totalLeads, leadsToday,
      leadsWeek, leadsMonth, subscriptions,
      totalReports, pendingReports,
    ] = await Promise.all([
      supabase.from("professionals").select("id", { count: "exact", head: true }),
      supabase.from("professionals").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("professionals").select("id", { count: "exact", head: true }).eq("plan", "pro"),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
      supabase.from("subscriptions").select("plan").eq("status", "active"),
      supabase.from("reports").select("id", { count: "exact", head: true }),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    const revenue = (subscriptions.data || []).reduce((acc, s) => acc + (s.plan === "pro" ? 99 : 69), 0);

    setMetrics({
      totalProfessionals: totalProf.count || 0,
      activeProfessionals: activeProf.count || 0,
      proProfessionals: proProf.count || 0,
      totalClients: totalClients.count || 0,
      totalLeads: totalLeads.count || 0,
      leadsToday: leadsToday.count || 0,
      leadsWeek: leadsWeek.count || 0,
      leadsMonth: leadsMonth.count || 0,
      monthlyRevenue: revenue,
      totalReports: totalReports.count || 0,
      pendingReports: pendingReports.count || 0,
    });
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  const m = metrics!;
  const meta275 = Math.round((m.activeProfessionals / 275) * 100);

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground">Métricas</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Revenue + Leads hoje */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} style={{ color: "#22c55e" }} />
              <span className="text-xs text-muted">Receita mensal</span>
            </div>
            <div className="font-syne font-extrabold text-2xl" style={{ color: "#22c55e" }}>
              R${m.monthlyRevenue.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-muted mt-1">{m.activeProfessionals} assinantes ativos</div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={14} style={{ color: "#3B82F6" }} />
              <span className="text-xs text-muted">Leads hoje</span>
            </div>
            <div className="font-syne font-extrabold text-2xl text-foreground">{m.leadsToday}</div>
            <div className="text-[10px] text-muted mt-1">{m.leadsMonth} este mês</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Profissionais", value: m.totalProfessionals, color: "#3B82F6" },
            { label: "Clientes", value: m.totalClients, color: "#a855f7" },
            { label: "Plano Pro", value: m.proProfessionals, color: "#f59e0b" },
            { label: "Leads semana", value: m.leadsWeek, color: "#22c55e" },
            { label: "Total leads", value: m.totalLeads, color: "#3B82F6" },
            { label: "Denúncias", value: m.pendingReports, color: m.pendingReports > 0 ? "#ef4444" : "#A1A1AA" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-2xl text-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="font-syne font-bold text-xl" style={{ color }}>{value}</div>
              <div className="text-[10px] text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Meta progress */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={14} style={{ color: "#3B82F6" }} />
              <span className="font-syne font-bold text-sm text-foreground">Meta ano 1 — 275 assinantes</span>
            </div>
            <span className="text-sm font-bold" style={{ color: "#3B82F6" }}>{meta275}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "#1F1F23" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(meta275, 100)}%`, background: "linear-gradient(90deg, #3B82F6, #22c55e)" }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted">{m.activeProfessionals} ativos</span>
            <span className="text-xs text-muted">275 meta</span>
          </div>
        </div>

        {/* Leads chart */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: "#3B82F6" }} />
            <h2 className="font-syne font-bold text-sm text-foreground">Leads por período</h2>
          </div>
          <div className="flex items-end gap-4 h-20">
            {[
              { label: "Hoje", value: m.leadsToday, max: m.leadsMonth || 1 },
              { label: "Semana", value: m.leadsWeek, max: m.leadsMonth || 1 },
              { label: "Mês", value: m.leadsMonth, max: m.leadsMonth || 1 },
              { label: "Total", value: m.totalLeads, max: m.totalLeads || 1 },
            ].map(({ label, value, max }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold" style={{ color: "#3B82F6" }}>{value}</span>
                <div className="w-full rounded-t-md"
                  style={{ height: `${Math.max(Math.round((value / max) * 64), 4)}px`, background: "linear-gradient(180deg, #3B82F6, #1d4ed8)", minHeight: 4 }} />
                <span className="text-[9px] text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Projections */}
        <div className="p-4 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <h2 className="font-syne font-bold text-sm text-white mb-3">🎯 Projeções de receita</h2>
          <div className="space-y-2">
            {[
              { label: "50 assinantes", value: "R$3.450/mês", reached: m.activeProfessionals >= 50 },
              { label: "100 assinantes", value: "R$6.900/mês", reached: m.activeProfessionals >= 100 },
              { label: "275 assinantes (meta)", value: "R$18.975/mês", reached: m.activeProfessionals >= 275 },
              { label: "500 assinantes", value: "R$34.500/mês", reached: m.activeProfessionals >= 500 },
            ].map(({ label, value, reached }) => (
              <div key={label} className="flex items-center justify-between py-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2">
                  {reached && <span className="text-[10px]">✅</span>}
                  <span className="text-xs" style={{ color: reached ? "#22c55e" : "#93c5fd" }}>{label}</span>
                </div>
                <span className="text-xs font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
