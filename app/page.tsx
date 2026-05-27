import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  ChevronDown,
  Instagram,
  Mail,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const HERO_CATEGORIES = CATEGORIES.slice(0, 8);

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Busque",
    desc: "Escolha a categoria de serviço e encontre profissionais na sua cidade e bairro.",
  },
  {
    step: "02",
    icon: Star,
    title: "Escolha",
    desc: "Compare perfis, avaliações e portfólios. Veja quem está disponível agora.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Chame",
    desc: "Um clique no WhatsApp e você está em contato direto com o profissional.",
  },
];

const DIFFERENTIALS = [
  {
    icon: MapPin,
    title: "100% Local",
    desc: "Profissionais da sua cidade e do seu bairro. Atendimento rápido e próximo.",
  },
  {
    icon: CheckCircle,
    title: "Gratuito para clientes",
    desc: "Você nunca paga nada para buscar e contratar. Plataforma 100% gratuita.",
  },
  {
    icon: Shield,
    title: "Profissionais verificados",
    desc: "Perfis com avaliações reais de clientes. Denúncias moderadas pelo admin.",
  },
  {
    icon: TrendingUp,
    title: "Leads reais",
    desc: "Cada contato via WhatsApp é registrado. Profissionais acompanham em tempo real.",
  },
];

