"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle, MessageCircle, Shield, ArrowRight,
  Zap, Users, MapPin, Clock, TrendingUp, Star, Bell, Crown
} from "lucide-react";

const NOTIFICACOES = [
  { nome: "Carlos S.", cidade: "Santa Monica", plano: "Gratuito", tempo: "2 min" },
  { nome: "Ana R.", cidade: "Tibery", plano: "Profissional", tempo: "5 min" },
  { nome: "Marcos P.", cidade: "Jardim Karaiba", plano: "Gratuito", tempo: "8 min" },
  { nome: "Fernanda L.", cidade: "Copacabana", plano: "Profissional", tempo: "12 min" },
  { nome: "Roberto M.", cidade: "Saraiva", plano: "Gratuito", tempo: "15 min" },
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
            Comece de graca e receba seus primeiros clientes. Sem cartao, sem compromisso.
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
                <p className="text-[10px] text-muted">entrou no Plano {notif.plano} · ha {notif.tempo}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
            </div>
          </div>
          <Link href="/cadastro"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.3)" }}>
            Comecar gratuitamente <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-muted mt-3">Sem cartao de credito · Sem fidelidade</p>
        </div>
      </section>

      {/* PLANOS */}
      <section className="px-4 py-8">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold tracking-widest text-muted text-center mb-1">PLANOS</p>
          <h2 className="font-syne font-bold text-xl text-foreground text-center mb-1">Escolha como comecar</h2>
          <p className="text-xs text-muted text-center mb-6">Teste gratis, sem compromisso</p>
          <div className="space-y-3">

            {/* GRATUITO */}
            <div className="relative rounded-2xl p-5"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-bold text-muted mb-0.5">Gratuito</p>
                  <p className="text-xs text-muted">Receba seus primeiros clientes sem pagar nada</p>
                </div>
                <div className="text-right">
                  <div className="flex items-end gap-0.5">
                    <span className="font-syne font-bold text-2xl text-foreground">R$0</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Perfil ativo na plataforma", "Aparece nas buscas", "Ate 3 fotos no perfil", "Receba até 5 clientes únicos por mes", "Leads via WhatsApp", "Pagina publica profissional"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#22c55e" }} className="flex-shrink-0" />
                    <span className="text-xs text-muted">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
                Comecar Gratuitamente
              </Link>
            </div>

            {/* PROFISSIONAL — MAIS POPULAR */}
            <div className="relative rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, #0F1729, #1a2f5a)", border: "2px solid #3B82F6" }}>
              <div className="absolute -top-3 left-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold text-white flex items-center gap-1"
                  style={{ background: "#3B82F6" }}>🔥 MAIS POPULAR</span>
              </div>
              <div className="flex items-start justify-between mb-3 mt-1">
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: "#93c5fd" }}>Profissional</p>
                  <p className="text-xs text-muted">Receba clientes ilimitados todos os meses</p>
                </div>
                <div className="text-right">
                  <div className="flex items-end gap-0.5">
                    <span className="font-syne font-bold text-2xl text-white">R$59,90</span>
                    <span className="text-xs text-muted mb-0.5">/mes</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Clientes ilimitados", "WhatsApp ilimitado", "Ate 15 fotos", "Perfil destacado", "Aparece antes dos perfis gratuitos", "Selo Verificado", "Painel de metricas", "Estatisticas de contatos", "Suporte prioritario"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                    <span className="text-xs text-white">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
                Assinar Agora
              </Link>
            </div>

            {/* PROFISSIONAL ANUAL — MAIOR ECONOMIA */}
            <div className="relative rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, #1a1304, #3b2a06)", border: "2px solid #FBBF24" }}>
              <div className="absolute -top-3 left-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold text-black flex items-center gap-1"
                  style={{ background: "#FBBF24" }}>👑 MAIOR ECONOMIA</span>
              </div>
              <div className="flex items-start justify-between mb-3 mt-1">
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: "#FBBF24" }}>Profissional Anual</p>
                  <p className="text-xs text-muted">Apenas R$41,66/mes</p>
                </div>
                <div className="text-right">
                  <div className="flex items-end gap-0.5">
                    <span className="font-syne font-bold text-2xl text-white">R$499,90</span>
                    <span className="text-xs text-muted mb-0.5">/ano</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Tudo do plano Profissional", "Destaque Premium", "Maior exposicao na categoria", "Selo Parceiro UdiHub", "Economia de mais de R$200 por ano"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={13} style={{ color: "#FBBF24" }} className="flex-shrink-0" />
                    <span className="text-xs text-white">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/cadastro"
                className="block text-center py-3 rounded-xl font-bold text-sm text-black"
                style={{ background: "linear-gradient(135deg, #FBBF24, #f59e0b)" }}>
                Assinar Plano Anual
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
              { num: "01", icon: Zap, color: "#3B82F6", title: "Crie seu perfil gratis", desc: "Cadastre-se em minutos e seu perfil ja fica ativo no Plano Gratuito." },
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
              { icon: Clock, color: "#f59e0b", title: "Ativo em minutos", desc: "Cadastre-se e apareca nas buscas na hora." },
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
              { q: "Quando meu perfil fica visivel?", a: "Assim que voce concluir o cadastro, seu perfil ja fica ativo no Plano Gratuito e aparece nas buscas imediatamente." },
              { q: "Pago alguma taxa por cliente que me contatar?", a: "Nao. No plano pago voce paga apenas a assinatura mensal ou anual. Nenhuma taxa sobre contatos, orcamentos ou servicos realizados." },
              { q: "Como funciona o limite de 5 clientes no Plano Gratuito?", a: "No Plano Gratuito voce pode receber até 5 clientes únicos por mes. Esse limite se renova automaticamente a cada 30 dias. Ao atingir o limite, voce pode fazer upgrade para o Plano Profissional e receber clientes ilimitados." },
              { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade e sem multa. Cancele pelo painel a qualquer momento e seu perfil volta para o Plano Gratuito." },
              { q: "Qual a diferenca entre Gratuito e Profissional?", a: "No Plano Profissional voce recebe clientes ilimitados, aparece antes dos perfis gratuitos nas buscas, tem selo de verificado e acesso a metricas avancadas." },
              { q: "Vale mais a pena o plano mensal ou anual?", a: "O Plano Anual sai por R$499,90, equivalente a R$41,66 por mes — uma economia de mais de R$200 em relacao ao plano mensal, alem de destaque premium na categoria." },
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
            Entre para o UDIHUB de graca e comece a receber clientes direto no WhatsApp.
          </p>
          <Link href="/cadastro"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.3)" }}>
            Criar meu perfil gratis <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-muted mt-3">Sem cartao de credito · Sem fidelidade</p>
        </div>
      </section>

    </div>
  );
}
