"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, TrendingUp, Eye, MessageCircle, Star, Loader2, UserCheck, Briefcase, CreditCard, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ASAAS_FIXED = 0.99;
const ASAAS_PERCENT = 0.0139;

// Preços reais do modelo Freemium. "pro" e "basic" mantidos como legado,
// apenas como fallback de segurança — não devem ser atribuídos a ninguém.
const PLAN_PRICE: Record<string, number> = {
  professional: 59.90,
  professional_annual: 499.90,
  pro: 99,
  basic: 69,
};

function calcNet(valor: number) {
  return valor - (valor * ASAAS_PERCENT + ASAAS_FIXED);
}

function fmt2(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtK(v: number) {
  if (v >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return `R$${fmt2(v)}`;
}

interface DayData { dia: string; cadastros: number; profissionais: number; clientes: number; }
interface ViewData { dia: string; total_views: number; }
interface LeadData { dia: string; total_leads: number; }

const CIDADES_PROJECAO = [
  { nome: "Uberlândia", populacao: "700k", potencial: 500, ativo: true },
  { nome: "Uberaba", populacao: "340k", potencial: 250, ativo: false },
  { nome: "Patos de Minas", populacao: "160k", potencial: 120, ativo: false },
  { nome: "Ituiutaba", populacao: "110k", potencial: 80, ativo: false },
  { nome: "Araguari", populacao: "120k", potencial: 90, ativo: false },
  { nome: "Frutal", populacao: "60k", potencial: 50, ativo: false },
  { nome: "Araxá", populacao: "110k", potencial: 80, ativo: false },
  { nome: "Monte Carmelo", populacao: "50k", potencial: 40, ativo: false },
];

export default function AdminMetricasPage() {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"7" | "30" | "90">("30");
  const [mixPlanos, setMixPlanos] = useState(50); // % de Profissional (vs Gratuito não conta aqui — mix é entre planos pagos)
  const [cidadesAtivas, setCidadesAtivas] = useState<string[]>(["Uberlândia"]);
  const [cadastrosDia, setCadastrosDia] = useState<DayData[]>([]);
  const [viewsDia, setViewsDia] = useState<ViewData[]>([]);
  const [leadsDia, setLeadsDia] = useState<LeadData[]>([]);
  const [totais, setTotais] = useState({
    totalUsuarios: 0, totalProfissionais: 0, totalClientes: 0,
    totalViews: 0, totalLeads: 0, totalAvaliacoes: 0,
    cadastrosHoje: 0, cadastrosSemana: 0, cadastrosMes: 0,
    leadsHoje: 0, leadsSemana: 0, leadsMes: 0,
    viewsHoje: 0, viewsSemana: 0, viewsMes: 0,
    freeProfissionais: 0, profissionalAtivos: 0, anualAtivos: 0,
    receitaBruta: 0, receitaLiquida: 0, taxasAsaas: 0,
  });

  useEffect(() => { loadMetrics(); }, [periodo]);

  async function loadMetrics() {
    setLoading(true);
    try {
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
        subscriptions, freeProfs, usersData, viewsData, leadsData,
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
        supabase.from("subscriptions").select("plan").eq("status", "active"),
        supabase.from("professionals").select("id", { count: "exact", head: true }).in("plan", ["free", "basic"]),
        supabase.from("users").select("created_at, role").gte("created_at", periodoStart).order("created_at", { ascending: true }),
        supabase.from("profile_views").select("created_at").gte("created_at", periodoStart).order("created_at", { ascending: true }),
        supabase.from("whatsapp_clicks").select("created_at").gte("created_at", periodoStart).order("created_at", { ascending: true }),
      ]);

      // Calcular receita real com preços do modelo Freemium.
      // Linhas com plan="free" não geram receita e são ignoradas aqui
      // (não deveriam existir como subscription ativa, mas por segurança).
      let bruta = 0, liquida = 0, taxas = 0, profissionalAtivos = 0, anualAtivos = 0;
      for (const s of subscriptions.data || []) {
        const price = PLAN_PRICE[s.plan as string];
        if (!price) continue; // ex: plan="free" não tem preço, ignora
        const net = calcNet(price);
        bruta += price;
        liquida += net;
        taxas += price - net;
        if (s.plan === "professional_annual") anualAtivos++;
        else profissionalAtivos++;
      }

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
        freeProfissionais: freeProfs.count || 0,
        profissionalAtivos, anualAtivos,
        receitaBruta: bruta, receitaLiquida: liquida, taxasAsaas: taxas,
      });

      // Gráficos
      const cMap: Record<string, DayData> = {};
      for (const u of usersData.data || []) {
        const dia = u.created_at.slice(0, 10);
        if (!cMap[dia]) cMap[dia] = { dia, cadastros: 0, profissionais: 0, clientes: 0 };
        cMap[dia].cadastros++;
        if (u.role === "professional") cMap[dia].profissionais++;
        if (u.role === "client") cMap[dia].clientes++;
      }
      setCadastrosDia(Object.values(cMap));

      const vMap: Record<string, ViewData> = {};
      for (const v of viewsData.data || []) {
        const dia = v.created_at.slice(0, 10);
        if (!vMap[dia]) vMap[dia] = { dia, total_views: 0 };
        vMap[dia].total_views++;
      }
      setViewsDia(Object.values(vMap));

      const lMap: Record<string, LeadData> = {};
      for (const l of leadsData.data || []) {
        const dia = l.created_at.slice(0, 10);
        if (!lMap[dia]) lMap[dia] = { dia, total_leads: 0 };
        lMap[dia].total_leads++;
      }
      setLeadsDia(Object.values(lMap));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(d: string) {
    const [, m, day] = d.split("-");
    return `${day}/${m}`;
  }

  // Cálculo de projeção: assume que todos os "assinantes" simulados são pagantes
  // (Profissional mensal ou Anual), mix entre os dois conforme o slider.
  function calcProjecao(totalAssinantes: number, pctAnual: number) {
    const anual = Math.round(totalAssinantes * (pctAnual / 100));
    const mensal = totalAssinantes - anual;
    const bruto = (anual * PLAN_PRICE.professional_annual / 12) + (mensal * PLAN_PRICE.professional);
    const liquido = (anual * calcNet(PLAN_PRICE.professional_annual) / 12) + (mensal * calcNet(PLAN_PRICE.professional));
    return { mensal, anual, bruto, liquido };
  }

  const potencialCidadesAtivas = CIDADES_PROJECAO
    .filter(c => cidadesAtivas.includes(c.nome))
    .reduce((acc, c) => acc + c.potencial, 0);
  const projecaoCidades = calcProjecao(potencialCidadesAtivas, mixPlanos);

  const totalAtivos = totais.profissionalAtivos + totais.anualAtivos;
  const cenarios = [
    { label: "Atual", assinantes: totalAtivos, pctAnual: totalAtivos > 0 ? Math.round((totais.anualAtivos / totalAtivos) * 100) : mixPlanos },
    { label: "50 assinantes", assinantes: 50, pctAnual: mixPlanos },
    { label: "100 assinantes", assinantes: 100, pctAnual: mixPlanos },
    { label: "275 assinantes", assinantes: 275, pctAnual: mixPlanos },
    { label: "500 assinantes", assinantes: 500, pctAnual: mixPlanos },
  ];

  const maxCadastros = Math.max(...cadastrosDia.map(d => d.cadastros), 1);
  const maxViews = Math.max(...viewsDia.map(d => d.total_views), 1);
  const maxLeads = Math.max(...leadsDia.map(d => d.total_leads), 1);
  const meta275pct = Math.round((totalAtivos / 275) * 100);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Métricas & Projeções</h1>
        <div className="flex gap-1">
          {(["7", "30", "90"] as const).map((p) => (
            <button key={p} onClick={() => setPeriodo(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
              style={{
                background: periodo === p ? "rgba(59,130,246,0.2)" : "#111113",
                border: periodo === p ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
                color: periodo === p ? "#3B82F6" : "#A1A1AA",
              }}>{p}d</button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">

        {/* ── FATURAMENTO ATUAL ── */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#22c55e" }}>💰 FATURAMENTO ATUAL</p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-3 rounded-2xl text-center" style={{ background: "#111113", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div className="text-[10px] text-muted mb-1">Bruto/mês</div>
              <div className="font-syne font-bold text-base" style={{ color: "#22c55e" }}>R${fmt2(totais.receitaBruta)}</div>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: "#111113", border: "1px solid rgba(34,197,94,0.5)" }}>
              <div className="text-[10px] text-muted mb-1">Líquido/mês</div>
              <div className="font-syne font-bold text-base" style={{ color: "#22c55e" }}>R${fmt2(totais.receitaLiquida)}</div>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: "#111113", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="text-[10px] text-muted mb-1">Taxa Asaas</div>
              <div className="font-syne font-bold text-base" style={{ color: "#f87171" }}>R${fmt2(totais.taxasAsaas)}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl space-y-3" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <p className="text-xs font-bold text-muted">Distribuição de planos</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                  style={{ background: "rgba(161,161,170,0.1)", color: "#A1A1AA", border: "1px solid rgba(161,161,170,0.2)" }}>
                  Gratuito
                </span>
                <span className="text-sm font-bold text-foreground">{totais.freeProfissionais}x</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-muted">R$0</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                  style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" }}>
                  Profissional R$59,90
                </span>
                <span className="text-sm font-bold text-foreground">{totais.profissionalAtivos}x</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: "#3B82F6" }}>R${fmt2(totais.profissionalAtivos * PLAN_PRICE.professional)}</div>
                <div className="text-[10px]" style={{ color: "#22c55e" }}>→ R${fmt2(totais.profissionalAtivos * calcNet(PLAN_PRICE.professional))} líq.</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" }}>
                  👑 Anual R$499,90
                </span>
                <span className="text-sm font-bold text-foreground">{totais.anualAtivos}x</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: "#FBBF24" }}>R${fmt2(totais.anualAtivos * PLAN_PRICE.professional_annual)}</div>
                <div className="text-[10px]" style={{ color: "#22c55e" }}>→ R${fmt2(totais.anualAtivos * calcNet(PLAN_PRICE.professional_annual))} líq.</div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #1F1F23" }} className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Total líquido/mês</span>
              <span className="text-base font-syne font-extrabold" style={{ color: "#22c55e" }}>
                R${fmt2(totais.receitaLiquida)}
              </span>
            </div>
          </div>
        </div>

        {/* ── META 275 ── */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: "#3B82F6" }} />
              <span className="font-syne font-bold text-sm text-foreground">Meta ano 1 — Uberlândia</span>
            </div>
            <span className="text-sm font-bold" style={{ color: "#3B82F6" }}>{meta275pct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "#1F1F23" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(meta275pct, 100)}%`, background: "linear-gradient(90deg, #3B82F6, #22c55e)" }} />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-muted">{totalAtivos} pagantes ({totais.profissionalAtivos} mensal · {totais.anualAtivos} anual) · {totais.freeProfissionais} gratuito</span>
            <span className="text-[10px] text-muted">275 meta</span>
          </div>
        </div>

        {/* ── PROJEÇÃO DE RECEITA ── */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#3B82F6" }}>📈 PROJEÇÃO DE RECEITA</p>
          <p className="text-[10px] text-muted mb-3">Simula apenas profissionais pagantes (Gratuito não entra na receita)</p>

          <div className="p-3 rounded-2xl mb-3" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted">Mix de planos pagos</span>
              <span className="text-xs font-bold text-foreground">
                {100 - mixPlanos}% Mensal · {mixPlanos}% Anual
              </span>
            </div>
            <input type="range" min={0} max={100} value={mixPlanos}
              onChange={(e) => setMixPlanos(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #FBBF24 ${mixPlanos}%, #1F1F23 ${mixPlanos}%)` }} />
            <div className="flex justify-between mt-1">
              <span className="text-[9px]" style={{ color: "#93c5fd" }}>100% Mensal</span>
              <span className="text-[9px]" style={{ color: "#FBBF24" }}>100% Anual</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="grid grid-cols-4 px-3 py-2 text-[10px] font-bold text-muted uppercase"
              style={{ borderBottom: "1px solid #1F1F23" }}>
              <span>Cenário</span>
              <span className="text-center">Mensal/Anual</span>
              <span className="text-center">Bruto/mês</span>
              <span className="text-center" style={{ color: "#22c55e" }}>Líquido/mês</span>
            </div>
            {cenarios.map(({ label, assinantes, pctAnual }) => {
              const p = calcProjecao(assinantes, pctAnual);
              const isAtual = label === "Atual";
              return (
                <div key={label} className="grid grid-cols-4 px-3 py-2.5 text-xs"
                  style={{
                    borderBottom: "1px solid #0f0f11",
                    background: isAtual ? "rgba(59,130,246,0.05)" : "transparent"
                  }}>
                  <span className="font-semibold" style={{ color: isAtual ? "#93c5fd" : "#A1A1AA" }}>
                    {isAtual ? "🔴 Atual" : label}
                  </span>
                  <span className="text-center text-muted text-[10px]">{p.mensal}/{p.anual}</span>
                  <span className="text-center font-medium text-foreground">{fmtK(p.bruto)}</span>
                  <span className="text-center font-bold" style={{ color: "#22c55e" }}>{fmtK(p.liquido)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PROJEÇÃO POR CIDADES ── */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#a855f7" }}>🗺️ PROJEÇÃO POR CIDADES</p>
          <p className="text-[10px] text-muted mb-3">Selecione as cidades para simular o potencial total (apenas pagantes)</p>

          <div className="space-y-2 mb-3">
            {CIDADES_PROJECAO.map((cidade) => {
              const ativa = cidadesAtivas.includes(cidade.nome);
              const p = calcProjecao(cidade.potencial, mixPlanos);
              return (
                <button key={cidade.nome} type="button"
                  onClick={() => {
                    if (cidade.nome === "Uberlândia") return;
                    setCidadesAtivas(prev =>
                      ativa ? prev.filter(c => c !== cidade.nome) : [...prev, cidade.nome]
                    );
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{
                    background: ativa ? "rgba(168,85,247,0.08)" : "#111113",
                    border: ativa ? "1px solid rgba(168,85,247,0.3)" : "1px solid #1F1F23",
                    cursor: cidade.nome === "Uberlândia" ? "default" : "pointer",
                  }}>
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: ativa ? "#a855f7" : "#1F1F23", border: `1px solid ${ativa ? "#a855f7" : "#374151"}` }}>
                      {ativa && <span className="text-white text-[9px]">✓</span>}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{cidade.nome}</span>
                        {cidade.nome === "Uberlândia" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>ATIVO</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted">{cidade.populacao} hab · potencial {cidade.potencial} profissionais</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold" style={{ color: ativa ? "#a855f7" : "#374151" }}>{fmtK(p.bruto)}</div>
                    <div className="text-[10px]" style={{ color: ativa ? "#22c55e" : "#374151" }}>{fmtK(p.liquido)} líq.</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.3)" }}>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} style={{ color: "#a855f7" }} />
              <span className="font-syne font-bold text-sm text-foreground">
                {cidadesAtivas.length} cidade{cidadesAtivas.length !== 1 ? "s" : ""} ativa{cidadesAtivas.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="text-[10px] text-muted mb-1">Potencial total</div>
                <div className="font-syne font-bold text-lg" style={{ color: "#a855f7" }}>{potencialCidadesAtivas}</div>
                <div className="text-[10px] text-muted">profissionais</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="text-[10px] text-muted mb-1">Receita potencial</div>
                <div className="font-syne font-bold text-lg" style={{ color: "#22c55e" }}>{fmtK(projecaoCidades.liquido)}</div>
                <div className="text-[10px] text-muted">líquido/mês</div>
              </div>
            </div>
            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(168,85,247,0.2)" }}>
              <span className="text-[10px] text-muted">{projecaoCidades.mensal} mensal + {projecaoCidades.anual} anual</span>
              <span className="text-[10px] font-bold" style={{ color: "#a855f7" }}>
                {fmtK(projecaoCidades.bruto)} bruto → {fmtK(projecaoCidades.liquido)} líquido
              </span>
            </div>
          </div>
        </div>

        {/* ── TOTAIS GERAIS ── */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>📊 TOTAIS GERAIS</p>
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

        {/* ── CADASTROS ── */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-3">
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
          {cadastrosDia.length > 0 ? (
            <div>
              <div className="flex items-end gap-1 h-14">
                {cadastrosDia.map((d) => (
                  <div key={d.dia} className="flex-1 flex flex-col justify-end">
                    <div className="w-full rounded-sm"
                      style={{ height: `${Math.max((d.cadastros / maxCadastros) * 100, 5)}%`, background: "#3B82F6", opacity: 0.8 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted">{cadastrosDia[0]?.dia ? formatDate(cadastrosDia[0].dia) : ""}</span>
                <span className="text-[9px] text-muted">{cadastrosDia[cadastrosDia.length - 1]?.dia ? formatDate(cadastrosDia[cadastrosDia.length - 1].dia) : ""}</span>
              </div>
            </div>
          ) : <p className="text-xs text-muted text-center py-2">Nenhum cadastro no período</p>}
        </div>

        {/* ── VISUALIZAÇÕES ── */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-3">
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
          {viewsDia.length > 0 ? (
            <div>
              <div className="flex items-end gap-1 h-14">
                {viewsDia.map((d) => (
                  <div key={d.dia} className="flex-1 flex flex-col justify-end">
                    <div className="w-full rounded-sm"
                      style={{ height: `${Math.max((d.total_views / maxViews) * 100, 5)}%`, background: "#f59e0b", opacity: 0.8 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted">{viewsDia[0]?.dia ? formatDate(viewsDia[0].dia) : ""}</span>
                <span className="text-[9px] text-muted">{viewsDia[viewsDia.length - 1]?.dia ? formatDate(viewsDia[viewsDia.length - 1].dia) : ""}</span>
              </div>
            </div>
          ) : <p className="text-xs text-muted text-center py-2">Nenhuma visualização no período</p>}
        </div>

        {/* ── LEADS ── */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-3">
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
          {leadsDia.length > 0 ? (
            <div>
              <div className="flex items-end gap-1 h-14">
                {leadsDia.map((d) => (
                  <div key={d.dia} className="flex-1 flex flex-col justify-end">
                    <div className="w-full rounded-sm"
                      style={{ height: `${Math.max((d.total_leads / maxLeads) * 100, 5)}%`, background: "#22c55e", opacity: 0.8 }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted">{leadsDia[0]?.dia ? formatDate(leadsDia[0].dia) : ""}</span>
                <span className="text-[9px] text-muted">{leadsDia[leadsDia.length - 1]?.dia ? formatDate(leadsDia[leadsDia.length - 1].dia) : ""}</span>
              </div>
            </div>
          ) : <p className="text-xs text-muted text-center py-2">Nenhum lead no período</p>}
        </div>

      </div>
    </div>
  );
}
