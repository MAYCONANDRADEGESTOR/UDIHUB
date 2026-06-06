"use client";

import Link from "next/link";
import { CheckCircle, MessageCircle, Star, Shield, ArrowRight, Zap, Users, MapPin, Clock, TrendingUp } from "lucide-react";
import BottomNav from "@/app/components/layout/BottomNav";

export default function SejaProfissionalPage() {
  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── HERO ── */}
      <section className="px-4 pt-10 pb-8"
        style={{ background: "linear-gradient(180deg, #0F172A 0%, #09090B 100%)" }}>
        <div className="max-w-lg mx-auto">

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
            🚀 Marketplace de serviços de Uberlândia
          </div>

          <h1 className="font-syne font-extrabold text-2xl text-foreground leading-tight mb-2">
            Receba clientes direto no seu{" "}
            <span style={{ color: "#22c55e" }}>WhatsApp</span>
          </h1>

          <p className="text-sm text-muted leading-relaxed mb-6">
            Crie seu perfil no UDIHUB e apareça nas buscas de clientes de Uberlândia que precisam do seu serviço agora.
          </p>

          <Link href="/cadastro"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white mb-3"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.35)" }}>
            Criar meu perfil grátis <ArrowRight size={16} />
          </Link>

          <p className="text-xs text-muted text-center">
            Cadastro gratuito · Ativo em minutos após o pagamento · Sem fidelidade
          </p>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <span className="text-xs font-bold tracking-widest text-muted">PLANOS</span>
          <h2 className="font-syne font-extrabold text-xl text-foreground mt-1 mb-1">Escolha o seu plano</h2>
          <p className="text-xs text-muted mb-5">Cobrança mensal · Cancele quando quiser · Sem fidelidade</p>

          <div className="space-y-3">

            {/* PRO — primeiro e destacado */}
            <div className="relative rounded-2xl overflow-hidden p-5"
              style={{ background: "linear-gradient(135deg, #0F1729, #1a2f5a)", border: "2px solid #3B82F6", boxShadow: "0 0 30px rgba(59,130,246,0.15)" }}>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold text-white"
                  style={{ background: "#3B82F6" }}>MAIS POPULAR</span>
              </div>
              <div className="mb-3">
                <p className="text-xs font-bold mb-0.5" style={{ color: "#93c5fd" }}>👑 Plano Pro</p>
                <div className="flex items-end gap-1">
                  <span className="font-syne font-extrabold text-3xl text-white">R$99</span>
                  <span className="text-sm text-muted mb-0.5">/mês</span>
                </div>
                <p className="text-xs text-muted mt-0.5">Para quem quer o máximo de clientes</p>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  "Aparece PRIMEIRO nas buscas",
                  "Badge PRO em destaque azul",
                  "Até 10 fotos na galeria",
                  "Leads direto no WhatsApp",
                  "Painel de métricas avançado",
                  "Prioridade no suporte",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                    <span className="text-xs text-white">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
                Assinar Pro — R$99/mês
              </Link>
            </div>

            {/* BÁSICO */}
            <div className="rounded-2xl p-5"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="mb-3">
                <p className="text-xs font-bold text-muted mb-0.5">⭐ Plano Básico</p>
                <div className="flex items-end gap-1">
                  <span className="font-syne font-extrabold text-3xl text-foreground">R$69</span>
                  <span className="text-sm text-muted mb-0.5">/mês</span>
                </div>
                <p className="text-xs text-muted mt-0.5">Ideal para começar a receber clientes</p>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  "Perfil ativo e visível nas buscas",
                  "Aparece por categoria e bairro",
                  "Até 3 fotos no perfil",
                  "Leads direto no WhatsApp",
                  "Painel de métricas",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#22c55e" }} className="flex-shrink-0" />
                    <span className="text-xs text-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                Assinar Básico — R$69/mês
              </Link>
            </div>
          </div>

          {/* Comparativo rápido */}
          <div className="mt-4 p-3 rounded-xl"
            style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <p className="text-xs text-muted text-center leading-relaxed">
              💡 <strong className="text-foreground">Dica:</strong> No Plano Pro você aparece antes dos Básicos nas buscas. Com mais visibilidade, mais clientes chegam até você.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="px-4 py-8" style={{ borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto">
          <span className="text-xs font-bold tracking-widest text-muted">COMO FUNCIONA</span>
          <h2 className="font-syne font-extrabold text-xl text-foreground mt-1 mb-5">3 passos simples</h2>

          <div className="space-y-3">
            {[
              {
                num: "01", icon: Zap, color: "#3B82F6",
                title: "Crie seu perfil",
                desc: "Cadastre-se, escolha seu plano e pague via PIX. Seu perfil fica ativo em menos de 5 minutos.",
              },
              {
                num: "02", icon: Users, color: "#a855f7",
                title: "Apareça nas buscas",
                desc: "Clientes de Uberlândia buscam pelo seu serviço e encontram seu perfil com foto, avaliações e bairros atendidos.",
              },
              {
                num: "03", icon: MessageCircle, color: "#22c55e",
                title: "Receba no WhatsApp",
                desc: "O cliente clica em 'Chamar no WhatsApp' e a conversa abre direto com você. Sem intermediários, sem taxas por lead.",
              },
            ].map(({ num, icon: Icon, color, title, desc }) => (
              <div key={num} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold" style={{ color }}>{num}</span>
                    <p className="font-syne font-bold text-sm text-foreground">{title}</p>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFISSÕES ── */}
      <section className="px-4 py-8" style={{ background: "#080809", borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto">
          <span className="text-xs font-bold tracking-widest text-muted">CATEGORIAS</span>
          <h2 className="font-syne font-extrabold text-xl text-foreground mt-1 mb-4">Para qual serviço você quer clientes?</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "⚡ Eletricista", "🔧 Encanador", "🎨 Pintor", "🧱 Pedreiro",
              "🧹 Diarista", "💪 Personal", "✂️ Cabeleireiro", "🔩 Serralheiro",
              "❄️ Ar Condicionado", "🪑 Montador", "📷 Fotógrafo", "🎂 Confeiteiro",
            ].map((p) => (
              <span key={p} className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "#111113", border: "1px solid #1F1F23", color: "#A1A1AA" }}>
                {p}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
              + 93 categorias
            </span>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section className="px-4 py-8" style={{ borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto">
          <span className="text-xs font-bold tracking-widest text-muted">DIFERENCIAIS</span>
          <h2 className="font-syne font-extrabold text-xl text-foreground mt-1 mb-5">Por que o UDIHUB?</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, color: "#3B82F6", title: "Por bairro", desc: "Apareça para clientes próximos. Proximidade gera mais conversão." },
              { icon: MessageCircle, color: "#22c55e", title: "WhatsApp direto", desc: "Sem intermediários. O cliente fala direto com você." },
              { icon: TrendingUp, color: "#a855f7", title: "Métricas reais", desc: "Veja leads e visualizações no seu painel." },
              { icon: Star, color: "#FBBF24", title: "Avaliações reais", desc: "Só quem entrou em contato pode avaliar." },
              { icon: Clock, color: "#f59e0b", title: "Ativo em minutos", desc: "Pague e apareça nas buscas em minutos." },
              { icon: Shield, color: "#f87171", title: "Sem fidelidade", desc: "Cancele quando quiser, sem multa." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-3.5 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                  style={{ background: `${color}15` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <p className="font-syne font-bold text-sm text-foreground mb-0.5">{title}</p>
                <p className="text-[11px] leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 py-8" style={{ background: "#080809", borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto">
          <span className="text-xs font-bold tracking-widest text-muted">DÚVIDAS</span>
          <h2 className="font-syne font-extrabold text-xl text-foreground mt-1 mb-5">Perguntas frequentes</h2>

          <div className="space-y-2">
            {[
              {
                q: "O perfil é gratuito?",
                a: "O cadastro é gratuito, mas para aparecer nas buscas e receber clientes você precisa de uma assinatura. Plano Básico R$69/mês ou Pro R$99/mês.",
              },
              {
                q: "Quando meu perfil fica ativo?",
                a: "Imediatamente após a confirmação do pagamento via PIX. Leva menos de 5 minutos.",
              },
              {
                q: "Pago taxa por lead ou venda?",
                a: "Não! Você paga apenas a assinatura mensal fixa. Nenhuma taxa sobre contatos ou serviços realizados.",
              },
              {
                q: "Posso cancelar quando quiser?",
                a: "Sim, sem fidelidade e sem multa. Cancele pelo painel e seu perfil fica ativo até o final do período pago.",
              },
              {
                q: "Como os clientes chegam até mim?",
                a: "Clientes buscam pelo serviço no UDIHUB, encontram seu perfil e clicam em 'Chamar no WhatsApp'. A conversa abre direto com você.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-2xl overflow-hidden"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none gap-4">
                  <span className="text-sm font-semibold text-foreground">{q}</span>
                  <span className="text-muted text-lg leading-none flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-4 py-10" style={{ borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
            🟢 Profissionais ativos agora em Uberlândia
          </div>
          <h2 className="font-syne font-extrabold text-xl text-foreground mb-2">
            Seus clientes estão te procurando
          </h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Crie seu perfil e comece a receber clientes direto no WhatsApp por R$69/mês.
          </p>
          <Link href="/cadastro"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.35)" }}>
            Criar meu perfil agora <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-muted mt-3">
            Cadastro gratuito · PIX · Cancele quando quiser
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
