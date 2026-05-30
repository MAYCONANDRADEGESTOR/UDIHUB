"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle, Star, Camera, CreditCard, TrendingUp,
  Users, Zap, Target, Award, ChevronRight, Loader2,
  BookOpen, Lightbulb, Share2, Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  leadsTotal: number;
  leadsWeek: number;
  viewsTotal: number;
  avgRating: number;
  reviewsTotal: number;
  plan: string;
  status: string;
  coupon_code: string | null;
  trial_ends_at: string | null;
}

const TIPS = [
  {
    icon: Camera,
    color: "#3B82F6",
    title: "Adicione fotos do seu trabalho",
    desc: "Profissionais com fotos recebem até 3x mais contatos. Mostre seus melhores trabalhos!",
    action: "Adicionar fotos",
    href: "/painel/fotos",
  },
  {
    icon: Star,
    color: "#FBBF24",
    title: "Peça avaliações aos clientes",
    desc: "Após cada serviço, peça para o cliente avaliar seu perfil. Avaliações geram mais confiança.",
    action: "Ver avaliações",
    href: "/painel/avaliacoes",
  },
  {
    icon: Share2,
    color: "#22c55e",
    title: "Compartilhe seu perfil",
    desc: "Envie o link do seu perfil UDIHUB no seu WhatsApp, Instagram e cartão de visita.",
    action: "Ver meu perfil",
    href: "/painel/perfil",
  },
  {
    icon: Clock,
    color: "#a855f7",
    title: "Ative disponibilidade agora",
    desc: "Perfis marcados como 'disponível agora' aparecem com destaque nas buscas.",
    action: "Editar perfil",
    href: "/painel/perfil",
  },
];

const MARKETING_TIPS = [
  {
    icon: "📱",
    title: "Bio poderosa",
    desc: "Escreva uma bio clara: experiência, especialidade e diferencial. Seja direto e confiante.",
  },
  {
    icon: "📸",
    title: "Fotos que vendem",
    desc: "Use fotos do antes/depois do serviço. Mostre qualidade e organização no trabalho.",
  },
  {
    icon: "⭐",
    title: "Primeira resposta rápida",
    desc: "Responda no WhatsApp em até 5 minutos. Clientes escolhem quem responde mais rápido.",
  },
  {
    icon: "💬",
    title: "Orçamento profissional",
    desc: "Responda com nome, preço e prazo. Quem é claro no orçamento fecha mais contratos.",
  },
  {
    icon: "🔁",
    title: "Peça indicação",
    desc: "Após um serviço bem feito, peça indicação. 80% dos negócios vêm de boca a boca.",
  },
  {
    icon: "📍",
    title: "Bairros estratégicos",
    desc: "Cadastre os bairros onde você atende. Apareça para clientes perto de você.",
  },
];

