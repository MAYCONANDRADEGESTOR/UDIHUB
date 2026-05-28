"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    });
    if (error) {
      toast.error("Erro ao enviar email. Tente novamente.");
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>
      <Link href="/login" className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} />
        <span className="text-sm">Voltar para login</span>
      </Link>

      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>
          U
        </div>
        <h1 className="font-syne font-bold text-2xl text-foreground">Recuperar senha</h1>
        <p className="text-sm text-muted mt-1">Enviaremos um link para seu email</p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center text-center py-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(34,197,94,0.1)" }}>
            <CheckCircle size={32} style={{ color: "#22c55e" }} />
          </div>
          <h2 className="font-syne font-bold text-lg text-foreground mb-2">Email enviado!</h2>
          <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
            Verifique sua caixa de entrada em <strong className="text-foreground">{email}</strong> e clique no link para criar uma nova senha.
          </p>
          <p className="text-xs text-muted mb-4">Não recebeu? Verifique o spam ou tente novamente.</p>
          <button onClick={() => setSent(false)}
            className="text-sm font-semibold" style={{ color: "#3B82F6" }}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">E-mail da conta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted"
              style={{ background: "#111113", border: "1px solid #1F1F23", outline: "none" }}
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            Enviar link de recuperação
          </button>

          <p className="text-center text-sm text-muted mt-4">
            Lembrou a senha?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#3B82F6" }}>
              Entrar
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
