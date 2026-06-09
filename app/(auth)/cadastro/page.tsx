"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Briefcase, Loader2, Check, Camera, X, Tag, Instagram } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
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

type CouponType = "free_forever" | "trial_30days" | "trial_90days" | null;

export default function CadastroPage() {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "professional" | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [couponValid, setCouponValid] = useState<CouponType>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    category: "",
    bio: "",
    instagram: "",
    plan: "basic" as "basic" | "pro",
    coupon: "",
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

  async function checkCoupon(code: string) {
    if (!code) { setCouponValid(null); return; }
    if (!form.email) { toast.error("Preencha seu e-mail primeiro"); return; }
    setCouponChecking(true);
    const supabase = createClient();

    const { data: coupon } = await supabase
      .from("coupons")
      .select("type, active, max_uses, uses_count, trial_days, expires_at")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single();

    if (!coupon) {
      setCouponValid(null);
      toast.error("Cupom invalido ou expirado");
      setCouponChecking(false);
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      setCouponValid(null);
      toast.error("Cupom expirado");
      setCouponChecking(false);
      return;
    }

    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      setCouponValid(null);
      toast.error("Cupom esgotado");
      setCouponChecking(false);
      return;
    }

    const { data: prevUse } = await supabase
      .from("coupon_uses")
      .select("id")
      .eq("coupon_code", code.toUpperCase())
      .eq("email", form.email.toLowerCase())
      .single();

    if (prevUse) {
      setCouponValid(null);
      toast.error("Este e-mail ja utilizou este cupom!");
      setCouponChecking(false);
      return;
    }

    setCouponValid(coupon.type as CouponType);
    if (coupon.type === "free_forever") toast.success("Cupom valido! Acesso permanente!");
    if (coupon.type === "trial_30days") toast.success("Cupom valido! 30 dias gratis!");
    if (coupon.type === "trial_90days") toast.success("Cupom valido! 3 meses gratis!");
    setCouponChecking(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { toast.error("Selecione seu perfil"); return; }
    if (role === "professional" && !form.category) { toast.error("Selecione sua especialidade"); return; }
    if (role === "professional" && !form.phone) { toast.error("Informe seu WhatsApp"); return; }
    setLoading(true);

    const supabase = createClient();

    // Timeout de 20 segundos para nao travar a tela
    let signUpData: any = null;
    let signUpError: any = null;

    try {
      const signUpPromise = supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 20000)
      );

      const result = await Promise.race([signUpPromise, timeoutPromise]) as any;
      signUpData = result.data;
      signUpError = result.error;
    } catch (e: any) {
      if (e.message === "timeout") {
        // Mesmo com timeout a conta pode ter sido criada no servidor
        // Manda para login para o usuario entrar normalmente
        toast.success("Conta criada! Faca login para continuar.");
        router.push("/login");
        setLoading(false);
        return;
      }
      toast.error("Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    if (signUpError) {
      toast.error(signUpError.message === "User already registered"
        ? "Este e-mail ja esta cadastrado"
        : signUpError.message);
      setLoading(false);
      return;
    }

    if (!signUpData?.user) {
      toast.error("Erro ao criar conta");
      setLoading(false);
      return;
    }

    const userId = signUpData.user.id;
    let avatarUrl: string | null = null;
    if (avatarFile) avatarUrl = await uploadAvatar(userId, avatarFile);

    const phoneClean = form.phone.replace(/\D/g, "");

    await supabase.from("users").upsert({
      id: userId,
      name: form.name,
      email: form.email,
      phone: phoneClean || null,
      city: "Uberlandia",
      role,
      avatar: avatarUrl,
      banned: false,
    }, { onConflict: "id" });

    if (role === "professional") {
      const { data: cat } = await supabase
        .from("categories").select("id").eq("slug", form.category).single();

      if (cat) {
        let profStatus = "inactive";
        let trialEndsAt: string | null = null;

        if (couponValid === "free_forever") {
          profStatus = "active";
        } else if (couponValid === "trial_30days") {
          profStatus = "active";
          trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        } else if (couponValid === "trial_90days") {
          profStatus = "active";
          trialEndsAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
        }

        const { data: profData } = await supabase.from("professionals").upsert({
          user_id: userId,
          slug: `${slugify(form.name)}-${Date.now()}`,
          bio: form.bio || null,
          whatsapp: phoneClean,
          instagram: form.instagram ? form.instagram.replace("@", "") : null,
          category_id: cat.id,
          plan: "basic",
          status: profStatus,
          avatar: avatarUrl,
          coupon_code: form.coupon || null,
          trial_ends_at: trialEndsAt,
        }, { onConflict: "user_id" }).select("id").single();

        if (profData?.id) {
          await supabase.from("professional_categories").insert({
            professional_id: profData.id,
            category_id: cat.id,
            is_primary: true,
          }).onConflict("professional_id, category_id").ignore();
        }

        if (form.coupon && couponValid) {
          const { data: couponData } = await supabase
            .from("coupons")
            .select("uses_count")
            .eq("code", form.coupon.toUpperCase())
            .single();

          if (couponData) {
            await supabase.from("coupons")
              .update({ uses_count: (couponData.uses_count || 0) + 1 })
              .eq("code", form.coupon.toUpperCase());
          }

          await supabase.from("coupon_uses").insert({
            coupon_code: form.coupon.toUpperCase(),
            user_id: userId,
            email: form.email.toLowerCase(),
            trial_ends_at: trialEndsAt,
          }).onConflict("coupon_code, email").ignore();
        }
      }

      await sendEmail("welcome", form.email, form.name);

      router.refresh();
      await new Promise((r) => setTimeout(r, 300));

      if (couponValid) {
        toast.success("Perfil ativo! Aproveite os 3 meses gratis!");
        router.push("/painel");
      } else {
        toast.success("Perfil criado! Ative sua assinatura para aparecer nas buscas.");
        router.push("/painel/assinatura");
      }
    } else {
      await sendEmail("welcome", form.email, form.name);
      toast.success("Conta criada!");
      router.refresh();
      await new Promise((r) => setTimeout(r, 300));
      router.push("/inicio");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>

      <button onClick={() => router.push("/")}
        className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} />
        <span className="text-sm">Voltar</span>
      </button>

      <div className="flex items-center gap-2.5 mb-8">
        <Image src="/logo.png" alt="UDIHUB" width={36} height={36} className="rounded-xl object-cover" />
        <span className="font-syne font-bold text-xl text-foreground">
          UDI<span style={{ color: "#3B82F6" }}>HUB</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg w-full mx-auto">
        <div>
          <h1 className="font-syne font-bold text-2xl text-foreground mb-1">Criar conta</h1>
          <p className="text-sm text-muted mb-5">Preencha os dados abaixo para comecar</p>
        </div>

        {/* Tipo de conta */}
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
        </div>

        {/* Foto */}
        {role === "professional" && (
          <div>
            <label className="block text-xs font-medium text-muted mb-2">Foto do perfil</label>
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
              <p className="text-xs text-muted leading-relaxed flex-1">
                Perfis com foto recebem <strong className="text-foreground">3x mais</strong> contatos.
              </p>
            </div>
          </div>
        )}

        {/* Nome */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Nome completo *</label>
          <input type="text" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome completo" required className={inputClass} style={inputStyle} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">E-mail *</label>
          <input type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com" required className={inputClass} style={inputStyle} />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">
            WhatsApp {role === "professional" ? "*" : "(opcional)"}
          </label>
          <input type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
            placeholder="(34) 99999-9999"
            required={role === "professional"}
            inputMode="numeric"
            maxLength={16}
            className={inputClass} style={inputStyle} />
          {role === "professional" && (
            <p className="text-[10px] text-muted mt-1">Este numero recebera os contatos dos clientes</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Senha *</label>
          <input type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimo 6 caracteres" minLength={6} required
            className={inputClass} style={inputStyle} />
        </div>

        {/* Campos do profissional */}
        {role === "professional" && (
          <>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Especialidade *</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required className={inputClass}
                style={{ ...inputStyle, color: form.category ? "#FAFAFA" : "#A1A1AA" }}>
                <option value="">Selecione sua especialidade</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                <Instagram size={11} className="inline mr-1" />Instagram (opcional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
                <input type="text" value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value.replace("@", "") })}
                  placeholder="seuinstagram"
                  className={inputClass}
                  style={{ ...inputStyle, paddingLeft: "2rem" }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Bio (opcional)</label>
              <textarea value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Fale sobre sua experiencia e servicos..."
                rows={3} maxLength={300}
                className={inputClass} style={{ ...inputStyle, resize: "none" }} />
              <p className="text-[10px] text-muted mt-1 text-right">{form.bio.length}/300</p>
            </div>

            {!couponValid && (
              <div>
                <label className="block text-xs font-medium text-muted mb-2">Plano</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["basic", "pro"] as const).map((plan) => (
                    <button key={plan} type="button" onClick={() => setForm({ ...form, plan })}
                      className="p-3.5 rounded-xl text-left"
                      style={{ background: "#111113", border: form.plan === plan ? "2px solid #3B82F6" : "1px solid #1F1F23" }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-syne font-bold text-sm text-foreground">
                          {plan === "basic" ? "Basico" : "Pro"}
                        </span>
                        {form.plan === plan && <Check size={12} style={{ color: "#3B82F6" }} />}
                      </div>
                      <div className="flex items-end gap-0.5 mb-1">
                        <span className="font-syne font-bold text-lg" style={{ color: "#3B82F6" }}>
                          {plan === "basic" ? "R$69" : "R$99"}
                        </span>
                        <span className="text-[10px] text-muted mb-0.5">/mes</span>
                      </div>
                      <p className="text-[10px] text-muted">
                        {plan === "basic" ? "Aparece nas buscas" : "Aparece primeiro · Badge PRO"}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted mt-2 text-center">
                  Cobranca mensal · Cancele quando quiser
                </p>
              </div>
            )}

            {couponValid ? (
              <div className="p-4 rounded-2xl"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <div className="flex items-center gap-3">
                  <Check size={16} style={{ color: "#22c55e" }} />
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: "#22c55e" }}>
                      {couponValid === "free_forever" && "Acesso permanente ativado!"}
                      {couponValid === "trial_30days" && "30 dias gratis ativados!"}
                      {couponValid === "trial_90days" && "3 meses gratis ativados!"}
                    </p>
                    <p className="text-xs text-muted">
                      {couponValid === "free_forever" && "Perfil ativo sem mensalidade."}
                      {couponValid === "trial_30days" && "Perfil ativo por 30 dias."}
                      {couponValid === "trial_90days" && "Perfil ativo por 90 dias. Apos esse periodo, assine para continuar."}
                    </p>
                  </div>
                  <button type="button"
                    onClick={() => { setForm({ ...form, coupon: "" }); setCouponValid(null); }}
                    className="text-muted flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
                {couponValid === "trial_90days" && (
                  <div className="mt-2 pt-2 flex items-center gap-2"
                    style={{ borderTop: "1px solid rgba(34,197,94,0.2)" }}>
                    <span className="text-[10px]" style={{ color: "#22c55e" }}>
                      Plano Basico · Uso unico por e-mail
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  <Tag size={11} className="inline mr-1" />Cupom (opcional)
                </label>
                <div className="flex gap-2">
                  <input type="text" value={form.coupon}
                    onChange={(e) => { setForm({ ...form, coupon: e.target.value.toUpperCase() }); setCouponValid(null); }}
                    placeholder="Digite seu cupom"
                    className={inputClass} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => checkCoupon(form.coupon)}
                    disabled={!form.coupon || couponChecking || !form.email}
                    className="px-4 py-3 rounded-xl text-xs font-bold flex-shrink-0"
                    style={{
                      background: "rgba(59,130,246,0.15)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      color: "#3B82F6",
                      opacity: (!form.coupon || couponChecking || !form.email) ? 0.5 : 1,
                    }}>
                    {couponChecking ? <Loader2 size={13} className="animate-spin" /> : "Aplicar"}
                  </button>
                </div>
                {!form.email && form.coupon && (
                  <p className="text-[10px] mt-1" style={{ color: "#f87171" }}>
                    Preencha o e-mail antes de aplicar o cupom
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <button type="submit" disabled={loading || !role}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
            boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            opacity: (loading || !role) ? 0.7 : 1
          }}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading
            ? "Criando conta..."
            : role === "professional"
              ? couponValid ? "Criar perfil" : "Criar perfil e ir para pagamento"
              : "Criar conta"}
        </button>

        {role === "professional" && !couponValid && (
          <p className="text-center text-xs text-muted">Perfil ativo apos o pagamento</p>
        )}

        <p className="text-center text-sm text-muted pt-2">
          Ja tem conta?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#3B82F6" }}>Entrar</Link>
        </p>
      </form>
    </div>
  );
}
