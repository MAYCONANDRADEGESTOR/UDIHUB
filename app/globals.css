import Link from "next/link";
import Image from "next/image";
import {
  Search, MapPin, Star, ArrowRight, CheckCircle,
  Shield, ChevronDown, Instagram,
  Mail, MessageCircle, Clock,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const HERO_CATEGORIES = CATEGORIES.slice(0, 8);

const HOW_IT_WORKS = [
  { step: "01", icon: Search, title: "Busque o serviço", desc: "Escolha entre 40 categorias e encontre profissionais no seu bairro.", color: "#3B82F6" },
  { step: "02", icon: Star, title: "Compare e escolha", desc: "Veja avaliações reais, fotos do trabalho e disponibilidade em tempo real.", color: "#FBBF24" },
  { step: "03", icon: MessageCircle, title: "Chame no WhatsApp", desc: "Um clique e você está falando direto com o profissional. Sem intermediários.", color: "#22c55e" },
];

const DIFFERENTIALS = [
  { icon: MapPin, title: "100% Local", desc: "Profissionais do seu bairro. Atendimento rápido e sem deslocamento longo.", color: "#3B82F6" },
  { icon: CheckCircle, title: "Sempre gratuito", desc: "Clientes nunca pagam nada. Busque, compare e contrate sem custo.", color: "#22c55e" },
  { icon: Shield, title: "Avaliações reais", desc: "Só quem contactou via WhatsApp pode avaliar. Zero avaliações falsas.", color: "#a855f7" },
  { icon: Clock, title: "Disponível agora", desc: "Veja quem está online e disponível para atender imediatamente.", color: "#FBBF24" },
];

const FAQ = [
  { q: "É realmente gratuito para clientes?", a: "Sim, 100%. Clientes buscam, visualizam perfis e entram em contato com profissionais sem pagar absolutamente nada, para sempre." },
  { q: "Como os profissionais aparecem na plataforma?", a: "Profissionais pagam uma mensalidade fixa. O Plano Básico (R$69/mês) coloca o perfil nas buscas. O Plano Pro (R$99/mês) dá destaque e aparece primeiro." },
  { q: "O UDIHUB está disponível em quais cidades?", a: "Lançamos em Uberlândia-MG. Em breve expandimos para Uberaba, Patos de Minas, Ituiutaba e outras cidades do Triângulo Mineiro." },
  { q: "Como funciona o sistema de avaliações?", a: "Apenas clientes que clicaram no WhatsApp de um profissional podem avaliá-lo. Isso garante avaliações 100% autênticas." },
  { q: "Posso cancelar a assinatura a qualquer momento?", a: "Sim. O profissional cancela pelo painel e o perfil fica ativo até o final do período pago. Sem multa ou fidelidade." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background mb-bottom-nav overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "rgba(9,9,11,0.92)", borderBottom: "1px solid #1F1F23" }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="UDIHUB" width={32} height={32} className="rounded-xl object-cover" />
            <span className="font-syne font-bold text-lg tracking-tight text-foreground">
              UDI<span style={{ color: "#3B82F6" }}>HUB</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/seja-profissional"
              className="hidden sm:block text-xs font-medium text-muted hover:text-foreground transition-colors">
              Para profissionais
            </Link>
            <Link href="/login"
              className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-all duration-200 active:scale-95"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 12px rgba(59,130,246,0.3)" }}>
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #09090B 0%, #0c1220 50%, #09090B 100%)" }}>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <div className="flex justify-center mb-5">
            <Image src="/logo.png" alt="UDIHUB" width={64} height={64} className="rounded-2xl object-cover"
              style={{ boxShadow: "0 0 30px rgba(139,92,246,0.35)" }} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-5 tracking-wide"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#3B82F6" }} />
            NOVO · Uberlândia · MG
          </div>
          <h1 className="font-syne font-bold leading-[1.15] mb-4"
            style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.2rem)", color: "#FAFAFA" }}>
            O profissional certo,{" "}
            <span style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #60a5fa 50%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              perto de você.
            </span>
          </h1>
          <p className="text-sm leading-relaxed mb-7 max-w-xs mx-auto" style={{ color: "#94a3b8" }}>
            Encontre profissionais no seu bairro. Grátis para clientes.{" "}
            <span style={{ color: "#93c5fd" }}>Profissional? Receba clientes pelo WhatsApp.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/servicos"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
              <Search size={16} />
              Buscar profissional
            </Link>
            <Link href="/seja-profissional"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-95"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd" }}>
              Quero receber clientes →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] font-black tracking-[0.15em] mb-1" style={{ color: "#3B82F6" }}>SERVIÇOS</p>
              <h2 className="font-syne font-bold text-lg text-foreground">O que você precisa?</h2>
            </div>
            <Link href="/servicos" className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#3B82F6" }}>
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {HERO_CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/servicos/${cat.slug}`}
                className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all duration-200 active:scale-95"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200"
                  style={{ background: "rgba(59,130,246,0.08)" }}>
                  {cat.icon}
                </div>
                <span className="text-[9px] leading-tight font-semibold" style={{ color: "#64748b" }}>
                  {cat.name.split("/")[0].trim()}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/servicos"
            className="mt-2.5 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-medium"
            style={{ background: "#111113", border: "1px solid #1F1F23", color: "#64748b" }}>
            Ver todas as {CATEGORIES.length} categorias <ChevronDown size={12} />
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 py-12" style={{ background: "#080809" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-black tracking-[0.15em] mb-1.5" style={{ color: "#3B82F6" }}>COMO FUNCIONA</p>
            <h2 className="font-syne font-bold text-lg text-foreground">3 passos simples</h2>
            <p className="text-xs mt-1.5" style={{ color: "#64748b" }}>Do problema à solução em menos de 1 minuto</p>
          </div>
          <div className="flex flex-col gap-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="flex items-start gap-3.5 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-syne font-bold text-sm text-foreground">{title}</h3>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
                      style={{ background: `${color}15`, color }}>{step}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIALS ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-black tracking-[0.15em] mb-1.5" style={{ color: "#3B82F6" }}>POR QUE USAR</p>
            <h2 className="font-syne font-bold text-lg text-foreground">Feito para Uberlândia</h2>
            <p className="text-xs mt-1.5" style={{ color: "#64748b" }}>Não é um app genérico. É o seu marketplace local.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DIFFERENTIALS.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: `${color}12` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <h3 className="font-syne font-bold text-xs text-foreground mb-1">{title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA PROFESSIONALS ── */}
      <section className="px-4 py-12" style={{ background: "#080809" }}>
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-7"
            style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2040 50%, #0a1628 100%)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-4"
                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                PARA PROFISSIONAIS
              </div>
              <h2 className="font-syne font-bold text-xl text-white mb-2.5 leading-tight">
                Receba clientes direto<br />no seu WhatsApp
              </h2>
              <p className="text-xs mb-2 leading-relaxed max-w-xs mx-auto" style={{ color: "#93c5fd" }}>
                Crie seu perfil e apareça para centenas de clientes buscando seu serviço em Uberlândia.
              </p>
              <p className="text-[11px] font-bold mb-5" style={{ color: "#3B82F6" }}>
                A partir de R$69/mês · Cancele quando quiser
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <Link href="/seja-profissional"
                  className="px-7 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.45)" }}>
                  Começar agora — grátis
                </Link>
                <Link href="/como-funciona"
                  className="px-7 py-3 rounded-xl font-medium text-xs transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#93c5fd" }}>
                  Como funciona
                </Link>
              </div>
              <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
                {["✓ Perfil ativo em minutos", "✓ Sem fidelidade", "✓ Suporte via WhatsApp"].map((item) => (
                  <span key={item} className="text-[10px] font-medium" style={{ color: "#475569" }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-black tracking-[0.15em] mb-1.5" style={{ color: "#3B82F6" }}>DÚVIDAS</p>
            <h2 className="font-syne font-bold text-lg text-foreground">Perguntas frequentes</h2>
          </div>
          <div className="flex flex-col gap-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl overflow-hidden"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none gap-4">
                  <span className="font-medium text-sm text-foreground">{q}</span>
                  <ChevronDown size={14} className="text-muted flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 py-10" style={{ background: "#060607", borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-5 text-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="UDIHUB" width={32} height={32} className="rounded-xl object-cover" />
              <span className="font-syne font-bold text-lg text-foreground">
                UDI<span style={{ color: "#3B82F6" }}>HUB</span>
              </span>
            </Link>
            <p className="text-xs max-w-xs leading-relaxed" style={{ color: "#475569" }}>
              O marketplace de serviços locais do Triângulo Mineiro.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: "/como-funciona", label: "Como funciona" },
                { href: "/seja-profissional", label: "Para profissionais" },
                { href: "/termos", label: "Termos" },
                { href: "/privacidade", label: "Privacidade" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-xs hover:text-foreground transition-colors"
                  style={{ color: "#475569" }}>{label}</Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/udihub" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Instagram size={15} style={{ color: "#64748b" }} />
              </a>
              <a href="mailto:Udihub@outlook.com"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Mail size={15} style={{ color: "#64748b" }} />
              </a>
            </div>
            <div className="w-full h-px" style={{ background: "#1F1F23" }} />
            <p className="text-[10px]" style={{ color: "#334155" }}>
              © 2025 UDIHUB · Uberlândia, MG · Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
