"use client";

import Link from "next/link";
import {
  CheckCircle, TrendingUp, MessageCircle, Star,
  Shield, ArrowRight, Zap, Users, MapPin, Clock,
} from "lucide-react";
import BottomNav from "@/app/components/layout/BottomNav";

const FEATURES_BASIC = [
  "Perfil ativo e visível nas buscas",
  "Aparece por categoria e bairro",
  "Até 3 fotos no perfil",
  "Leads direto no WhatsApp",
  "Painel de métricas básico",
];

const FEATURES_PRO = [
  "Aparece PRIMEIRO nas buscas",
  "Badge PRO em destaque azul",
  "Até 10 fotos na galeria",
  "Leads direto no WhatsApp",
  "Painel de métricas avançado",
  "Prioridade no suporte",
];

const PROFISSOES = [
  "⚡ Eletricista", "🔧 Encanador", "🎨 Pintor", "🧱 Pedreiro",
  "🧹 Diarista", "💪 Personal", "✂️ Cabeleireiro", "🔩 Serralheiro",
  "❄️ Ar Condicionado", "🪑 Montador", "📷 Fotógrafo", "🎂 Confeiteiro",
];

export default function SejaProfissionalPage() {
  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── HERO ── */}
      <section className="relative px-4 pt-14 pb-10 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #09090B 0%, #0a0f1e 60%, #09090B 100%)" }}>

        {/* Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", filter: "blur(50px)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", filter: "blur(40px)", transform: "translate(-30%, 30%)" }} />

        <div className="max-w-lg mx-auto text-center relative z-10">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
            🚀 MAIS DE 100 CATEGORIAS DE SERVIÇO
          </div>

          {/* Headline */}
          <h1 className="font-syne font-extrabold text-foreground leading-tight mb-3"
            style={{ fontSize: "clamp(28px, 8vw, 38px)" }}>
            Chega de depender{" "}
            <span style={{ color: "#f87171" }}>só de indicação</span>
            <br />para conseguir cliente
          </h1>

          <p className="font-syne text-base leading-relaxed mb-6 max-w-sm mx-auto"
            style={{ color: "#94a3b8" }}>
            O UDIHUB coloca seu perfil na frente de clientes de Uberlândia que estão buscando exatamente o que você oferece — e eles chegam <strong style={{ color: "#FAFAFA" }}>direto no seu WhatsApp.</strong>
          </p>

          {/* Prova social */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {["⚡","🔧","🎨","🧹"].map((e, i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs border-2"
                    style={{ background: "#111113", borderColor: "#09090B" }}>{e}</div>
                ))}
              </div>
              <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Profissionais já recebendo clientes</span>
            </div>
          </div>

          {/* Aviso preço */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-5"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
            <span className="text-xs font-bold" style={{ color: "#FBBF24" }}>
              💳 A partir de R$69/mês · Sem fidelidade
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/cadastro"
              className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl font-syne font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 40px rgba(59,130,246,0.5)" }}>
              Quero receber clientes agora <ArrowRight size={18} />
            </Link>
            <p className="text-xs text-muted">Cadastro gratuito · Ativo em minutos após o pagamento</p>
          </div>
        </div>
      </section>

      {/* ── PROFISSÕES ── */}
      <section className="px-4 py-8" style={{ background: "#080809" }}>
        <div className="max-w-lg mx-auto">
          <p className="font-syne text-center text-sm font-bold text-muted mb-4">
            Para qual profissão você quer receber clientes?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PROFISSOES.map((p) => (
              <span key={p} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "#111113", border: "1px solid #1F1F23", color: "#A1A1AA" }}>
                {p}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
              + 93 categorias
            </span>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-syne font-black tracking-[0.15em] mb-2 text-center" style={{ color: "#3B82F6" }}>SIMPLES ASSIM</p>
          <h2 className="font-syne font-extrabold text-2xl text-foreground text-center mb-8">3 passos para receber clientes</h2>

          <div className="space-y-4">
            {[
              {
                num: "01",
                icon: Zap,
                title: "Crie seu perfil",
                desc: "Cadastre-se, escolha seu plano e pague via PIX. Seu perfil fica ativo em menos de 5 minutos.",
                color: "#3B82F6",
              },
              {
                num: "02",
                icon: Users,
                title: "Apareça nas buscas",
                desc: "Clientes de Uberlândia buscam pelo seu serviço e encontram seu perfil com foto, avaliações e bairros atendidos.",
                color: "#a855f7",
              },
              {
                num: "03",
                icon: MessageCircle,
                title: "Receba no WhatsApp",
                desc: "O cliente clica em 'Chamar no WhatsApp' e a conversa abre direto com você. Sem intermediários.",
                color: "#22c55e",
              },
            ].map(({ num, icon: Icon, title, desc, color }) => (
              <div key={num} className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `rgba(${color === "#3B82F6" ? "59,130,246" : color === "#a855f7" ? "168,85,247" : "34,197,94"},0.1)` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-syne font-black text-xs" style={{ color }}>{num}</span>
                    <h3 className="font-syne font-bold text-sm text-foreground">{title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section className="px-4 py-10" style={{ background: "#080809" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-syne font-black tracking-[0.15em] mb-2 text-center" style={{ color: "#3B82F6" }}>POR QUE O UDIHUB</p>
          <h2 className="font-syne font-extrabold text-2xl text-foreground text-center mb-8">
            Diferente de tudo que você já usou
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, title: "Por bairro", desc: "Apareça para clientes do seu bairro. Proximidade gera mais conversão.", color: "#3B82F6" },
              { icon: MessageCircle, title: "WhatsApp direto", desc: "Sem intermediários. O cliente fala direto com você.", color: "#22c55e" },
              { icon: TrendingUp, title: "Métricas reais", desc: "Veja leads, visualizações e conversões no seu painel.", color: "#a855f7" },
              { icon: Star, title: "Avaliações reais", desc: "Só quem clicou pode avaliar. Zero avaliações falsas.", color: "#FBBF24" },
              { icon: Clock, title: "Ativo em minutos", desc: "Pague e apareça nas buscas em menos de 5 minutos.", color: "#f59e0b" },
              { icon: Shield, title: "Sem fidelidade", desc: "Cancele quando quiser, sem multa e sem burocracia.", color: "#f87171" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <h3 className="font-syne font-bold text-sm text-foreground mb-1">{title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-syne font-black tracking-[0.15em] mb-2 text-center" style={{ color: "#3B82F6" }}>PLANOS</p>
          <h2 className="font-syne font-extrabold text-2xl text-foreground text-center mb-2">Escolha o seu plano</h2>
          <p className="font-syne text-xs text-center text-muted mb-8">Cobrança mensal recorrente · Sem fidelidade · Cancele quando quiser</p>

          <div className="grid grid-cols-1 gap-4">

            {/* BÁSICO */}
            <div className="p-5 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-syne font-bold text-lg text-foreground">Plano Básico</div>
                  <p className="text-xs text-muted mt-0.5">Ideal para começar</p>
                </div>
                <div className="text-right">
                  <span className="font-syne font-extrabold text-3xl text-foreground">R$69</span>
                  <span className="text-sm text-muted">/mês</span>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {FEATURES_BASIC.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                    <span className="font-syne text-xs text-muted">{feat}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3.5 rounded-xl font-syne font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                Assinar Básico — R$69/mês
              </Link>
            </div>

            {/* PRO */}
            <div className="relative p-5 rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0F1729 0%, #1e3a5f 100%)", border: "2px solid #3B82F6", boxShadow: "0 0 40px rgba(59,130,246,0.2)" }}>
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-lg text-xs font-syne font-bold text-white"
                  style={{ background: "#3B82F6" }}>
                  ⭐ MAIS POPULAR
                </span>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-syne font-bold text-lg text-white">Plano Pro</div>
                  <p className="text-xs text-muted mt-0.5">Para quem quer mais clientes</p>
                </div>
                <div className="text-right">
                  <span className="font-syne font-extrabold text-3xl text-white">R$99</span>
                  <span className="text-sm text-muted">/mês</span>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {FEATURES_PRO.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                    <span className="font-syne text-xs text-white">{feat}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3.5 rounded-xl font-syne font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}>
                Assinar Pro — R$99/mês
              </Link>
            </div>
          </div>

          <p className="font-syne text-center text-xs text-muted mt-4">
            ⚠️ O perfil fica ativo somente após a confirmação do pagamento
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 py-10" style={{ background: "#080809" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-syne font-black tracking-[0.15em] mb-2 text-center" style={{ color: "#3B82F6" }}>DÚVIDAS FREQUENTES</p>
          <h2 className="font-syne font-extrabold text-2xl text-foreground text-center mb-8">Perguntas e respostas</h2>

          <div className="space-y-3">
            {[
              {
                q: "O perfil é gratuito?",
                a: "O cadastro é gratuito, mas para aparecer nas buscas e receber clientes você precisa de uma assinatura mensal. Plano Básico R$69/mês ou Plano Pro R$99/mês.",
              },
              {
                q: "Quando meu perfil fica ativo?",
                a: "Imediatamente após a confirmação do pagamento via PIX. O processo leva menos de 5 minutos.",
              },
              {
                q: "Preciso pagar taxa por lead ou venda?",
                a: "Não! Você paga apenas a assinatura mensal fixa. Não cobramos nada por lead, contato ou serviço realizado.",
              },
              {
                q: "Posso cancelar quando quiser?",
                a: "Sim, sem fidelidade e sem multa. Você cancela pelo painel e seu perfil fica ativo até o final do período já pago.",
              },
              {
                q: "Como os clientes chegam até mim?",
                a: "Clientes buscam pelo serviço que você oferece no UDIHUB, encontram seu perfil e clicam em 'Chamar no WhatsApp'. A conversa abre direto com você.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-2xl overflow-hidden"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <summary className="flex items-center justify-between px-4 py-4 cursor-pointer list-none gap-4">
                  <span className="font-syne font-semibold text-sm text-foreground">{q}</span>
                  <span className="text-muted text-xl leading-none group-open:rotate-45 transition-transform duration-200 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4">
                  <p className="font-syne text-xs leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
            🟢 Profissionais ativos em Uberlândia agora
          </div>
          <h2 className="font-syne font-extrabold text-foreground leading-tight mb-3"
            style={{ fontSize: "clamp(24px, 7vw, 32px)" }}>
            Seus próximos clientes já estão<br />
            <span style={{ color: "#3B82F6" }}>te procurando no UDIHUB</span>
          </h2>
          <p className="font-syne text-sm text-muted mb-8 max-w-xs mx-auto leading-relaxed">
            Crie seu perfil agora e comece a receber clientes direto no WhatsApp por apenas R$69/mês.
          </p>
          <Link href="/cadastro"
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-4 rounded-2xl font-syne font-bold text-white text-base"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 40px rgba(59,130,246,0.5)" }}>
            Criar meu perfil agora <ArrowRight size={18} />
          </Link>
          <p className="font-syne text-xs text-muted mt-3">
            Cadastro gratuito · PIX ou cartão · Cancele quando quiser
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
