"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function NovaSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Erro ao atualizar senha. O link pode ter expirado.");
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => router.push("/inicio"), 2000);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#111113", border: "1px solid #1F1F23", outline: "none" };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>
      <button onClick={() => router.push("/login")}
        className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} />
        <span className="text-sm">Voltar para login</span>
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
          U
        </div>
        <h1 className="font-syne font-bold text-2xl text-foreground">Nova senha</h1>
        <p className="text-sm text-muted mt-1">Crie uma nova senha para sua conta</p>
      </div>

      {done ? (
        <div className="flex flex-col items-center text-center py-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(34,197,94,0.1)" }}>
            <CheckCircle size={32} style={{ color: "#22c55e" }} />
          </div>
          <h2 className="font-syne font-bold text-lg text-foreground mb-2">Senha atualizada!</h2>
          <p className="text-sm text-muted">Redirecionando para o início...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nova senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                className={inputClass}
                style={{ ...inputStyle, paddingRight: "44px" }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repita a senha"
              minLength={6}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>

          {/* Password strength */}
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      background: password.length >= i * 3
                        ? password.length >= 12 ? "#22c55e"
                          : password.length >= 8 ? "#FBBF24" : "#ef4444"
                        : "#1F1F23"
                    }} />
                ))}
              </div>
              <p className="text-[10px] text-muted">
                {password.length < 6 ? "Muito curta" :
                  password.length < 8 ? "Fraca" :
                  password.length < 12 ? "Média" : "Forte ✓"}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            Salvar nova senha
          </button>
        </form>
      )}
    </div>
  );
}
