"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, Eye, MessageCircle, Star, Loader2, UserCheck, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DayData {
  dia: string;
  cadastros: number;
  profissionais: number;
  clientes: number;
}

interface ViewData {
  dia: string;
  total_views: number;
  visitantes_unicos: number;
}

interface LeadData {
  dia: string;
  total_leads: number;
}

export default function AdminMetricasPage() {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"7" | "30" | "90">("30");
  const [cadastrosDia, setCadastrosDia] = useState<DayData[]>([]);
  const [viewsDia, setViewsDia] = useState<ViewData[]>([]);
  const [leadsDia, setLeadsDia] = useState<LeadData[]>([]);
  const [totais, setTotais] = useState({
    totalUsuarios: 0,
    totalProfissionais: 0,
    totalClientes: 0,
    totalViews: 0,
    totalLeads: 0,
    totalAvaliacoes: 0,
    cadastrosHoje: 0,
    cadastrosSemana: 0,
    cadastrosMes: 0,
    leadsHoje: 0,
    leadsSemana: 0,
    leadsMes: 0,
    viewsHoje: 0,
    viewsSemana: 0,
    viewsMes: 0,
  });

  useEffect(() => { loadMetrics(); }, [periodo]);

  async function loadMetrics() {
    setLoading(true);
    const supabase = createClient();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const periodoStart = new Date(now.getTime() - parseInt(periodo) * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalUsers, totalProfs, totalClients,
      totalViews, totalLeads, totalAvaliacoes,
      cadastrosHoje, cadastrosSemana, cadastrosMes,
      leadsHoje, leadsSemana, leadsMes,
      viewsHoje, viewsSemana, viewsMes,
      cadastrosDiaData, viewsDiaData, leadsDiaData,
    ] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "professional"),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("profile_views").select("id", { count: "exact", head: true }),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
      supabase.from("profile_views").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("profile_views").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("profile_views").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
      // Dados por dia para gráficos
      supabase.rpc("get_cadastros_por_dia", { dias: parseInt(periodo) }).catch(() => ({ data: null })),
      supabase.rpc("get_views_por_dia", { dias: parseInt(periodo) }).catch(() => ({ data: null })),
      supabase.rpc("get_leads_por_dia", { dias: parseInt(periodo) }).catch(() => ({ data: null })),
    ]);

    setTotais({
      totalUsuarios: totalUsers.count || 0,
      totalProfissionais: totalProfs.count || 0,
      totalClientes: totalClients.count || 0,
      totalViews: totalViews.count || 0,
      totalLeads: totalLeads.count || 0,
      totalAvaliacoes: totalAvaliacoes.count || 0,
      cadastrosHoje: cadastrosHoje.count || 0,
      cadastrosSemana: cadastrosSemana.count || 0,
      cadastrosMes: cadastrosMes.count || 0,
      leadsHoje: leadsHoje.count || 0,
      leadsSemana: leadsSemana.count || 0,
      leadsMes: leadsMes.count || 0,
      viewsHoje: viewsHoje.count || 0,
      viewsSemana: viewsSemana.count || 0,
      viewsMes: viewsMes.count || 0,
    });

    // Fallback manual se RPC não existir
    if (!cadastrosDiaData.data) {
      const { data } = await supabase
        .from("users")
        .select("created_at, role")
        .gte("created_at", periodoStart)
        .order("created_at", { ascending: true });

      if (data) {
        const grouped: Record<string, DayData> = {};
        data.forEach((u: any) => {
          const dia = u.created_at.slice(0, 10);
          if (!grouped[dia]) grouped[dia] = { dia, cadastros: 0, profissionais: 0, clientes: 0 };
          grouped[dia].cadastros++;
          if (u.role === "professional") grouped[dia].profissionais++;
          if (u.role === "client") grouped[dia].clientes++;
        });
        setCadastrosDia(Object.values(grouped));
      }
    } else {
      setCadastrosDia(cadastrosDiaData.data || []);
    }

    if (!viewsDiaData.data) {
      const { data } = await supabase
        .from("profile_views")
        .select("created_at, viewer_id")
        .gte("created_at", periodoStart)
        .order("created_at", { ascending: true });

      if (data) {
        const grouped: Record<string, ViewData> = {};
        data.forEach((v: any) => {
          const dia = v.created_at.slice(0, 10);
          if (!grouped[dia]) grouped[dia] = { dia, total_views: 0, visitantes_unicos: 0 };
          grouped[dia].total_views++;
          if (v.viewer_id) grouped[dia].visitantes_unicos++;
        });
        setViewsDia(Object.values(grouped));
      }
    } else {
      setViewsDia(viewsDiaData.data || []);
    }

    if (!leadsDiaData.data) {
      const { data } = await supabase
        .from("whatsapp_clicks")
        .select("created_at")
        .gte("created_at", periodoStart)
        .order("created_at", { ascending: true });

      if (data) {
        const grouped: Record<string, LeadData> = {};
        data.forEach((l: any) => {
          const dia = l.created_at.slice(0, 10);
          if (!grouped[dia]) grouped[dia] = { dia, total_leads: 0 };
          grouped[dia].total_leads++;
        });
        setLeadsDia(Object.values(grouped));
      }
    } else {
      setLeadsDia(leadsDiaData.data || []);
    }

    setLoading(false);
  }

  function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  }

  function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="flex items-end gap-0.5 h-8">
        <div className="w-full rounded-sm transition-all"
          style={{ height: `${Math.max(pct, 5)}%`, background: color, opacity: 0.8 }} />
      </div>
    );
  }

  const maxCadastros = Math.max(...cadastrosDia.map(d => d.cadastros), 1);
  const maxViews = Math.max(...viewsDia.map(d => d.total_views), 1);
  const maxLeads = Math.max(...leadsDia.map(d => d.total_leads), 1);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Métricas</h1>
        <div className="flex gap-1">
          {(["7", "30", "90"] as const).map((p) => (
            <button key={p} onClick={() => setPeriodo(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
              style={{
                background: periodo === p ? "rgba(59,130,246,0.2)" : "#111113",
                border: periodo === p ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
                color: periodo === p ? "#3B82F6" : "#A1A1AA",
              }}>
              {p}d
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Totais gerais */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>TOTAIS GERAIS</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Usuários", value: totais.totalUsuarios, icon: <Users size={14} />, color: "#3B82F6" },
              { label: "Profissionais", value: totais.totalProfissionais, icon: <Briefcase size={14} />, color: "#a855f7" },
              { label: "Clientes", value: totais.totalClientes, icon: <UserCheck size={14} />, color: "#22c55e" },
              { label: "Visualizações", value: totais.totalViews, icon: <Eye size={14} />, color: "#f59e0b" },
              { label: "Leads", value: totais.totalLeads, icon: <MessageCircle size={14} />, color: "#22c55e" },
              { label: "Avaliações", value: totais.totalAvaliacoes, icon: <Star size={14} />, color: "#FBBF24" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="p-3 rounded-2xl text-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
                <div className="font-syne font-bold text-xl" style={{ color }}>{value}</div>
                <div className="text-[10px] text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cadastros por período */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} style={{ color: "#3B82F6" }} />
            <p className="font-syne font-bold text-sm text-foreground">Novos cadastros</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Hoje", value: totais.cadastrosHoje },
              { label: "7 dias", value: totais.cadastrosSemana },
              { label: "30 dias", value: totais.cadastrosMes },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-2 rounded-xl"
                style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <div className="font-syne font-bold text-lg" style={{ color: "#3B82F6" }}>{value}</div>
                <div className="text-[10px] text-muted">{label}</div>
              </div>
            ))}
          </div>
          {/* Mini gráfico */}
          {cadastrosDia.length > 0 && (
            <div>
              <div className="flex items-end gap-1 h-16">
                {cadastrosDia.slice(-parseInt(periodo)).map((d) => (
                  <div key={d.dia} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-sm"
                      style={{ height: `${Math.max((d.cadastros / maxCadastros) * 100, 5)}%`, background: "#3B82F6", opacity: 0.8, minHeight: "3px" }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted">{cadastrosDia[0]?.dia ? formatDate(cadastrosDia[0].dia) : ""}</span>
                <span className="text-[9px] text-muted">{cadastrosDia[cadastrosDia.length - 1]?.dia ? formatDate(cadastrosDia[cadastrosDia.length - 1].dia) : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* Visualizações de perfil */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-1">
            <Eye size={14} style={{ color: "#f59e0b" }} />
            <p className="font-syne font-bold text-sm text-foreground">Visualizações de perfil</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Hoje", value: totais.viewsHoje },
              { label: "7 dias", value: totais.viewsSemana },
              { label: "30 dias", value: totais.viewsMes },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-2 rounded-xl"
                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <div className="font-syne font-bold text-lg" style={{ color: "#f59e0b" }}>{value}</div>
                <div className="text-[10px] text-muted">{label}</div>
              </div>
            ))}
          </div>
          {viewsDia.length > 0 && (
            <div>
              <div className="flex items-end gap-1 h-16">
                {viewsDia.slice(-parseInt(periodo)).map((d) => (
                  <div key={d.dia} className="flex-1">
                    <div className="w-full rounded-sm"
                      style={{ height: `${Math.max((d.total_views / maxViews) * 100, 5)}%`, background: "#f59e0b", opacity: 0.8, minHeight: "3px" }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted">{viewsDia[0]?.dia ? formatDate(viewsDia[0].dia) : ""}</span>
                <span className="text-[9px] text-muted">{viewsDia[viewsDia.length - 1]?.dia ? formatDate(viewsDia[viewsDia.length - 1].dia) : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* Leads WhatsApp */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={14} style={{ color: "#22c55e" }} />
            <p className="font-syne font-bold text-sm text-foreground">Leads via WhatsApp</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Hoje", value: totais.leadsHoje },
              { label: "7 dias", value: totais.leadsSemana },
              { label: "30 dias", value: totais.leadsMes },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-2 rounded-xl"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div className="font-syne font-bold text-lg" style={{ color: "#22c55e" }}>{value}</div>
                <div className="text-[10px] text-muted">{label}</div>
              </div>
            ))}
          </div>
          {leadsDia.length > 0 && (
            <div>
              <div className="flex items-end gap-1 h-16">
                {leadsDia.slice(-parseInt(periodo)).map((d) => (
                  <div key={d.dia} className="flex-1">
                    <div className="w-full rounded-sm"
                      style={{ height: `${Math.max((d.total_leads / maxLeads) * 100, 5)}%`, background: "#22c55e", opacity: 0.8, minHeight: "3px" }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted">{leadsDia[0]?.dia ? formatDate(leadsDia[0].dia) : ""}</span>
                <span className="text-[9px] text-muted">{leadsDia[leadsDia.length - 1]?.dia ? formatDate(leadsDia[leadsDia.length - 1].dia) : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de cadastros por dia */}
        {cadastrosDia.length > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>CADASTROS POR DIA</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="grid grid-cols-4 px-4 py-2 text-[10px] font-bold text-muted uppercase"
                style={{ borderBottom: "1px solid #1F1F23" }}>
                <span>Data</span>
                <span className="text-center">Total</span>
                <span className="text-center" style={{ color: "#a855f7" }}>Profs</span>
                <span className="text-center" style={{ color: "#22c55e" }}>Clientes</span>
              </div>
              {[...cadastrosDia].reverse().slice(0, 15).map((d) => (
                <div key={d.dia} className="grid grid-cols-4 px-4 py-2.5 text-xs"
                  style={{ borderBottom: "1px solid #0f0f11" }}>
                  <span className="text-muted">{formatDate(d.dia)}</span>
                  <span className="text-center font-bold text-foreground">{d.cadastros}</span>
                  <span className="text-center" style={{ color: "#a855f7" }}>{d.profissionais}</span>
                  <span className="text-center" style={{ color: "#22c55e" }}>{d.clientes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aviso Google Analytics */}
        <div className="p-4 rounded-2xl" style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#93c5fd" }}>💡 Quer ver acessos à home e busca?</p>
          <p className="text-xs text-muted leading-relaxed">
            Instale o Google Analytics para rastrear quantas pessoas acessam cada página, de onde vêm e quanto tempo ficam. É gratuito e leva 15 minutos para configurar.
          </p>
        </div>

      </div>
    </div>
  );
}
