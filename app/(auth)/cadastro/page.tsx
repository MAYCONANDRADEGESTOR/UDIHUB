"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Briefcase, Loader2, Check } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";

type Step = "role" | "info" | "professional";

export default function CadastroPage() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"client" | "professional" | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
    neighborhood: "",
    // professional fields
    whatsapp: "",
    category: "",
    bio: "",
    plan: "basic" as "basic" | "pro",
  });

  const uberlandia = CITIES.find((c) => c.slug === "uberlandia");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: Supabase auth + profile creation
    setTimeout(() => setLoading(false), 1500);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#111113", border: "1px solid #1F1F23", outline: "none" };

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}
    >
      {/* Back */}
      <button
        onClick={() => step === "role" ? null : setStep(step === "professional" ? "info" : "role")}
        className="flex items-center gap-2 text-muted mb-8 w-fit"
      >
        <ArrowLeft size={18} />
        <Link href={step === "role" ? "/" : "#"} className="text-sm">Voltar</Link>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}
        >
          U
        </div>
        <span className="font-syne font-bold text-xl text-foreground">
          UDI<span style={{ color: "#3B82F6" }}>HUB</span>
        </span>
      </div>

      {/* STEP 1: Role selection */}
      {step === "role" && (
        <div className="animate-slide-up">
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Criar conta
          </h1>
          <p className="text-sm text-muted mb-8">Como você vai usar o UDIHUB?</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setRole("client"); setStep("info"); }}
              className="card-hover flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
              style={{
                background: "#111113",
                border: role === "client" ? "1px solid #3B82F6" : "1px solid #1F1F23",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.1)" }}
              >
                <User size={22} style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <h3 className="font-syne font-bold text-foreground">Sou cliente</h3>
                <p className="text-xs text-muted mt-0.5">
                  Quero encontrar profissionais para me atender
                </p>
                <span className="text-xs font-bold mt-1 inline-block" style={{ color: "#22c55e" }}>
                  100% gratuito
                </span>
              </div>
            </button>

            <button
              onClick={() => { setRole("professional"); setStep("info"); }}
              className="card-hover flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200"
              style={{
                background: "#111113",
                border: role === "professional" ? "1px solid #3B82F6" : "1px solid #1F1F23",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.2))",
                }}
              >
                <Briefcase size={22} style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-syne font-bold text-foreground">Sou profissional</h3>
                  <span className="badge-pro">PRO</span>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Quero anunciar meus serviços e receber clientes
                </p>
                <span className="text-xs font-bold mt-1 inline-block" style={{ color: "#3B82F6" }}>
                  A partir de R$69/mês
                </span>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted">
              Já tem conta?{" "}
              <Link href="/login" className="font-semibold" style={{ color: "#3B82F6" }}>
                Entrar
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Basic info */}
      {step === "info" && (
        <div className="animate-slide-up">
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Seus dados
          </h1>
          <p className="text-sm text-muted mb-6">Preencha suas informações básicas</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              role === "professional" ? setStep("professional") : handleSubmit(e);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Nome completo</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(34) 99999-9999"
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Bairro</label>
              <select
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                className={inputClass}
                style={{ ...inputStyle, color: form.neighborhood ? "#FAFAFA" : "#A1A1AA" }}
              >
                <option value="">Selecione seu bairro</option>
                {uberlandia?.neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Senha</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-4 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 20px rgba(59,130,246,0.3)",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {role === "professional" ? "Continuar" : "Criar conta"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: Professional info */}
      {step === "professional" && (
        <div className="animate-slide-up">
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Perfil profissional
          </h1>
          <p className="text-sm text-muted mb-6">Configure como você aparecerá nas buscas</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(34) 99999-9999"
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Categoria de serviço</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className={inputClass}
                style={{ ...inputStyle, color: form.category ? "#FAFAFA" : "#A1A1AA" }}
              >
                <option value="">Selecione sua especialidade</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Mini bio (opcional)</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Fale um pouco sobre você e seus serviços..."
                rows={3}
                className={inputClass}
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>

            {/* Plan selection */}
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Escolha seu plano</label>
              <div className="grid grid-cols-2 gap-2">
                {(["basic", "pro"] as const).map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setForm({ ...form, plan })}
                    className="p-3 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: "#111113",
                      border: form.plan === plan ? "1px solid #3B82F6" : "1px solid #1F1F23",
                      boxShadow: form.plan === plan ? "0 0 12px rgba(59,130,246,0.2)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-syne font-bold text-sm text-foreground capitalize">
                        {plan === "pro" ? "Pro" : "Básico"}
                      </span>
                      {form.plan === plan && (
                        <Check size={12} style={{ color: "#3B82F6" }} />
                      )}
                    </div>
                    <span className="font-bold text-base" style={{ color: "#3B82F6" }}>
                      R${plan === "pro" ? "99" : "69"}<span className="text-xs font-normal text-muted">/mês</span>
                    </span>
                    {plan === "pro" && (
                      <p className="text-[10px] text-muted mt-0.5">Aparece primeiro</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-4 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 20px rgba(59,130,246,0.3)",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Criar perfil e pagar
            </button>

            <p className="text-center text-xs text-muted pt-1">
              Pagamento seguro via PIX ou cartão pelo Asaas.
              Perfil ativo imediatamente após confirmação.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
