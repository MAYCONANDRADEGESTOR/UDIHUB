"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Star, ArrowRight, CheckCircle,
  Shield, ChevronDown, Instagram, Mail, MessageCircle,
  Clock, User, Briefcase, LogOut, ChevronRight, Zap, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

const DIFFERENTIALS = [
  { icon: MapPin, title: "100% Local", desc: "Profissionais do seu bairro. Atendimento rapido e sem deslocamento longo.", color: "#3B82F6" },
  { icon: CheckCircle, title: "Sempre gratuito", desc: "Clientes nunca pagam nada. Busque, compare e contrate sem custo.", color: "#22c55e" },
  { icon: Shield, title: "Avaliacoes reais", desc: "So quem contactou via WhatsApp pode avaliar. Zero avaliacoes falsas.", color: "#a855f7" },
  { icon: Clock, title: "Disponivel agora", desc: "Veja quem esta online e disponivel para atender imediatamente.", color: "#FBBF24" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Search, title: "Busque o servico", desc: "Escolha entre 107 categorias e encontre profissionais no seu bairro.", color: "#3B82F6" },
  { step: "02", icon: Star, title: "Compare e escolha", desc: "Veja avaliacoes reais, fotos do trabalho e disponibilidade em tempo real.", color: "#FBBF24" },
  { step: "03", icon: MessageCircle, title: "Chame no WhatsApp", desc: "Um clique e voce esta falando direto com o profissional. Sem intermediarios.", color: "#22c55e" },
];

