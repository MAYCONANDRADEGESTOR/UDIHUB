"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, User, Briefcase, Loader2, Check, Camera, X, Instagram, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";
import toast from "react-hot-toast";

async function sendEmail(type: string, to: string, name: string) {
  try {
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, to, name }),
    });
  } catch {}
}

function formatPhone(value: string) {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length > 7) return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  if (nums.length > 2) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return nums;
}

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [role, setRole] = useState<"client" | "professional" | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    category: "", bio: "", instagram: "",
  });

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted";
  const inputStyle = { background: "#09090B", border: "1px solid #1F1F23", outline: "none" };

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto muito grande. Maximo 5MB."); return; }
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

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { toast.error("Selecione seu perfil"); return; }
    if (!form.name || !form.email || !form.password) { toast.error("Preencha todos os campos"); return; }
    if (role === "professional" && !form.phone) { toast.error("Informe seu WhatsApp"); return; }
    if (role === "client") { await handleFinalSubmit(); return; }
    setStep(2);
  }

  async function handleFinalSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (role === "professional" && !form.category) { toast.error("Selecione sua especialidade"); return; }
    if (role === "professional" && !avatarFile) { toast.error("Adicione uma foto de perfil para continuar"); return; }
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
          role,
          category_slug: form.category || null,
          bio: form.bio || null,
          instagram: form.instagram || null,
        },
      });

      if (error || data?.error) {
        const msg = data?.error || error?.message || "";
        if (msg === "EMAIL_TAKEN") {
          toast.error("Este e-mail ja esta cadastrado");
        } else {
          toast.error("Erro ao criar conta. Tente novamente.");
        }
        setLoading(false);
        return;
      }

      if (avatarFile && data?.userId) {
        const avatarUrl = await uploadAvatar(data.userId, avatarFile);
        if (avatarUrl) {
          await supabase.from("users").update({ avatar: avatarUrl }).eq("id", data.userId);
          await supabase.from("professionals").update({ avatar: avatarUrl }).eq("user_id", data.userId);
        }
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      await sendEmail("welcome", form.email, form.name);

      if (loginError) {
        toast.success("Conta criada! Faca login para continuar.");
        router.push(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login");
      } else if (role === "professional") {
        toast.success("Perfil ativo! Bem-vindo ao UDIHUB!");
        router.push("/bem-vindo");
      } else if (redirectTo) {
        router.push(redirectTo);
      } else {
        toast.success("Conta criada com sucesso!");
        router.push("/bem-vindo");
      }

    } catch (err) {
      toast.error("Erro ao criar conta. Tente novamente.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>

      <button onClick={() => step === 2 ? setStep(1) : router.push("/")}
        className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} />
        <span className="text-sm">Voltar</span>
      </button>

      <div className="flex items-center gap-2.5 mb-6">
        <Image src="/logo.png" alt="UDIHUB" width={36} height={36} className="rounded-xl object-cover" />
        <span className="font-syne font-bold text-xl text-foreground">
          UDI<span style={{ color: "#3B82F6" }}>HUB</span>
        </span>
      </div>

      {role === "professional" && step === 2 && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}>
              <Check size={12} />
            </div>
            <span className="text-[10px] text-muted">Dados basicos</span>
          </div>
          <div className="flex-1 h-px" style={{ background: "#1F1F23" }} />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "rgba(59,130,246,0.2)", color: "#3B82F6" }}>2</div>
            <span className="text-[10px]" style={{ color: "#3B82F6" }}>Perfil profissional</span>
          </div>
        </div>
      )}

      {/* ETAPA 1 */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4 max-w-lg w-full mx-auto">
          <div>
            <h1 className="font-syne font-bold text-2xl text-foreground mb-1">Criar conta</h1>
            <p className="text-sm text-muted mb-5">Preencha os dados abaixo para comecar</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-2">Como vai usar o UDIHUB?</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole("client")}
                className="flex items-center gap-3 p-3.5 rounded-xl text-left"
                style={{ background: "#111113", border: role === "client" ? "2px solid #3B82F6" : "1px solid #1F1F23" }}>
                <User size={18} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                <div>
                  <p className="font-syne font-bold text-sm text-foreground">Cliente</p>
                  <p className="text-[10px] text-muted">Busco servicos</p>
                </div>
              </button>
              <button type="button" onClick={() => setRole("professional")}
                className="flex items-center gap-3 p-3.5 rounded-xl text-left"
                style={{ background: "#111113", border: role === "professional" ? "2px solid #3B82F6" : "1px solid #1F1F23" }}>
                <Briefcase size={18} style={{ color: "#3B82F6" }} className="flex-shrink-0" />
                <div>
                  <p className="font-syne font-bold text-sm text-foreground">Profissional</p>
                  <p className="text-[10px] text-muted">Recebo clientes</p>
                </div>
              </button>
            </div>
            {role === "professional" && (
              <p className="text-[10px] mt-2" style={{ color: "#22c55e" }}>
                ✓ Comece de graça — ative seu perfil agora mesmo, sem cartão
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nome completo *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome completo" required className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">E-mail *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com" required className={inputClass} style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              WhatsApp {role === "professional" ? "*" : "(opcional)"}
            </label>
            <input type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              placeholder="(34) 99999-9999"
              required={role === "professional"}
              inputMode="numeric" maxLength={16}
              className={inputClass} style={inputStyle} />
            {role === "professional" && (
              <p className="text-[10px] text-muted mt-1">Este numero recebera os contatos dos clientes</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Senha *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimo 6 caracteres" minLength={6} required className={inputClass} style={inputStyle} />
          </div>

          <button type="submit" disabled={loading || !role}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
              opacity: (loading || !role) ? 0.7 : 1
            }}>
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Processando...</>
              : role === "professional"
                ? <> Continuar <ArrowRight size={16} /></>
                : "Criar conta"}
          </button>

          <p className="text-center text-sm text-muted pt-2">
            Ja tem conta?{" "}
            <Link href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
              className="font-semibold" style={{ color: "#3B82F6" }}>Entrar</Link>
          </p>
        </form>
      )}

      {/* ETAPA 2 — Profissional */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4 max-w-lg w-full mx-auto">
          <div>
            <h1 className="font-syne font-bold text-2xl text-foreground mb-1">Seu perfil</h1>
            <p className="text-sm text-muted mb-5">Complete seu perfil para aparecer nas buscas</p>
          </div>

          {/* Foto obrigatória */}
          <div>
            <label className="block text-xs font-medium text-muted mb-2">Foto do perfil *</label>
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
                    style={{ borderColor: "#3B82F6", background: "rgba(59,130,246,0.05)" }}>
                    <Camera size={20} style={{ color: "#3B82F6" }} />
                    <span className="text-[9px]" style={{ color: "#3B82F6" }}>Obrigatório</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted leading-relaxed">
                  Perfis com foto recebem <strong className="text-foreground">3x mais</strong> contatos.
                </p>
                {!avatarPreview && (
                  <p className="text-[10px] mt-1" style={{ color: "#f87171" }}>
                    ⚠️ Foto obrigatória para criar perfil
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Especialidade */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Especialidade *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              required className={inputClass}
              style={{ ...inputStyle, color: form.category ? "#FAFAFA" : "#A1A1AA" }}>
              <option value="">Selecione sua especialidade</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              <Instagram size={11} className="inline mr-1" />Instagram (opcional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
              <input type="text" value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value.replace("@", "") })}
                placeholder="seuinstagram" className={inputClass}
                style={{ ...inputStyle, paddingLeft: "2rem" }} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Bio (opcional)</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Fale sobre sua experiencia e servicos..."
              rows={3} maxLength={300}
              className={inputClass} style={{ ...inputStyle, resize: "none" }} />
            <p className="text-[10px] text-muted mt-1 text-right">{form.bio.length}/300</p>
          </div>

          {/* Aviso Plano Gratuito */}
          <div className="p-4 rounded-2xl"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Check size={14} style={{ color: "#22c55e" }} />
              <span className="text-sm font-bold" style={{ color: "#22c55e" }}>Seu perfil entra no Plano Gratuito</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Ative agora sem pagar nada e receba até 5 clientes únicos por mês. Quer clientes ilimitados? Faça upgrade quando quiser, direto no seu painel.
            </p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
              opacity: loading ? 0.7 : 1
            }}>
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Criando perfil...</>
              : "Criar perfil gratuito"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    }>
      <CadastroForm />
    </Suspense>
  );
}
