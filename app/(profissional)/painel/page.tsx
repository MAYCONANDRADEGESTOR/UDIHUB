"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, MessageCircle, Star, TrendingUp, Settings,
  Crown, ChevronRight, Loader2, Heart, MapPin,
  Clock, BarChart3, Bell, Zap, Lock, Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

export default function PainelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prof, setProf] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    viewsHoje: 0, viewsSemana: 0, viewsMes: 0, viewsTotal: 0,
    leadsHoje: 0, leadsSemana: 0, leadsMes: 0, leadsTotal: 0,
    favoritosTotal: 0, avaliacoes: 0, avgRating: 0, conversionRate: 0,
  });
  const [periodo, setPeriodo] = useState<"7" | "30">("7");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/login"); return; }

      const { data: userData } = await supabase
        .from("users").select("name, email, avatar, role").eq("id", authUser.id).single();

      if (userData?.role !== "professional") { router.push("/inicio"); return; }
      setUser(userData);

      const { data: profData } = await supabase
        .from("professionals")
        .select(`id, slug, plan, status, avg_rating, views_count, available_now, bio, whatsapp, instagram,
          categories(name, icon, slug),
          subscriptions(status, next_billing, plan)`)
        .eq("user_id", authUser.id).single();

      if (!profData) { router.push("/seja-profissional"); return; }
      setProf(profData);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [
        viewsHoje, viewsSemana, viewsMes,
        leadsHoje, leadsSemana, leadsMes, leadsTotal,
        favoritosTotal, reviewsData,
      ] = await Promise.all([
        supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("professional_id", profData.id).gte("created_at", todayStart),
        supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("professional_id", profData.id).gte("created_at", weekStart),
        supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("professional_id", profData.id).gte("created_at", monthStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", profData.id).gte("created_at", todayStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", profData.id).gte("created_at", weekStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", profData.id).gte("created_at", monthStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", profData.id),
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("professional_id", profData.id),
        supabase.from("reviews").select("rating").eq("professional_id", profData.id),
      ]);

      const viewsT = profData.views_count || 0;
      const leadsT = leadsTotal.count || 0;
      const conv = viewsT > 0 ? Math.round((leadsT / viewsT) * 100) : 0;
      const avgRat = reviewsData.data?.length
        ? reviewsData.data.reduce((s: number, r: any) => s + r.rating, 0) / reviewsData.data.length
        : 0;

      setMetrics({
        viewsHoje: viewsHoje.count || 0, viewsSemana: viewsSemana.count || 0,
        viewsMes: viewsMes.count || 0, viewsTotal: viewsT,
        leadsHoje: leadsHoje.count || 0, leadsSemana: leadsSemana.count || 0,
        leadsMes: leadsMes.count || 0, leadsTotal: leadsT,
        favoritosTotal: favoritosTotal.count || 0,
        avaliacoes: reviewsData.data?.length || 0,
        avgRating: avgRat, conversionRate: conv,
      });
      setLoading(false);
    }
    load();
  }, []);

  async function toggleAvailable() {
    if (!prof) return;
    const supabase = createClient();
    await supabase.from("professionals").update({ available_now: !prof.available_now }).eq("id", prof.id);
    setProf({ ...prof, available_now: !prof.available_now });
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  const isPro = prof?.plan === "pro";
  const isActive = prof?.status === "active";
  const subscription = (prof?.subscriptions as any[])?.[0];
  const currentPeriod = periodo === "7"
    ? { views: metrics.viewsSemana, leads: metrics.leadsSemana }
    : { views: metrics.viewsMes, leads: metrics.leadsMes };
  const convPeriodo = currentPeriod.views > 0
    ? Math.round((currentPeriod.leads / currentPeriod.views) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(user?.avatar || prof?.avatar) ? (
              <img src={user?.avatar || prof?.avatar} alt={user?.name}
                className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                {getInitials(user?.name || "?")}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-syne font-bold text-sm text-foreground">{user?.name}</p>
                {isPro && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                    style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" }}>
                    <Crown size={8} /> PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">{(prof?.categories as any)?.icon} {(prof?.categories as any)?.name}</p>
            </div>
          </div>
          <Link href="/painel/perfil" className="p-2 rounded-xl"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <Settings size={16} className="text-muted" />
          </Link>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Status inativo */}
        {!isActive && (
          <div className="p-4 rounded-2xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="font-syne font-bold text-sm mb-1" style={{ color: "#f87171" }}>
              Perfil inativo — voce nao aparece nas buscas
            </p>
            <p className="text-xs text-muted mb-3">Ative sua assinatura para receber clientes.</p>
            <Link href="/painel/assinatura"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white"
              style={{ background: "#ef4444" }}>
              Ativar agora <ChevronRight size={12} />
            </Link>
          </div>
        )}

        {/* Disponivel */}
        {isActive && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${prof.available_now ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {prof.available_now ? "Disponivel agora" : "Indisponivel"}
                </p>
                <p className="text-xs text-muted">Aparece badge verde no perfil</p>
              </div>
            </div>
            <button onClick={toggleAvailable}
              className="w-11 h-6 rounded-full transition-all duration-200 relative"
              style={{ background: prof.available_now ? "#22c55e" : "#1F1F23" }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ left: prof.available_now ? "calc(100% - 20px)" : 4 }} />
            </button>
          </div>
        )}

        {/* Filtro periodo */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-widest text-muted">METRICAS</p>
          <div className="flex gap-1">
            {(["7", "30"] as const).map((p) => (
              <button key={p} onClick={() => setPeriodo(p)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: periodo === p ? "rgba(59,130,246,0.2)" : "#111113",
                  border: periodo === p ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
                  color: periodo === p ? "#3B82F6" : "#A1A1AA",
                }}>
                {p === "7" ? "7 dias" : "30 dias"}
              </button>
            ))}
          </div>
        </div>

        {/* Cards metricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2 mb-3">
              <Eye size={14} style={{ color: "#f59e0b" }} />
              <span className="text-xs text-muted">Visualizacoes</span>
            </div>
            <div className="font-syne font-extrabold text-3xl text-foreground mb-1">{currentPeriod.views}</div>
            <div className="text-[10px] text-muted">Hoje: {metrics.viewsHoje}</div>
            <div className="text-[10px] text-muted">Total: {metrics.viewsTotal}</div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={14} style={{ color: "#22c55e" }} />
              <span className="text-xs text-muted">Leads WhatsApp</span>
            </div>
            <div className="font-syne font-extrabold text-3xl text-foreground mb-1">{currentPeriod.leads}</div>
            <div className="text-[10px] text-muted">Hoje: {metrics.leadsHoje}</div>
            <div className="text-[10px] text-muted">Total: {metrics.leadsTotal}</div>
          </div>
        </div>

        {/* Metricas secundarias */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <TrendingUp size={14} style={{ color: "#3B82F6" }} className="mx-auto mb-1.5" />
            <div className="font-syne font-bold text-lg" style={{ color: "#3B82F6" }}>{convPeriodo}%</div>
            <div className="text-[10px] text-muted">Conversao</div>
          </div>
          <div className="p-3 rounded-2xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <Heart size={14} style={{ color: "#ef4444" }} className="mx-auto mb-1.5" />
            <div className="font-syne font-bold text-lg" style={{ color: "#ef4444" }}>{metrics.favoritosTotal}</div>
            <div className="text-[10px] text-muted">Favoritos</div>
          </div>
          <div className="p-3 rounded-2xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <Star size={14} style={{ color: "#FBBF24" }} className="mx-auto mb-1.5" />
            <div className="font-syne font-bold text-lg" style={{ color: "#FBBF24" }}>
              {metrics.avgRating > 0 ? metrics.avgRating.toFixed(1) : "—"}
            </div>
            <div className="text-[10px] text-muted">{metrics.avaliacoes} avaliacoes</div>
          </div>
        </div>

        {/* Funil */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} style={{ color: "#3B82F6" }} />
            <p className="font-syne font-bold text-sm text-foreground">Funil de conversao</p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Visualizaram seu perfil", value: currentPeriod.views, color: "#f59e0b", max: Math.max(currentPeriod.views, 1) },
              { label: "Clicaram no WhatsApp", value: currentPeriod.leads, color: "#22c55e", max: Math.max(currentPeriod.views, 1) },
            ].map(({ label, value, color, max }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-xs font-bold text-foreground">{value}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1F1F23" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max((value / max) * 100, value > 0 ? 5 : 0)}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-2 text-right">Taxa de conversao: {convPeriodo}%</p>
        </div>

        {/* Dicas */}
        {isActive && currentPeriod.views > 0 && currentPeriod.leads === 0 && (
          <div className="p-4 rounded-2xl"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Bell size={13} style={{ color: "#FBBF24" }} />
              <span className="text-xs font-bold" style={{ color: "#FBBF24" }}>Dica para melhorar</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Seu perfil teve {currentPeriod.views} visualizacao(oes) mas nenhum lead. Adicione foto e complete a bio.
            </p>
          </div>
        )}
        {isActive && currentPeriod.views === 0 && (
          <div className="p-4 rounded-2xl"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} style={{ color: "#3B82F6" }} />
              <span className="text-xs font-bold" style={{ color: "#3B82F6" }}>Como atrair mais clientes</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Complete seu perfil com foto, bio e bairros atendidos. Perfis completos recebem ate 3x mais visualizacoes.
            </p>
          </div>
        )}

        {/* Assinatura */}
        <div>
          <p className="text-xs font-bold tracking-widest text-muted mb-2">ASSINATURA</p>
          <div className="p-4 rounded-2xl"
            style={{ background: isPro ? "linear-gradient(135deg, #0F1729, #1a2f5a)" : "#111113", border: isPro ? "1px solid #3B82F6" : "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-syne font-bold text-sm text-foreground">
                    {isPro ? "Plano Pro" : "Plano Basico"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    style={{ background: isActive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: isActive ? "#22c55e" : "#f87171" }}>
                    {isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {isPro ? "R$99/mes" : "R$69/mes"}
                  {subscription?.next_billing && ` · Renova ${new Date(subscription.next_billing).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <Link href="/painel/assinatura"
                className="text-xs font-bold px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3B82F6" }}>
                Gerenciar
              </Link>
            </div>
            <div className="space-y-1.5">
              {isPro ? (
                <>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#93c5fd" }}><span>✓</span> Aparece PRIMEIRO nas buscas</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#93c5fd" }}><span>✓</span> Badge PRO em destaque</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#93c5fd" }}><span>✓</span> Ate 10 fotos na galeria</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#93c5fd" }}><span>✓</span> Metricas avancadas</div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-muted"><span>✓</span> Perfil ativo nas buscas</div>
                  <div className="flex items-center gap-2 text-xs text-muted"><span>✓</span> Leads direto no WhatsApp</div>
                  <div className="flex items-center gap-2 text-xs text-muted"><span>✓</span> Ate 3 fotos no perfil</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                    <Lock size={10} /> Aparecer primeiro — upgrade para Pro
                  </div>
                </>
              )}
            </div>
            {!isPro && isActive && (
              <Link href="/painel/assinatura"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                <Crown size={12} /> Fazer upgrade para Pro — R$99/mes
              </Link>
            )}
          </div>
        </div>

        {/* Acoes rapidas */}
        <div>
          <p className="text-xs font-bold tracking-widest text-muted mb-2">ACOES RAPIDAS</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/painel/perfil", icon: Settings, label: "Editar perfil", desc: "Foto, bio, bairros", color: "#3B82F6" },
              { href: `/profissional/${prof?.slug}`, icon: Eye, label: "Ver meu perfil", desc: "Como clientes veem", color: "#a855f7" },
              { href: "/painel/fotos", icon: Camera, label: "Minhas fotos", desc: "Galeria do perfil", color: "#f59e0b" },
              { href: "/painel/assinatura", icon: Crown, label: "Assinatura", desc: "Plano e pagamento", color: "#22c55e" },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p className="font-syne font-bold text-sm text-foreground">{label}</p>
                  <p className="text-[10px] text-muted mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Metricas avancadas PRO */}
        {isPro && (
          <div>
            <p className="text-xs font-bold tracking-widest text-muted mb-2">
              METRICAS AVANCADAS{" "}
              <span className="text-[9px] px-1.5 py-0.5 rounded ml-1"
                style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24" }}>PRO</span>
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <p className="text-xs font-bold text-muted mb-3">Comparativo de desempenho</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted mb-1">Periodo</p>
                    <p className="text-xs font-semibold text-foreground">7 dias</p>
                    <p className="text-xs font-semibold text-foreground">30 dias</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted mb-1">Views</p>
                    <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>{metrics.viewsSemana}</p>
                    <p className="text-sm font-bold" style={{ color: "#f59e0b" }}>{metrics.viewsMes}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted mb-1">Leads</p>
                    <p className="text-sm font-bold" style={{ color: "#22c55e" }}>{metrics.leadsSemana}</p>
                    <p className="text-sm font-bold" style={{ color: "#22c55e" }}>{metrics.leadsMes}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <p className="text-xs font-bold text-muted mb-3">Score do perfil</p>
                {(() => {
                  const checks = [
                    { label: "Foto de perfil", done: !!(user?.avatar || prof?.avatar) },
                    { label: "Bio preenchida", done: !!prof?.bio },
                    { label: "WhatsApp configurado", done: !!prof?.whatsapp },
                    { label: "Instagram adicionado", done: !!prof?.instagram },
                    { label: "Tem avaliacoes", done: metrics.avaliacoes > 0 },
                    { label: "Plano Pro ativo", done: isPro },
                  ];
                  const score = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
                  return (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-foreground">Perfil {score}% completo</span>
                        <span className="text-sm font-bold" style={{ color: score >= 80 ? "#22c55e" : score >= 50 ? "#FBBF24" : "#f87171" }}>{score}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "#1F1F23" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${score}%`, background: score >= 80 ? "#22c55e" : score >= 50 ? "#FBBF24" : "#f87171" }} />
                      </div>
                      <div className="space-y-1.5">
                        {checks.map(({ label, done }) => (
                          <div key={label} className="flex items-center gap-2 text-xs">
                            <span style={{ color: done ? "#22c55e" : "#374151" }}>{done ? "✓" : "○"}</span>
                            <span style={{ color: done ? "#A1A1AA" : "#64748b" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Bloquear basico */}
        {!isPro && (
          <div className="p-4 rounded-2xl relative overflow-hidden"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="absolute inset-0 flex items-center justify-center z-10"
              style={{ background: "rgba(9,9,11,0.85)", backdropFilter: "blur(4px)" }}>
              <div className="text-center px-4">
                <Lock size={20} style={{ color: "#3B82F6" }} className="mx-auto mb-2" />
                <p className="font-syne font-bold text-sm text-foreground mb-1">Metricas avancadas</p>
                <p className="text-xs text-muted mb-3">Score do perfil, comparativos e mais. Disponivel no Plano Pro.</p>
                <Link href="/painel/assinatura"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                  <Crown size={11} /> Fazer upgrade
                </Link>
              </div>
            </div>
            <div className="opacity-20 space-y-2 pointer-events-none">
              <p className="text-xs font-bold text-muted">Score do perfil</p>
              <div className="h-2 rounded-full" style={{ background: "#1F1F23" }} />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => <div key={i} className="h-8 rounded-xl" style={{ background: "#1F1F23" }} />)}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