const FAQ = [
  { q: "E realmente gratuito para clientes?", a: "Sim, 100%. Clientes buscam, visualizam perfis e entram em contato com profissionais sem pagar absolutamente nada, para sempre." },
  { q: "Como os profissionais aparecem na plataforma?", a: "Profissionais pagam uma mensalidade fixa. O Plano Basico (R$69/mes) coloca o perfil nas buscas. O Plano Pro (R$99/mes) da destaque e aparece primeiro." },
  { q: "O UDIHUB esta disponivel em quais cidades?", a: "Lancamos em Uberlandia-MG. Em breve expandimos para Uberaba, Patos de Minas, Ituiutaba e outras cidades do Triangulo Mineiro." },
  { q: "Como funciona o sistema de avaliacoes?", a: "Apenas clientes que clicaram no WhatsApp de um profissional podem avalia-lo. Isso garante avaliacoes 100% autênticas." },
  { q: "Posso cancelar a assinatura a qualquer momento?", a: "Sim. O profissional cancela pelo painel e o perfil fica ativo ate o final do periodo pago. Sem multa ou fidelidade." },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from("users").select("name, role, avatar")
          .eq("id", user.id).single();
        setProfile(data);
      }
      setLoadingUser(false);
    }
    loadUser();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setShowUserMenu(false);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-20">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "rgba(9,9,11,0.92)", borderBottom: "1px solid #1F1F23", backdropFilter: "blur(20px)" }}>
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

            {loadingUser ? (
              <div className="w-8 h-8 rounded-xl skeleton" />
            ) : user && profile ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-6 h-6 rounded-lg object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                      style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                      {getInitials(profile.name || "?")}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-[9px] font-medium leading-none mb-0.5" style={{ color: "#64748b" }}>
                      {profile.role === "professional" ? "Profissional" : profile.role === "admin" ? "Admin" : "Cliente"}
                    </div>
                    <div className="text-[11px] font-semibold text-foreground leading-none truncate max-w-[80px]">
                      {profile.name?.split(" ")[0]}
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
                  <ChevronDown size={12} className="text-muted flex-shrink-0" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-xl z-50 animate-slide-up"
                    style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                    <div className="px-4 py-3" style={{ borderBottom: "1px solid #1F1F23" }}>
                      <p className="text-xs font-bold text-foreground">{profile.name}</p>
                      <p className="text-[10px] text-muted">{user.email}</p>
                    </div>
                    <div className="py-1.5">
                      {profile.role === "professional" && (
                        <Link href="/painel" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03]">
                          <Briefcase size={14} style={{ color: "#3B82F6" }} />
                          <span className="text-xs font-medium text-foreground">Meu painel</span>
                          <ChevronRight size={12} className="text-muted ml-auto" />
                        </Link>
                      )}
                      {profile.role === "client" && (
                        <Link href="/inicio" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03]">
                          <Search size={14} style={{ color: "#3B82F6" }} />
                          <span className="text-xs font-medium text-foreground">Buscar profissionais</span>
                          <ChevronRight size={12} className="text-muted ml-auto" />
                        </Link>
                      )}
                      {profile.role === "admin" && (
                        <Link href="/admin" onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03]">
                          <Shield size={14} style={{ color: "#3B82F6" }} />
                          <span className="text-xs font-medium text-foreground">Painel Admin</span>
                          <ChevronRight size={12} className="text-muted ml-auto" />
                        </Link>
                      )}
                      <Link href="/perfil" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03]">
                        <User size={14} className="text-muted" />
                        <span className="text-xs font-medium text-foreground">Meu perfil</span>
                        <ChevronRight size={12} className="text-muted ml-auto" />
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-white/[0.03]"
                        style={{ borderTop: "1px solid #1F1F23" }}>
                        <LogOut size={14} style={{ color: "#f87171" }} />
                        <span className="text-xs font-medium" style={{ color: "#f87171" }}>Sair</span>
                      </button>
                    </div>
                  </div>
                )}
                {showUserMenu && (
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                )}
              </div>
            ) : (
              <Link href="/login"
                className="text-xs font-bold px-4 py-2 rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 12px rgba(59,130,246,0.3)" }}>
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #09090B 0%, #0c1220 50%, #09090B 100%)" }}>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] pointer-events-none rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold mb-5 tracking-wide"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#3B82F6" }} />
            NOVO · Uberlandia · MG
          </div>
          <h1 className="font-syne font-bold text-2xl text-foreground leading-snug mb-4">
            O profissional certo,{" "}
            <span style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #60a5fa 50%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              perto de voce.
            </span>
          </h1>
          <p className="text-sm leading-relaxed mb-7 max-w-xs mx-auto" style={{ color: "#94a3b8" }}>
            Encontre profissionais no seu bairro. Para clientes.{" "}
            <span style={{ color: "#93c5fd" }}>Profissional? Receba clientes pelo WhatsApp.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link href="/servicos"
              className="flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-white active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
              Buscar profissional
            </Link>
            <Link href="/seja-profissional"
              className="flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-xs active:scale-95 transition-all"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.35)", color: "#93c5fd" }}>
              Quero receber clientes
            </Link>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-bold tracking-widest mb-1.5" style={{ color: "#3B82F6" }}>POR QUE USAR</p>
            <h2 className="font-syne font-bold text-xl text-foreground">Feito para Uberlandia</h2>
            <p className="text-xs mt-1.5 text-muted">Nao e um app generico. E o seu marketplace local.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DIFFERENTIALS.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: `${color}12` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <h3 className="font-syne font-bold text-xs text-foreground mb-1">{title}</h3>
                <p className="text-[11px] leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ com Como Funciona dentro */}
      <section className="px-4 py-12" style={{ background: "#080809" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[10px] font-bold tracking-widest mb-1.5" style={{ color: "#3B82F6" }}>DUVIDAS</p>
            <h2 className="font-syne font-bold text-xl text-foreground">Perguntas frequentes</h2>
          </div>
          <div className="flex flex-col gap-2">

            {/* Como funciona */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#111113", border: "1px solid rgba(59,130,246,0.2)" }}>
              <button type="button"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-4">
                <span className="text-sm font-semibold text-foreground">Como funciona o UDIHUB?</span>
                <span className="text-muted flex-shrink-0 text-base leading-none"
                  style={{ display: "inline-block", transform: showHowItWorks ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                  ⌄
                </span>
              </button>
              {showHowItWorks && (
                <div className="px-4 pb-4 space-y-3">
                  {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }) => (
                    <div key={step} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #1F1F23" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15` }}>
                        <Icon size={15} style={{ color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold" style={{ color }}>{step}</span>
                          <p className="font-syne font-bold text-xs text-foreground">{title}</p>
                        </div>
                        <p className="text-[11px] leading-relaxed text-muted">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FAQs */}
            {FAQ.map(({ q, a }, i) => (
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

      {/* FOOTER */}
      <footer className="px-4 py-10" style={{ background: "#060607", borderTop: "1px solid #1F1F23" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-5 text-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="UDIHUB" width={32} height={32} className="rounded-xl object-cover" />
              <span className="font-syne font-bold text-lg text-foreground">
                UDI<span style={{ color: "#3B82F6" }}>HUB</span>
              </span>
            </Link>
            <p className="text-xs max-w-xs leading-relaxed text-muted">
              O marketplace de servicos locais do Triangulo Mineiro.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { href: "/como-funciona", label: "Como funciona" },
                { href: "/seja-profissional", label: "Para profissionais" },
                { href: "/termos", label: "Termos" },
                { href: "/privacidade", label: "Privacidade" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-xs text-muted hover:text-foreground transition-colors">
                  {label}
                </Link>
              ))}
            </div>

            {/* Icones sociais — Instagram + Email + WhatsApp */}
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/udihub" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Instagram size={15} className="text-muted" />
              </a>
              <a href="mailto:Udihub@outlook.com"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Mail size={15} className="text-muted" />
              </a>
              <a href="https://wa.me/5519990177838?text=Ola!%20Vim%20pelo%20UDIHUB%20e%20preciso%20de%20ajuda."
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-muted">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>

            <div className="w-full h-px" style={{ background: "#1F1F23" }} />
            <p className="text-[10px] text-muted">
              © 2025 UDIHUB · Uberlandia, MG · Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
