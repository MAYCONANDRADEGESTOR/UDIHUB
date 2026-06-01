"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function NovaSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase injeta o token de recuperação via hash na URL
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Erro ao atualizar senha. Tente novamente.");
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 3000);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#111113", border: "1px solid #1F1F23", outline: "none" };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>

      <Link href="/login" className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} />
        <span className="text-sm">Voltar</span>
      </Link>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="UDIHUB" width={72} height={72}
            className="rounded-2xl object-cover"
            style={{ boxShadow: "0 0 32px rgba(139,92,246,0.4)" }} />
        </div>
        <h1 className="font-syne font-bold text-2xl text-foreground">Nova senha</h1>
        <p className="text-sm text-muted mt-1">Crie uma nova senha para sua conta</p>
      </div>

      {done ? (
        <div className="flex flex-col items-center text-center gap-4 mt-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle size={32} style={{ color: "#22c55e" }} />
          </div>
          <h2 className="font-syne font-bold text-lg text-foreground">Senha atualizada!</h2>
          <p className="text-sm text-muted max-w-xs leading-relaxed">
            Sua senha foi redefinida com sucesso. Redirecionando para o login...
          </p>
          <Link href="/login"
            className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm text-white text-center"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
            Ir para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nova senha</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" minLength={6} required
                className={inputClass} style={{ ...inputStyle, paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Confirmar nova senha</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a senha" minLength={6} required
                className={inputClass} style={{ ...inputStyle, paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Indicador de força */}
          {password.length > 0 && (
            <div className="flex gap-1 mt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    background: password.length >= i * 4
                      ? i === 1 ? "#f87171" : i === 2 ? "#FBBF24" : "#22c55e"
                      : "#1F1F23"
                  }} />
              ))}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-2 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      )}
    </div>
  );
}
