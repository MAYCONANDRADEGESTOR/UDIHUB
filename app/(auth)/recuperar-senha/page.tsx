"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function RecuperarSenhaPage() {
  const router = useRouter();
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
      toast.error("Erro ao enviar email. Verifique o endereço.");
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
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
        <h1 className="font-syne font-bold text-2xl text-foreground">Recuperar senha</h1>
        <p className="text-sm text-muted mt-1">Enviaremos um link para seu email</p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center text-center gap-4 mt-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle size={32} style={{ color: "#22c55e" }} />
          </div>
          <h2 className="font-syne font-bold text-lg text-foreground">Email enviado!</h2>
          <p className="text-sm text-muted max-w-xs leading-relaxed">
            Verifique sua caixa de entrada em <span className="text-foreground font-medium">{email}</span> e clique no link para criar uma nova senha.
          </p>
          <p className="text-xs text-muted">Não recebeu? Verifique o spam ou</p>
          <button onClick={() => setSent(false)}
            className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
            tentar novamente
          </button>
          <Link href="/login"
            className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm text-white text-center"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">E-mail da conta</label>
            <div className="relative">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com" required className={inputClass}
                style={{ ...inputStyle, paddingLeft: "42px" }} />
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white mt-2 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Enviando..." : "Enviar link de recuperação"}
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