export default function PainelPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: userData } = await supabase
        .from("users").select("name, role").eq("id", user.id).single();

      if (!userData || userData.role !== "professional") {
        router.push("/inicio");
        return;
      }

      setUserName(userData.name?.split(" ")[0] || "Profissional");

      const { data: prof } = await supabase
        .from("professionals")
        .select("id, plan, status, avg_rating, views_count, coupon_code, trial_ends_at")
        .eq("user_id", user.id)
        .single();

      if (!prof) { router.push("/inicio"); return; }

      const [leadsTotal, leadsWeek, reviews] = await Promise.all([
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", prof.id),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).eq("professional_id", prof.id).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("professional_id", prof.id),
      ]);

      setStats({
        leadsTotal: leadsTotal.count || 0,
        leadsWeek: leadsWeek.count || 0,
        viewsTotal: prof.views_count || 0,
        avgRating: prof.avg_rating || 0,
        reviewsTotal: reviews.count || 0,
        plan: prof.plan,
        status: prof.status,
        coupon_code: prof.coupon_code,
        trial_ends_at: prof.trial_ends_at,
      });

      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  const isActive = stats?.status === "active";
  const isCoupon = !!stats?.coupon_code;
  const isTrial = !!stats?.trial_ends_at && new Date(stats.trial_ends_at) > new Date();
  const trialDaysLeft = stats?.trial_ends_at
    ? Math.ceil((new Date(stats.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-bold text-xl text-foreground">Olá, {userName}! 👋</h1>
            <p className="text-xs text-muted mt-0.5">Painel do profissional</p>
          </div>
          <div className="flex items-center gap-2">
            {isCoupon && (
              <span className="text-[9px] px-2 py-1 rounded-full font-bold"
                style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                CUPOM ATIVO
              </span>
            )}
            {isTrial && (
              <span className="text-[9px] px-2 py-1 rounded-full font-bold"
                style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" }}>
                TRIAL {trialDaysLeft}d
              </span>
            )}
            {!isActive && !isCoupon && !isTrial && (
              <Link href="/painel/assinatura"
                className="text-[9px] px-2 py-1 rounded-full font-bold"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>
                INATIVO
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">

        {/* Alerta se inativo */}
        {!isActive && !isCoupon && !isTrial && (
          <div className="p-4 rounded-2xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="font-syne font-bold text-sm mb-1" style={{ color: "#f87171" }}>Perfil inativo</p>
            <p className="text-xs text-muted mb-3">Ative sua assinatura para aparecer nas buscas e receber clientes.</p>
            <Link href="/painel/assinatura"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
              <CreditCard size={14} /> Ativar assinatura
            </Link>
          </div>
        )}

        {/* Trial aviso */}
        {isTrial && (
          <div className="p-4 rounded-2xl"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <p className="font-syne font-bold text-sm mb-1" style={{ color: "#FBBF24" }}>
              🎉 {trialDaysLeft} dias grátis restantes
            </p>
            <p className="text-xs text-muted">Aproveite o período de experiência! Após o trial, assine para continuar recebendo clientes.</p>
          </div>
        )}

        {/* Métricas */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>SUAS MÉTRICAS</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={14} style={{ color: "#22c55e" }} />
                <span className="text-xs text-muted">Leads esta semana</span>
              </div>
              <div className="font-syne font-extrabold text-2xl text-foreground">{stats?.leadsWeek}</div>
              <div className="text-[10px] text-muted mt-1">{stats?.leadsTotal} no total</div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} style={{ color: "#3B82F6" }} />
                <span className="text-xs text-muted">Visualizações</span>
              </div>
              <div className="font-syne font-extrabold text-2xl text-foreground">{stats?.viewsTotal}</div>
              <div className="text-[10px] text-muted mt-1">
                {stats?.avgRating ? `⭐ ${Number(stats.avgRating).toFixed(1)} (${stats?.reviewsTotal} avaliações)` : "Sem avaliações ainda"}
              </div>
            </div>
          </div>
        </div>

        {/* Menu rápido */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>GERENCIAR</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/painel/perfil", icon: Users, label: "Meu perfil", desc: "Editar dados e bairros" },
              { href: "/painel/fotos", icon: Camera, label: "Fotos", desc: "Adicionar fotos do trabalho" },
              { href: "/painel/leads", icon: MessageCircle, label: "Leads", desc: "Ver contatos recebidos" },
              { href: "/painel/assinatura", icon: CreditCard, label: "Assinatura", desc: "Gerenciar plano" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href}
                className="p-4 rounded-2xl flex flex-col gap-2"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.1)" }}>
                  <Icon size={15} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground">{label}</p>
                  <p className="text-[10px] text-muted">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dicas rápidas */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#22c55e" }}>PRÓXIMOS PASSOS</p>
          <div className="space-y-2">
            {TIPS.map(({ icon: Icon, color, title, desc, action, href }) => (
              <Link key={title} href={href}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="font-syne font-bold text-xs text-foreground mb-0.5">{title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
                  <p className="text-[10px] font-bold mt-1.5" style={{ color }}>
                    {action} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Guia de marketing */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={14} style={{ color: "#a855f7" }} />
            <p className="text-[10px] font-bold tracking-widest" style={{ color: "#a855f7" }}>GUIA DE SUCESSO</p>
          </div>
          <div className="p-4 rounded-2xl mb-3"
            style={{ background: "linear-gradient(135deg, #1a0a2e, #2d1b4e)", border: "1px solid rgba(168,85,247,0.3)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} style={{ color: "#a855f7" }} />
              <p className="font-syne font-bold text-sm text-white">Como conseguir mais clientes</p>
            </div>
            <div className="space-y-3">
              {MARKETING_TIPS.map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <div>
                    <p className="font-semibold text-xs text-white mb-0.5">{title}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#c4b5fd" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upgrade pro */}
        {stats?.plan === "basic" && isActive && (
          <div className="p-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Award size={14} style={{ color: "#3B82F6" }} />
              <span className="font-syne font-bold text-sm text-white">Quer mais clientes?</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#93c5fd" }}>
              O Plano Pro aparece primeiro nas buscas e tem badge de destaque. Por apenas +R$30/mês.
            </p>
            <Link href="/painel/assinatura"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
              <Zap size={14} /> Upgrade para Pro — R$99/mês
            </Link>
          </div>
        )}

        {/* Suporte */}
        <div className="p-4 rounded-2xl text-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <p className="text-sm font-semibold text-foreground mb-1">Precisa de ajuda?</p>
          <p className="text-xs text-muted mb-3">Nossa equipe responde em minutos</p>
          <a href="https://wa.me/5534999999999?text=Olá! Preciso de ajuda com meu perfil no UDIHUB"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
            <MessageCircle size={14} /> Falar com suporte
          </a>
        </div>

      </div>
    </div>
  );
}
