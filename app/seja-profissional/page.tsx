"use client";

import Link from "next/link";
import {
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Star,
  Shield,
  ArrowRight,
  Zap,
} from "lucide-react";
import { PLANS } from "@/lib/constants";
import BottomNav from "@/app/components/layout/BottomNav";
const FEATURES_PRO = [
  "Aparece primeiro nas buscas",
  "Badge PRO em destaque azul",
  "Até 10 fotos na galeria",
  "Recebe leads via WhatsApp",
  "Painel de métricas avançado",
  "Prioridade no suporte",
];

const FEATURES_BASIC = [
  "Perfil ativo e visível",
  "Aparece nas buscas",
  "Até 3 fotos no perfil",
  "Recebe leads via WhatsApp",
  "Painel de métricas básico",
];

export default function SejaProfissionalPage() {
  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── HERO ── */}
      <section className="relative px-4 pt-16 pb-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(40px)", transform: "translate(30%, -30%)" }} />

        <div className="max-w-lg mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
            PARA PROFISSIONAIS
          </div>

          <h1 className="font-syne font-extrabold text-3xl sm:text-4xl text-foreground leading-tight mb-4">
            Receba clientes direto no seu{" "}
            <span style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              WhatsApp
            </span>
          </h1>

          <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto" style={{ color: "#94a3b8" }}>
            Crie seu perfil no UDIHUB, apareça nas buscas de clientes da sua cidade e receba leads em tempo real.
          </p>

          <Link href="/cadastro"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 32px rgba(59,130,246,0.5)" }}>
            Criar perfil grátis
            <ArrowRight size={18} />
          </Link>

          <p className="text-xs text-muted mt-4">
            Sem taxa de cadastro · Pagamento só após criar o perfil
          </p>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-black tracking-[0.15em] mb-2 text-center" style={{ color: "#3B82F6" }}>PLANOS</p>
          <h2 className="font-syne font-bold text-xl text-foreground text-center mb-6">Escolha o seu plano</h2>

          <div className="grid grid-cols-1 gap-4">

            {/* BÁSICO */}
            <div className="p-5 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="mb-4">
                <div className="font-syne font-bold text-lg text-foreground">Plano Básico</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-syne font-extrabold text-3xl text-foreground">R$69</span>
                  <span className="text-sm text-muted">/mês</span>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {FEATURES_BASIC.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                    <span className="text-xs text-muted">{feat}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                Começar com Básico
              </Link>
            </div>

            {/* PRO */}
            <div className="relative p-5 rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0F1729 0%, #1e3a5f 100%)", border: "2px solid #3B82F6", boxShadow: "0 0 30px rgba(59,130,246,0.2)" }}>
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#3B82F6" }}>
                  MAIS POPULAR
                </span>
              </div>
              <div className="mb-4">
                <div className="font-syne font-bold text-lg text-white">Plano Pro</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-syne font-extrabold text-3xl text-white">R$99</span>
                  <span className="text-sm text-muted">/mês</span>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {FEATURES_PRO.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                    <span className="text-xs text-white">{feat}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
                Começar com Pro
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-muted mt-4">
            Cancele a qualquer momento · Sem fidelidade · Cobrança mensal recorrente
          </p>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="px-4 py-10" style={{ background: "#080809" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] font-black tracking-[0.15em] mb-6 text-center" style={{ color: "#3B82F6" }}>COMO FUNCIONA</p>
          <div className="space-y-3">
            {[
              { icon: Zap, title: "Perfil ativo imediatamente", desc: "Após o pagamento, seu perfil aparece nas buscas em minutos. Sem aprovação manual." },
              { icon: MessageCircle, title: "Leads direto no WhatsApp", desc: "Clientes clicam no botão e chegam direto no seu WhatsApp. Você nunca perde um contato." },
              { icon: TrendingUp, title: "Painel de métricas", desc: "Veja quantos leads recebeu hoje, essa semana e no mês. Gráficos simples e claros." },
              { icon: Star, title: "Avaliações reais", desc: "Só clientes que clicaram no seu WhatsApp avaliam. Nada de avaliações falsas." },
              { icon: Shield, title: "Suporte via WhatsApp", desc: "Problema? Dúvida? Fala com a gente direto. Resolvemos rápido." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.1)" }}>
                  <Icon size={18} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-sm text-foreground mb-0.5">{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-4 py-10">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-syne font-bold text-xl text-foreground mb-3">Pronto para começar?</h2>
          <p className="text-sm text-muted mb-6">Junte-se aos profissionais que já estão recebendo clientes pelo UDIHUB.</p>
          <Link href="/cadastro"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
            Criar perfil grátis <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-muted mt-3">Sem taxa de cadastro · Cancele quando quiser</p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
