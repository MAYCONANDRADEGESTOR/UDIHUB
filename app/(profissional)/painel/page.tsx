"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle, Eye, Star, User,
  Image, CreditCard, ArrowUpRight, Loader2, TrendingUp
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  leadsToday: number;
  leadsWeek: number;
  leadsMonth: number;
  viewsMonth: number;
  avgRating: number;
  totalReviews: number;
  plan: string;
  availableNow: boolean;
  professionalId: string;
}

interface RecentLead {
  city: string;
  neighborhood: string;
  created_at: string;
}

export default function PainelPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: prof } = await supabase
        .from("professionals")
        .select("id, avg_rating, views_count, plan, available_now")
        .eq("user_id", user.id)
        .single();

      if (!prof) { router.push("/seja-profissional"); return; }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [leadsToday, leadsWeek, leadsMonth, reviews, leads] = await Promise.all([
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", prof.id).gte("created_at", todayStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", prof.id).gte("created_at", weekStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", prof.id).gte("created_at", monthStart),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("professional_id", prof.id),
        supabase.from("whatsapp_clicks").select("city, neighborhood, created_at").eq("professional_id", prof.id).order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        leadsToday: leadsToday.count || 0,
        leadsWeek: leadsWeek.count || 0,
        leadsMonth: leadsMonth.count || 0,
        viewsMonth: prof.views_count || 0,
        avgRating: prof.avg_rating || 0,
        totalReviews: reviews.count || 0,
        plan: prof.plan,
        availableNow: prof.available_now,
        professionalId: prof.id,
      });
      setRecentLeads(leads.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleAvailable() {
    if (!stats) return;
    setToggling(true);
    const supabase = createClient();
    await supabase.from("professionals")
      .update({ available_now: !stats.availableNow })
      .eq("id", stats.professionalId);
    setStats({ ...stats, availableNow: !stats.availableNow });
    setToggling(false);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (h < 1) return "Agora há pouco";
    if (h < 24) return `há ${h}h`;
    if (d === 1) return "Ontem";
    return `há ${d} dias`;
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-bold text-xl text-foreground">Painel</h1>
            <p className="text-xs text-muted mt-0.5">Bem-vindo de volta 👋</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle disponível */}
            <button onClick={toggleAvailable} disabled={toggling}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: stats?.availableNow ? "rgba(34,197,94,0.15)" : "rgba(161,161,170,0.1)",
                border: stats?.availableNow ? "1px solid rgba(34,197,94,0.3)" : "1px solid #1F1F23",
                color: stats?.availableNow ? "#22c55e" : "#A1A1AA",
              }}>
              <span className={`w-1.5 h-1.5 rounded-full ${stats?.availableNow ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
              {stats?.availableNow ? "Disponível" : "Indisponível"}
            </button>
            {stats?.plan === "pro" && (
              <div className="px-2 py-1 rounded-lg" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <span className="badge-pro">PRO</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Lead cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Leads hoje", value: stats?.leadsToday || 0, color: "#22c55e" },
            { label: "Semana", value: stats?.leadsWeek || 0, color: "#3B82F6" },
            { label: "Mês", value: stats?.leadsMonth || 0, color: "#a855f7" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-2xl text-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="font-syne font-extrabold text-2xl" style={{ color }}>{value}</div>
              <div className="text-[10px] text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Views & rating */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.1)" }}>
              <Eye size={16} style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <div className="font-syne font-bold text-lg text-foreground">{stats?.viewsMonth || 0}</div>
              <div className="text-[10px] text-muted">Visualizações</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(251,191,36,0.1)" }}>
              <Star size={16} style={{ color: "#FBBF24" }} />
            </div>
            <div>
              <div className="font-syne font-bold text-lg text-foreground">
                {stats?.avgRating ? stats.avgRating.toFixed(1) : "—"}
              </div>
              <div className="text-[10px] text-muted">{stats?.totalReviews || 0} avaliações</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-syne font-bold text-sm text-foreground mb-3">Gerenciar</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/painel/perfil", icon: User, label: "Editar perfil", desc: "Atualizar dados" },
              { href: "/painel/fotos", icon: Image, label: "Fotos", desc: "Gerenciar galeria" },
              { href: "/painel/avaliacoes", icon: Star, label: "Avaliações", desc: "Ver e responder" },
              { href: "/painel/assinatura", icon: CreditCard, label: "Assinatura", desc: "Gerenciar plano" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="card-hover p-4 rounded-2xl" style={{ background: "#111113" }}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(59,130,246,0.1)" }}>
                    <Icon size={16} style={{ color: "#3B82F6" }} />
                  </div>
                  <ArrowUpRight size={12} className="text-muted" />
                </div>
                <div className="mt-3">
                  <div className="font-semibold text-sm text-foreground">{label}</div>
                  <div className="text-[10px] text-muted mt-0.5">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent leads */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-syne font-bold text-sm text-foreground">Leads recentes</h2>
            <Link href="/painel/leads" className="text-xs font-medium flex items-center gap-1"
              style={{ color: "#3B82F6" }}>
              Ver todos <ArrowUpRight size={10} />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-8 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <TrendingUp size={24} className="text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">Nenhum lead ainda</p>
              <p className="text-xs text-muted mt-1">Complete seu perfil para aparecer nas buscas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(34,197,94,0.1)" }}>
                    <MessageCircle size={14} style={{ color: "#22c55e" }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{lead.neighborhood || "—"}</div>
                    <div className="text-xs text-muted">{lead.city || "Uberlândia"}</div>
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