const FAQ = [
  {
    q: "É gratuito para clientes?",
    a: "Sim! Clientes buscam, visualizam perfis e entram em contato com profissionais sem pagar nada, sempre.",
  },
  {
    q: "Como os profissionais aparecem na plataforma?",
    a: "Profissionais se cadastram e escolhem um plano mensal. O Plano Básico (R$69/mês) já coloca o perfil nas buscas. O Plano Pro (R$99/mês) dá destaque e aparece primeiro.",
  },
  {
    q: "O UDIHUB está disponível em quais cidades?",
    a: "Lançamos em Uberlândia-MG. Em breve expandimos para Uberaba, Patos de Minas, Ituiutaba e outras cidades do Triângulo Mineiro.",
  },
  {
    q: "Como funciona o sistema de avaliações?",
    a: "Apenas clientes que clicaram no WhatsApp de um profissional podem avaliá-lo. Isso garante avaliações autênticas de quem realmente entrou em contato.",
  },
  {
    q: "Posso cancelar a assinatura a qualquer momento?",
    a: "Sim. O profissional cancela pelo painel e o perfil fica ativo até o final do período pago.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background mb-bottom-nav">
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(9,9,11,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 12px rgba(59,130,246,0.4)",
              }}
            >
              U
            </div>
            <span className="font-syne font-bold text-xl text-foreground tracking-tight">
              UDI<span style={{ color: "#3B82F6" }}>HUB</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/seja-profissional"
              className="hidden sm:block text-sm font-medium text-muted hover:text-foreground transition-colors duration-200"
            >
              Seja profissional
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 16px rgba(59,130,246,0.3)",
                color: "white",
              }}
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative pt-24 pb-16 px-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}
      >
        {/* Background glow blobs */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#93c5fd",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Uberlândia · Triângulo Mineiro
          </div>

          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl leading-tight mb-4"
            style={{ color: "#FAFAFA" }}>
            Encontre o profissional{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3B82F6, #93c5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              certo
            </span>
            , perto de você.
          </h1>

          <p className="text-muted text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Marketplace local de serviços para o Triângulo Mineiro. Encanadores, eletricistas, diaristas e muito mais — todos verificados e avaliados.
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-lg mx-auto mb-8">
            <div
              className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "#111113",
                border: "1px solid #1F1F23",
              }}
            >
              <Search size={18} className="text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Qual serviço você precisa?"
                className="flex-1 bg-transparent text-sm text-foreground placeholder-muted outline-none"
              />
            </div>
            <Link
              href="/servicos"
              className="px-5 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center gap-2 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 20px rgba(59,130,246,0.4)",
              }}
            >
              <Search size={16} />
              <span className="hidden sm:inline">Buscar</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-center">
            {[
              { value: "200+", label: "Profissionais" },
              { value: "23", label: "Categorias" },
              { value: "5k+", label: "Leads gerados" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-syne font-bold text-xl" style={{ color: "#3B82F6" }}>
                  {value}
                </div>
                <div className="text-xs text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-syne font-bold text-2xl text-foreground">
              Categorias
            </h2>
            <Link
              href="/servicos"
              className="text-sm font-medium flex items-center gap-1 transition-colors duration-200"
              style={{ color: "#3B82F6" }}
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {HERO_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/servicos/${cat.slug}`}
                className="card-hover flex flex-col items-center gap-2 p-3 rounded-2xl text-center group"
                style={{ background: "#111113" }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[10px] text-muted group-hover:text-foreground transition-colors duration-200 leading-tight font-medium">
                  {cat.name.split("/")[0].trim()}
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/servicos"
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "#111113",
              border: "1px solid #1F1F23",
              color: "#A1A1AA",
            }}
          >
            Ver todas as {CATEGORIES.length} categorias <ChevronDown size={14} />
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 py-12" style={{ background: "#0A0A0E" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#3B82F6" }}>
              COMO FUNCIONA
            </p>
            <h2 className="font-syne font-bold text-2xl text-foreground">
              3 passos simples
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, i) => (
              <div
                key={step}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <Icon size={18} style={{ color: "#3B82F6" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-syne font-bold text-foreground">{title}</span>
                    <span className="text-xs font-bold" style={{ color: "#3B82F6" }}>{step}</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIALS ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#3B82F6" }}>
              POR QUE USAR
            </p>
            <h2 className="font-syne font-bold text-2xl text-foreground">
              Diferenciais do UDIHUB
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DIFFERENTIALS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "rgba(59,130,246,0.1)" }}
                >
                  <Icon size={16} style={{ color: "#3B82F6" }} />
                </div>
                <h3 className="font-syne font-bold text-sm text-foreground mb-1">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA PROFESSIONALS ── */}
      <section className="px-4 py-12" style={{ background: "#0A0A0E" }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-center"
            style={{
              background: "linear-gradient(135deg, #0F1729 0%, #1e3a5f 100%)",
              border: "1px solid rgba(59,130,246,0.3)",
              boxShadow: "0 0 40px rgba(59,130,246,0.15)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                filter: "blur(30px)",
                transform: "translate(30%, -30%)",
              }}
            />
            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                style={{
                  background: "rgba(59,130,246,0.2)",
                  border: "1px solid rgba(59,130,246,0.4)",
                  color: "#93c5fd",
                }}
              >
                💼 PARA PROFISSIONAIS
              </div>
              <h2 className="font-syne font-extrabold text-2xl sm:text-3xl text-white mb-3">
                Receba clientes direto no seu WhatsApp
              </h2>
              <p className="text-sm mb-6 leading-relaxed max-w-sm mx-auto" style={{ color: "#93c5fd" }}>
                Crie seu perfil, apareça nas buscas e receba leads de clientes da sua cidade.
                A partir de <strong className="text-white">R$69/mês</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/seja-profissional"
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                    boxShadow: "0 0 24px rgba(59,130,246,0.5)",
                  }}
                >
                  Cadastre-se grátis
                </Link>
                <Link
                  href="/como-funciona"
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#93c5fd",
                  }}
                >
                  Saiba mais
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "#3B82F6" }}>
              DÚVIDAS FREQUENTES
            </p>
            <h2 className="font-syne font-bold text-2xl text-foreground">FAQ</h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl overflow-hidden"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                <summary className="flex items-center justify-between px-4 py-4 cursor-pointer list-none">
                  <span className="font-semibold text-sm text-foreground pr-4">{q}</span>
                  <ChevronDown
                    size={16}
                    className="text-muted flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-4 py-10"
        style={{ background: "#0A0A0E", borderTop: "1px solid #1F1F23" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}
              >
                U
              </div>
              <span className="font-syne font-bold text-xl text-foreground">
                UDI<span style={{ color: "#3B82F6" }}>HUB</span>
              </span>
            </Link>

            <p className="text-sm text-muted max-w-xs">
              Encontre o profissional certo, perto de você. Triângulo Mineiro.
            </p>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { href: "/como-funciona", label: "Como funciona" },
                { href: "/seja-profissional", label: "Para profissionais" },
                { href: "/termos", label: "Termos de uso" },
                { href: "/privacidade", label: "Privacidade" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-muted hover:text-foreground transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/udihub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                <Instagram size={18} className="text-muted hover:text-foreground" />
              </a>
              <a
                href="mailto:Udihub@outlook.com"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                <Mail size={18} className="text-muted hover:text-foreground" />
              </a>
            </div>

            <p className="text-xs text-muted">
              © 2025 UDIHUB · Uberlândia, MG
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
