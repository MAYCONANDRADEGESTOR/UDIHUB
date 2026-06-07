"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function ExcluirContaPage() {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [done, setDone] = useState(false);

  async function handleDelete() {
    if (confirmText !== "EXCLUIR") {
      toast.error('Digite "EXCLUIR" para confirmar');
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Você precisa estar logado"); setLoading(false); return; }

      // Buscar professional_id se for profissional
      const { data: prof } = await supabase
        .from("professionals").select("id").eq("user_id", user.id).single();

      if (prof) {
        // Deletar dados do profissional em cascata
        await supabase.from("whatsapp_clicks").delete().eq("professional_id", prof.id);
        await supabase.from("profile_views").delete().eq("professional_id", prof.id);
        await supabase.from("favorites").delete().eq("professional_id", prof.id);
        await supabase.from("reviews").delete().eq("professional_id", prof.id);
        await supabase.from("review_reports").delete().eq("professional_id", prof.id);
        await supabase.from("professional_neighborhoods").delete().eq("professional_id", prof.id);
        await supabase.from("professional_photos").delete().eq("professional_id", prof.id);
        await supabase.from("professional_categories").delete().eq("professional_id", prof.id);
        await supabase.from("subscriptions").delete().eq("professional_id", prof.id);
        await supabase.from("professionals").delete().eq("id", prof.id);
      }

      // Deletar dados do cliente
      await supabase.from("favorites").delete().eq("user_id", user.id);
      await supabase.from("users").delete().eq("id", user.id);
      await supabase.auth.signOut();

      setDone(true);
    } catch {
      toast.error("Erro ao excluir conta. Tente novamente ou entre em contato.");
    }

    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <CheckCircle size={28} style={{ color: "#22c55e" }} />
        </div>
        <h1 className="font-syne font-bold text-xl text-foreground mb-2">Conta excluída</h1>
        <p className="text-sm text-muted mb-6 max-w-xs leading-relaxed">
          Seus dados foram removidos permanentemente do UDIHUB.
        </p>
        <Link href="/"
          className="px-6 py-3 rounded-2xl font-bold text-sm text-white"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
          Ir para o início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-24">
      <Link href="/perfil" className="flex items-center gap-2 text-muted mb-8 w-fit">
        <ArrowLeft size={18} />
        <span className="text-sm">Voltar</span>
      </Link>

      <div className="max-w-lg mx-auto">

        {/* Ícone */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <Trash2 size={24} style={{ color: "#f87171" }} />
        </div>

        <h1 className="font-syne font-extrabold text-2xl text-foreground mb-2">
          Excluir conta
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão removidos imediatamente dos nossos servidores.
        </p>

        {/* O que será excluído */}
        <div className="p-4 rounded-2xl mb-6"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} style={{ color: "#f87171" }} />
            <p className="text-xs font-bold" style={{ color: "#f87171" }}>O que será excluído permanentemente:</p>
          </div>
          <div className="space-y-1.5">
            {[
              "Seu perfil e dados pessoais",
              "Histórico de leads e visualizações",
              "Avaliações e favoritos",
              "Fotos do perfil",
              "Assinatura ativa (sem reembolso proporcional)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#f87171" }} />
                <p className="text-xs text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alternativa */}
        <div className="p-4 rounded-2xl mb-6"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#93c5fd" }}>
            💡 Prefere apenas pausar?
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Se quiser pausar sua assinatura sem excluir a conta, acesse{" "}
            <Link href="/painel/assinatura" style={{ color: "#3B82F6" }}>
              Painel → Assinatura
            </Link>{" "}
            e cancele a renovação.
          </p>
        </div>

        {/* Campo de confirmação */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-muted mb-2">
            Para confirmar, digite <strong className="text-foreground">EXCLUIR</strong> abaixo:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="EXCLUIR"
            className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted"
            style={{ background: "#09090B", border: `1px solid ${confirmText === "EXCLUIR" ? "rgba(239,68,68,0.4)" : "#1F1F23"}`, outline: "none" }}
          />
        </div>

        {/* Botão excluir */}
        <button
          onClick={handleDelete}
          disabled={loading || confirmText !== "EXCLUIR"}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mb-4"
          style={{
            background: confirmText === "EXCLUIR" ? "#ef4444" : "#1F1F23",
            color: confirmText === "EXCLUIR" ? "white" : "#64748b",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Excluindo conta..." : "Excluir minha conta permanentemente"}
        </button>

        {/* Suporte */}
        <p className="text-center text-xs text-muted leading-relaxed">
          Precisa de ajuda? Entre em contato pelo e-mail{" "}
          <a href="mailto:udihub@outlook.com" style={{ color: "#3B82F6" }}>
            udihub@outlook.com
          </a>
        </p>
      </div>
    </div>
  );
}
