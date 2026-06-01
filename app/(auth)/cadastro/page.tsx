"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Briefcase, Loader2, Check, Camera, X, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

type Step = "role" | "info" | "verify" | "professional";
const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

async function sendEmail(type: string, to: string, name: string) {
  try {
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, name }),
    });
  } catch {}
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

function validateCPF(cpf: string) {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"client" | "professional" | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [couponValid, setCouponValid] = useState<null | "free_forever" | "trial_30days">(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    neighborhood: "", cpf: "", birthDate: "",
    whatsapp: "", category: "", bio: "",
    plan: "basic" as "basic" | "pro",
    coupon: "",
  });

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#09090B", border: "1px solid #1F1F23", outline: "none", width: "100%" };

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto muito grande. Máximo 5MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async function checkCoupon(code: string) {
    if (!code) { setCouponValid(null); return; }
    setCouponChecking(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select("type, active")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single();
    if (data) {
      setCouponValid(data.type as "free_forever" | "trial_30days");
      if (data.type === "free_forever") toast.success("🎉 Cupom válido! Acesso gratuito permanente!");
      if (data.type === "trial_30days") toast.success("🎉 Cupom válido! 30 dias grátis!");
    } else {
      setCouponValid(null);
      toast.error("Cupom inválido ou expirado");
    }
    setCouponChecking(false);
  }

  async function handleSubmitVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!avatarFile) { toast.error("Adicione uma foto sua para continuar"); return; }
    if (!validateCPF(form.cpf)) { toast.error("CPF inválido"); return; }
    if (role === "professional") { setStep("professional"); return; }
    await handleFinalSubmit("client");
  }

  async function handleSubmitProfessional(e: React.FormEvent) {
    e.preventDefault();
    await handleFinalSubmit("professional");
  }

  async function handleFinalSubmit(userRole: "client" | "professional") {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    });

    if (error) {
      toast.error(error.message === "User already registered" ? "Este email já está cadastrado" : error.message);
      setLoading(false);
      return;
    }
    if (!data.user) { toast.error("Erro ao criar conta"); setLoading(false); return; }

    let avatarUrl: string | null = null;
    if (avatarFile) avatarUrl = await uploadAvatar(data.user.id, avatarFile);

    await supabase.from("users").upsert({
      id: data.user.id,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      neighborhood: form.neighborhood || null,
      city: "Uberlândia",
      role: userRole,
      cpf: form.cpf.replace(/\D/g, ""),
      avatar: avatarUrl,
      birth_date: form.birthDate || null,
      banned: false,
    }, { onConflict: "id" });

    if (userRole === "professional") {
      const { data: cat } = await supabase
        .from("categories").select("id").eq("slug", form.category).single();

      if (cat) {
        let profStatus = "inactive";
        let trialEndsAt = null;

        if (couponValid === "free_forever") {
          profStatus = "active";
        } else if (couponValid === "trial_30days") {
          profStatus = "active";
          trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        await supabase.from("professionals").upsert({
          user_id: data.user.id,
          slug: `${slugify(form.name)}-${Date.now()}`,
          bio: form.bio || null,
          whatsapp: form.whatsapp.replace(/\D/g, ""),
          category_id: cat.id,
          plan: form.plan,
          status: profStatus,
          avatar: avatarUrl,
          coupon_code: form.coupon || null,
          trial_ends_at: trialEndsAt,
        }, { onConflict: "user_id" });

        if (form.coupon && couponValid) {
          await supabase.rpc("increment_coupon_uses", { coupon_code: form.coupon.toUpperCase() }).catch(() => {});
        }
      }

      await sendEmail("welcome", form.email, form.name);

      if (couponValid === "free_forever") {
        toast.success("🎉 Perfil ativo! Cupom UDIHUBPRO aplicado com sucesso!");
        router.push("/painel");
      } else if (couponValid === "trial_30days") {
        toast.success("🎉 30 dias grátis ativados! Aproveite o UDIHUB!");
        router.push("/painel");
      } else {
        await sendEmail("professional_active", form.email, form.name);
        toast.success("Perfil criado! Ative sua assinatura para aparecer nas buscas.");
        router.push("/painel/assinatura");
      }
    } else {
      await sendEmail("welcome", form.email, form.name);
      toast.success("Conta criada com sucesso!");
      router.push("/inicio");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>
      <button onClick={() => {
        if (step === "role") router.push("/");
        else if (step === "info") setStep("role");
        else if (step === "verify") setStep("info");
        else if (step === "professional") setStep("verify");
      }} className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} /><span className="text-sm">Voltar</span>
      </button>

      <div className="flex items-center gap-2.5 mb-8">
        <Image src="/logo.png" alt="UDIHUB" width={36} height={36} className="rounded-xl object-cover" />
        <span className="font-syne font-black text-xl text-foreground">
          UDI<span style={{ color: "#3B82F6" }}>HUB</span>
        </span>
      </div>

      {step !== "role" && (
        <div className="flex items-center gap-2 mb-6">
          {(role === "professional" ? ["info", "verify", "professional"] : ["info", "verify"]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: step === s ? "#3B82F6" : (["info", "verify", "professional"].indexOf(step) > i ? "rgba(59,130,246,0.3)" : "#1F1F23"),
                  color: step === s ? "white" : "#A1A1AA"
                }}>{i + 1}</div>
              {i < (role === "professional" ? 2 : 1) && <div className="flex-1 h-px w-8" style={{ background: "#1F1F23" }} />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 — Escolha de perfil (sem Google) */}
      {step === "role" && (
        <div className="animate-slide-up">
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">Criar conta</h1>
          <p className="text-sm text-muted mb-6">Como você vai usar o UDIHUB?</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setRole("client"); setStep("info"); }}
              className="flex items-center gap-4 p-4 rounded-2xl text-left"
              style={{ background: "#111113", border: role === "client" ? "1px solid #3B82F6" : "1px solid #1F1F23" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.1)" }}>
                <User size={22} style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <h3 className="font-syne font-bold text-foreground">Sou cliente</h3>
                <p className="text-xs text-muted mt-0.5">Quero encontrar profissionais</p>
                <span className="text-xs font-bold mt-1 inline-block" style={{ color: "#22c55e" }}>100% gratuito</span>
              </div>
            </button>
            <button onClick={() => { setRole("professional"); setStep("info"); }}
              className="flex items-center gap-4 p-4 rounded-2xl text-left"
              style={{ background: "#111113", border: role === "professional" ? "1px solid #3B82F6" : "1px solid #1F1F23" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(59,130,246,0.15)" }}>
                <Briefcase size={22} style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-syne font-bold text-foreground">Sou profissional</h3>
                  <span className="badge-pro">PRO</span>
                </div>
                <p className="text-xs text-muted mt-0.5">Quero receber clientes</p>
                <span className="text-xs font-bold mt-1 inline-block" style={{ color: "#3B82F6" }}>A partir de R$69/mês</span>
              </div>
            </button>
          </div>
          <p className="text-center text-sm text-muted mt-8">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#3B82F6" }}>Entrar</Link>
          </p>
        </div>
      )}

      {/* STEP 2 */}
      {step === "info" && (
        <div className="animate-slide-up">
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">Seus dados</h1>
          <p className="text-sm text-muted mb-6">Preencha suas informações básicas</p>
          <form onSubmit={(e) => { e.preventDefault(); setStep("verify"); }} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Nome completo</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome completo" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">E-mail</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Telefone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(34) 99999-9999" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Bairro</label>
              <select value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                className={inputClass} style={{ ...inputStyle, color: form.neighborhood ? "#FAFAFA" : "#A1A1AA" }}>
                <option value="">Selecione seu bairro</option>
                {uberlandia.neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Senha</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres" minLength={6} required className={inputClass} style={inputStyle} />
            </div>
            <button type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-4"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
              Continuar →
            </button>
          </form>
        </div>
      )}

      {/* STEP 3 */}
      {step === "verify" && (
        <div className="animate-slide-up">
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">Verificação</h1>
          <p className="text-sm text-muted mb-6">Para segurança de todos os usuários</p>
          <form onSubmit={handleSubmitVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Foto sua (selfie) *</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative w-20 h-20">
                      <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" />
                      <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "#ef4444" }}>
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 border-dashed"
                      style={{ borderColor: "#1F1F23", background: "#111113" }}>
                      <Camera size={20} className="text-muted" />
                      <span className="text-[9px] text-muted">Adicionar</span>
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*"
                    onChange={handleAvatarChange} className="hidden" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-foreground font-medium mb-1">Tire uma selfie ou escolha da galeria</p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Sua foto garante mais segurança para todos. Profissionais com foto recebem 3x mais contatos.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">CPF *</label>
              <input type="text" value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00" maxLength={14} required
                className={inputClass} style={inputStyle} />
              <p className="text-[10px] text-muted mt-1">Usado apenas para verificação de identidade</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Data de nascimento *</label>
              <input type="date" value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                required className={inputClass}
                style={{ ...inputStyle, color: "#FAFAFA", WebkitAppearance: "none", appearance: "none" }} />
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <p className="text-[10px] leading-relaxed" style={{ color: "#64748b" }}>
                🔒 Seus dados pessoais são protegidos pela LGPD e usados apenas para verificação de identidade. Nunca compartilhamos com terceiros.
              </p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {role === "professional" ? "Continuar →" : loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 4 */}
      {step === "professional" && (
        <div className="animate-slide-up">
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">Perfil profissional</h1>
          <p className="text-sm text-muted mb-6">Como você aparecerá nas buscas</p>
          <form onSubmit={handleSubmitProfessional} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">WhatsApp *</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(34) 99999-9999" required className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Especialidade *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                required className={inputClass} style={{ ...inputStyle, color: form.category ? "#FAFAFA" : "#A1A1AA" }}>
                <option value="">Selecione sua especialidade</option>
                {CATEGORIES.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Bio (opcional)</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Fale sobre sua experiência e serviços..." rows={3}
                className={inputClass} style={{ ...inputStyle, resize: "none" }} />
            </div>

            {!couponValid && (
              <div>
                <label className="block text-xs font-medium text-muted mb-2">Plano</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["basic", "pro"] as const).map((plan) => (
                    <button key={plan} type="button" onClick={() => setForm({ ...form, plan })}
                      className="p-3 rounded-xl text-left"
                      style={{ background: "#111113", border: form.plan === plan ? "1px solid #3B82F6" : "1px solid #1F1F23" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-syne font-bold text-sm text-foreground">{plan === "basic" ? "Básico" : "Pro"}</span>
                        {form.plan === plan && <Check size={12} style={{ color: "#3B82F6" }} />}
                      </div>
                      <span className="font-bold text-base" style={{ color: "#3B82F6" }}>
                        R${plan === "basic" ? "69" : "99"}<span className="text-xs font-normal text-muted">/mês</span>
                      </span>
                      <p className="text-[10px] text-muted mt-1">
                        {plan === "basic" ? "Aparece nas buscas" : "Aparece primeiro · Badge PRO"}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted mt-2 text-center">Cobrança mensal recorrente · Cancele quando quiser</p>
              </div>
            )}

            {couponValid && (
              <div className="p-4 rounded-2xl flex items-center gap-3"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <Check size={16} style={{ color: "#22c55e" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "#22c55e" }}>
                    {couponValid === "free_forever" ? "Acesso gratuito permanente!" : "30 dias grátis!"}
                  </p>
                  <p className="text-xs text-muted">
                    {couponValid === "free_forever"
                      ? "Seu perfil ficará ativo sem mensalidade."
                      : "Seu perfil ficará ativo por 30 dias. Após, R$69/mês."}
                  </p>
                </div>
                <button type="button" onClick={() => { setForm({ ...form, coupon: "" }); setCouponValid(null); }}
                  className="ml-auto text-muted"><X size={14} /></button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                <Tag size={11} className="inline mr-1" />
                Cupom (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.coupon}
                  onChange={(e) => {
                    setForm({ ...form, coupon: e.target.value.toUpperCase() });
                    setCouponValid(null);
                  }}
                  placeholder="Digite seu cupom"
                  className={inputClass}
                  style={{ ...inputStyle, flex: 1 }}
                  disabled={!!couponValid}
                />
                <button
                  type="button"
                  onClick={() => checkCoupon(form.coupon)}
                  disabled={!form.coupon || couponChecking || !!couponValid}
                  className="px-4 py-3 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: couponValid ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.15)",
                    border: couponValid ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(59,130,246,0.3)",
                    color: couponValid ? "#22c55e" : "#3B82F6",
                    opacity: (!form.coupon || couponChecking) ? 0.5 : 1,
                  }}>
                  {couponChecking ? <Loader2 size={13} className="animate-spin" /> : couponValid ? "✓" : "Aplicar"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-2 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Criando perfil..." : couponValid ? "Criar perfil grátis →" : "Criar perfil e ir para pagamento →"}
            </button>
            {!couponValid && <p className="text-center text-xs text-muted">Seu perfil fica ativo após o pagamento</p>}
          </form>
        </div>
      )}
    </div>
  );
}
