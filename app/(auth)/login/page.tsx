"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="UDIHUB" width={72} height={72}
            className="rounded-2xl object-cover"
            style={{ boxShadow: "0 0 32px rgba(139,92,246,0.4)" }} />
        </div>
        <h1 className="font-syne font-bold text-2xl text-foreground">Bem-vindo de volta</h1>
        <p className="text-sm text-muted mt-1">Entre na sua conta UDIHUB</p>
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
