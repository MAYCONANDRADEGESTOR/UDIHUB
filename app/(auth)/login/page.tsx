"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Email ou senha incorretos");
      setLoading(false);
      return;
    }
    toast.success("Bem-vindo!");
    router.push("/inicio");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/inicio`,
      },
    });
    if (error) {
      toast.error("Erro ao entrar com Google");
      setGoogleLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#111113", border: "1px solid #1F1F23", outline: "none" };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>
      <Link href="/" className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} />
        <span className="text-sm">Voltar</span>
      </Link>

      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
          U
        </div>
        <h1 className="font-syne font-bold text-2xl text-foreground">Bem-vindo de volta</h1>
        <p className="text-sm text-muted mt-1">Entre na sua conta UDIHUB</p>
      </div>

      {/* Google */}
      <button onClick={handleGoogleLogin} disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 mb-4"
        style={{ background: "#111113", border: "1px solid #1F1F23", color: "#FAFAFA" }}>
        {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
        )}
        Continuar com Google
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px" style={{ background: "#1F1F23" }} />
        <span className="text-xs text-muted">ou</span>
        <div className="flex-1 h-px" style={{ background: "#1F1F23" }} />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com" required className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Senha</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              required className={inputClass} style={{ ...inputStyle, paddingRight: "44px" }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-2 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: loading ? 0.7 : 1 }}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          Entrar
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold" style={{ color: "#3B82F6" }}>
            Criar conta grátis
          </Link>
        </p>
        <Link href="/recuperar-senha" className="block text-xs text-muted">
          Esqueceu a senha?
        </Link>
      </div>
    </div>
  );
}
