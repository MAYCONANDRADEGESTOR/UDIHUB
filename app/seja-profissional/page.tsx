"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle, MessageCircle, Shield, ArrowRight,
  Zap, Users, MapPin, Clock, TrendingUp, Star, Bell, Tag, Gift
} from "lucide-react";

const NOTIFICACOES = [
  { nome: "Carlos S.", cidade: "Santa Monica", plano: "Basico", tempo: "2 min" },
  { nome: "Ana R.", cidade: "Tibery", plano: "Pro", tempo: "5 min" },
  { nome: "Marcos P.", cidade: "Jardim Karaiba", plano: "Basico", tempo: "8 min" },
  { nome: "Fernanda L.", cidade: "Copacabana", plano: "Pro", tempo: "12 min" },
  { nome: "Roberto M.", cidade: "Saraiva", plano: "Basico", tempo: "15 min" },
];

export default function SejaProfissionalPage() {
  const [notifIndex, setNotifIndex] = useState(0);
  const [showNotif, setShowNotif] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotif(false);
      setTimeout(() => {
        setNotifIndex((prev) => (prev + 1) % NOTIFICACOES.length);
        setShowNotif(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const notif = NOTIFICACOES[notifIndex];

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* HERO */}
      <section className="px-4 pt-10 pb-8"
        style={{ background: "linear-gradient(180deg, #0F172A 0%, #09090B 100%)" }}>
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
            Marketplace de servicos · Uberlandia, MG
          </div>
          <h1 className="font-syne font-bold text-2xl text-foreground leading-snug mb-3">
            Clientes da sua cidade<br />chegando no seu{" "}
            <span style={{ color: "#22c55e" }}>WhatsApp</span>
          </h1>
          <p className="text-sm text-muted leading-relaxed mb-5 max-w-xs mx-auto">
            Apareca nas buscas de quem precisa do seu servico. Sem intermediarios. Sem taxa por lead.
          </p>
          <div className="flex justify-center mb-5">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-left"
              style={{
                background: "#111113", border: "1px solid #1F1F23",
                opacity: showNotif ? 1 : 0,
                transform: showNotif ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.15)" }}>
                <Bell size={13} style={{ color: "#22c55e" }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{notif.nome} · {notif.cidade}</p>
                <p className="text-[10px] text-muted">assinou o Plano {notif.plano} · ha {notif.tempo}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
            </div>
          </div>
          <Link href="/cadastro"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.3)" }}>
            Quero receber clientes <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-muted mt-3">Sem fidelidade · Cancele quando quiser</p>
        </div>
      </section>

      {/* PLANOS */}
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold tracking-widest text-muted text-center mb-1">PLANOS</p>
          <h2 className="font-syne font-bold text-xl text-foreground text-center mb-1">Escolha como comecar</h2>
          <p className="text-xs text-muted text-center mb-6">Oferta por tempo limitado</p>
          <div className="space-y-3">

            {/* CUPOM — sem nome do cupom */}
            <div className="rounded-2xl p-5"
              style={{ background: "#111113", border: "1px solid rgba(251,191,36,0.25)" }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(251,191,36,0.12)" }}>
                  <Gift size={16} style={{ color: "#FBBF24" }} />
                </div>
                <div className="flex-1">
                  <p className="font-syne font-bold text-sm text-foreground">Tenho um cupom</p>
                  <p className="text-xs text-muted mt-0.5">3 meses no perfil Basico</p>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Perfil ativo por 90 dias", "Aparece nas buscas", "Leads direto no WhatsApp", "Apos 90 dias, assine para continuar"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#FBBF24" }} className="flex-shrink-0" />
                    <span className="text-xs text-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}>
                <Tag size={14} /> Cadastrar com cupom
              </Link>
            </div>

            {/* BASICO — sem porcentagem */}
            <div className="relative rounded-2xl p-5"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="absolute -top-3 left-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold text-white"
                  style={{ background: "#22c55e" }}>OFERTA ESPECIAL</span>
              </div>
              <div className="flex items-start justify-between mb-3 mt-1">
                <div>
                  <p className="text-xs font-bold text-muted mb-0.5">Plano Basico</p>
                  <p className="text-xs text-muted">Ideal para comecar</p>
                </div>
                <div className="text-right">
                  <div className="flex items-end gap-0.5">
                    <span className="font-syne font-bold text-2xl text-foreground">R$69</span>
                    <span className="text-xs text-muted mb-0.5">/mes</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Perfil ativo e visivel nas buscas", "Aparece por categoria e bairro", "Ate 3 fotos no perfil", "Leads direto no WhatsApp", "Painel de metricas"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#22c55e" }} className="flex-shrink-0" />
                    <span className="text-xs text-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                Assinar por R$69/mes
              </Link>
            </div>

            {/* PRO — sem porcentagem */}
            <div className="relative rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, #0F1729, #1a2f5a)", border: "2px solid #3B82F6" }}>
              <div className="absolute -top-3 left-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold text-white"
                  style={{ background: "#3B82F6" }}>MAIS POPULAR</span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.3)" }}>PRO</span>
              </div>
              <div className="flex items-start justify-between mb-3 mt-1">
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: "#93c5fd" }}>Plano Pro</p>
                  <p className="text-xs text-muted">Para quem quer mais clientes</p>
                </div>
                <div className="text-right">
                  <div className="flex items-end gap-0.5">
                    <span className="font-syne font-bold text-2xl text-white">R$99</span>
                    <span className="text-xs text-muted mb-0.5">/mes</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Aparece PRIMEIRO nas buscas", "Badge PRO em destaque azul", "Ate 10 fotos na galeria", "Leads direto no WhatsApp", "Painel de metricas avancado", "Prioridade no suporte"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                    <span className="text-xs text-white">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                Assinar por R$99/mes
              </Link>
            </div>

          </div>
          <p className="text-[10px] text-muted text-center mt-4">
            Pagamento via PIX ou cartao · Sem fidelidade · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="px-4 py-8" style={{ borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold tracking-widest text-muted text-center mb-1">COMO FUNCIONA</p>
          <h2 className="font-syne font-bold text-xl text-foreground text-center mb-5">3 passos simples</h2>
          <div className="space-y-3">
            {[
              { num: "01", icon: Zap, color: "#3B82F6", title: "Crie seu perfil", desc: "Escolha o plano, pague via PIX e seu perfil fica ativo em minutos." },
              { num: "02", icon: Users, color: "#a855f7", title: "Apareca nas buscas", desc: "Clientes encontram seu perfil com foto, avaliacoes e bairros atendidos." },
              { num: "03", icon: MessageCircle, color: "#22c55e", title: "Receba no WhatsApp", desc: "O cliente clica em Chamar no WhatsApp e fala direto com voce. Sem taxas." },
            ].map(({ num, icon: Icon, color, title, desc }) => (
              <div key={num} className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18` }}>
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

      {/* DIFERENCIAIS */}
      <section className="px-4 py-8" style={{ background: "#080809", borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold tracking-widest text-muted text-center mb-1">DIFERENCIAIS</p>
          <h2 className="font-syne font-bold text-xl text-foreground text-center mb-5">Por que o UDIHUB?</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, color: "#3B82F6", title: "Por bairro", desc: "Apareca para clientes proximos a voce." },
              { icon: MessageCircle, color: "#22c55e", title: "WhatsApp direto", desc: "Sem intermediarios entre voce e o cliente." },
              { icon: TrendingUp, color: "#a855f7", title: "Metricas reais", desc: "Acompanhe leads e visualizacoes no painel." },
              { icon: Star, color: "#FBBF24", title: "Avaliacoes reais", desc: "So clientes verificados podem avaliar." },
              { icon: Clock, color: "#f59e0b", title: "Ativo em minutos", desc: "Pague e apareca nas buscas na hora." },
              { icon: Shield, color: "#f87171", title: "Sem fidelidade", desc: "Cancele quando quiser, sem multa." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-3.5 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                  style={{ background: `${color}18` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <p className="font-syne font-bold text-sm text-foreground mb-0.5">{title}</p>
                <p className="text-[11px] leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-8" style={{ borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold tracking-widest text-muted text-center mb-1">DUVIDAS</p>
          <h2 className="font-syne font-bold text-xl text-foreground text-center mb-5">Perguntas frequentes</h2>
          <div className="space-y-2">
            {[
              { q: "Quando meu perfil fica visivel?", a: "Assim que o pagamento via PIX for confirmado, seu perfil ja aparece nas buscas. O processo leva menos de 5 minutos." },
              { q: "Pago alguma taxa por cliente que me contatar?", a: "Nao. Voce paga apenas a assinatura mensal. Nenhuma taxa sobre contatos, orcamentos ou servicos realizados." },
              { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade e sem multa. Cancele pelo painel a qualquer momento." },
              { q: "Como funciona o cupom UDIHUB90?", a: "Com o cupom UDIHUB90 voce ativa seu perfil no plano Basico por 90 dias. Apos esse periodo, o perfil e desativado e voce pode assinar normalmente para continuar." },
              { q: "Qual a diferenca entre Basico e Pro?", a: "No Plano Pro voce aparece antes dos perfis Basico nas buscas, tem badge de destaque e pode adicionar ate 10 fotos." },
            ].map(({ q, a }, i) => (
              <div key={q} className="rounded-2xl overflow-hidden"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <button type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-4">
                  <span className="text-sm font-semibold text-foreground">{q}</span>
                  <span className="text-muted flex-shrink-0 text-base leading-none"
                    style={{ display: "inline-block", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                    ⌄
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-xs leading-relaxed text-muted">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 py-10" style={{ borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
            Profissionais se cadastrando agora em Uberlandia
          </div>
          <h2 className="font-syne font-bold text-xl text-foreground mb-2">
            Seus clientes ja estao te procurando
          </h2>
          <p className="text-sm text-muted mb-6 max-w-xs mx-auto leading-relaxed">
            Entre para o UDIHUB e comece a receber clientes direto no WhatsApp.
          </p>
          <Link href="/cadastro"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.3)" }}>
            Criar meu perfil agora <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-muted mt-3">Sem fidelidade · Cancele quando quiser · PIX ou cartao</p>
        </div>
      </section>

    </div>
  );
}
