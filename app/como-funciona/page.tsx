import Link from "next/link";
import { Search, Star, MessageCircle, Shield, MapPin, CreditCard, ArrowRight, CheckCircle } from "lucide-react";

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 h-14 flex items-center"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/" className="mr-3 text-muted">←</Link>
        <h1 className="font-syne font-bold text-lg text-foreground">Como funciona</h1>
      </div>

      <div className="px-4 py-6 space-y-10 max-w-lg mx-auto">

        {/* Para Clientes */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
              <span className="text-xs">👤</span>
            </div>
            <h2 className="font-syne font-bold text-lg text-foreground">Para Clientes</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
              100% gratuito
            </span>
          </div>
          <div className="space-y-3">
            {[
              { icon: MapPin, step: "01", title: "Localização automática", desc: "O UDIHUB detecta sua cidade e bairro automaticamente. Você pode ajustar manualmente a qualquer momento." },
              { icon: Search, step: "02", title: "Busque por categoria", desc: "Escolha o tipo de serviço entre 54 categorias disponíveis: encanador, eletricista, diarista, piscineiro, arquiteto e muito mais." },
              { icon: Star, step: "03", title: "Compare e escolha", desc: "Veja perfis, avaliações de clientes reais, fotos do trabalho e disponibilidade em tempo real." },
              { icon: MessageCircle, step: "04", title: "Chame no WhatsApp", desc: "Um clique e você está em contato direto com o profissional. Sem intermediários, sem taxas." },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex gap-4 p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                  <Icon size={17} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-syne font-bold text-sm text-foreground">{title}</span>
                    <span className="text-xs font-bold" style={{ color: "#3B82F6" }}>{step}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Para Profissionais */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
              <span className="text-xs">💼</span>
            </div>
            <h2 className="font-syne font-bold text-lg text-foreground">Para Profissionais</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: CheckCircle, title: "Cadastro rápido", desc: "Crie seu perfil em minutos: foto, especialidade, bairros atendidos, WhatsApp e bio. Verificação por CPF para mais segurança." },
              { icon: CreditCard, title: "Escolha o plano", desc: "Plano Básico (R$69/mês) ou Pro (R$99/mês). Assinatura mensal recorrente. Cancele quando quiser." },
              { icon: MessageCircle, title: "Receba leads", desc: "Clientes da sua cidade e bairro entram em contato direto pelo WhatsApp. Cada clique é registrado no seu painel." },
              { icon: Star, title: "Construa reputação", desc: "Clientes que te contactaram podem avaliar seu serviço. Avaliações reais = mais clientes." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                  <Icon size={17} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <span className="font-syne font-bold text-sm text-foreground block">{title}</span>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Planos */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} style={{ color: "#3B82F6" }} />
            <h2 className="font-syne font-bold text-lg text-foreground">Planos disponíveis</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <p className="font-syne font-bold text-sm text-foreground mb-1">Básico</p>
              <p className="font-syne font-extrabold text-2xl mb-2" style={{ color: "#3B82F6" }}>R$69<span className="text-xs font-normal text-muted">/mês</span></p>
              <div className="space-y-1">
                {["Perfil ativo", "Aparece nas buscas", "Até 3 fotos", "Leads via WhatsApp"].map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <CheckCircle size={10} style={{ color: "#3B82F6" }} />
                    <span className="text-[10px] text-muted">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.4)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="font-syne font-bold text-sm text-white">Pro</p>
                <span className="badge-pro">PRO</span>
              </div>
              <p className="font-syne font-extrabold text-2xl mb-2" style={{ color: "#3B82F6" }}>R$99<span className="text-xs font-normal text-muted">/mês</span></p>
              <div className="space-y-1">
                {["Aparece primeiro", "Badge PRO", "Até 10 fotos", "Métricas avançadas"].map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <CheckCircle size={10} style={{ color: "#3B82F6" }} />
                    <span className="text-[10px]" style={{ color: "#93c5fd" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted text-center mt-2">Assinatura mensal recorrente · Cancele quando quiser</p>
        </section>

        {/* Segurança */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} style={{ color: "#3B82F6" }} />
            <h2 className="font-syne font-bold text-lg text-foreground">Segurança e confiança</h2>
          </div>
          <div className="p-4 rounded-2xl space-y-2" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            {[
              "Verificação por CPF e foto no cadastro",
              "Apenas clientes que contactaram o profissional podem avaliar",
              "Denúncias são analisadas pela equipe UDIHUB",
              "Perfis com número inválido são removidos",
              "Dados protegidos de acordo com a LGPD",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle size={13} style={{ color: "#22c55e" }} className="mt-0.5 flex-shrink-0" />
                <span className="text-xs text-muted leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link href="/servicos"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
            Buscar profissionais <ArrowRight size={15} />
          </Link>
          <Link href="/seja-profissional"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: "#111113", border: "1px solid #1F1F23", color: "#A1A1AA" }}>
            Sou profissional
          </Link>
        </div>
      </div>
    </div>
  );
}
