"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TIMEOUT_SECONDS = 90;

export default function RetornoPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "active" | "waiting">("checking");
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data: prof } = await supabase
          .from("professionals")
          .select("status, coupon_code, trial_ends_at")
          .eq("user_id", user.id)
          .single();

        const isActive = prof?.status === "active";
        const hasCoupon = !!prof?.coupon_code;
        const inTrial = prof?.trial_ends_at && new Date(prof.trial_ends_at) > new Date();

        if (isActive || hasCoupon || inTrial) {
          setStatus("active");
          clearAll();
          setTimeout(() => router.push("/painel"), 2500);
        }
      } catch {}
    }

    function clearAll() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    // Polling a cada 3s
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 3000);

    // Countdown visual
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    // Timeout geral: 90s
    timeoutRef.current = setTimeout(() => {
      clearAll();
      setStatus("waiting");
    }, TIMEOUT_SECONDS * 1000);

    return () => clearAll();
  }, []);

  // Porcentagem para a barra de progresso
  const progress = ((TIMEOUT_SECONDS - secondsLeft) / TIMEOUT_SECONDS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

      {/* CHECKING */}
      {status === "checking" && (
        <div className="w-full max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
            style={{ background: "rgba(59,130,246,0.1)", border: "2px solid rgba(59,130,246,0.3)" }}>
            <Loader2 size={32} style={{ color: "#3B82F6" }} className="animate-spin" />
          </div>
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Confirmando pagamento...
          </h1>
          <p className="text-sm text-muted max-w-xs leading-relaxed mx-auto mb-6">
            Estamos verificando seu pagamento. Isso pode levar alguns segundos.
          </p>

          {/* Barra de progresso */}
          <div className="w-full h-1.5 rounded-full mb-2" style={{ background: "#1F1F23" }}>
            <div className="h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #3B82F6, #60a5fa)" }} />
          </div>
          <p className="text-xs text-muted">
            Verificando por mais <span className="font-bold text-foreground">{secondsLeft}s</span>
          </p>

          <div className="flex gap-1 justify-center mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#3B82F6", animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE */}
      {status === "active" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle size={36} style={{ color: "#22c55e" }} />
          </div>
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Pagamento confirmado! 🎉
          </h1>
          <p className="text-sm text-muted max-w-xs leading-relaxed mb-4">
            Seu perfil está ativo! Redirecionando para o painel...
          </p>
          <div className="px-4 py-2 rounded-full text-xs font-bold"
            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
            ● Conta ativa
          </div>
        </>
      )}

      {/* WAITING (timeout) */}
      {status === "waiting" && (
        <div className="w-full max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
            style={{ background: "rgba(251,191,36,0.1)", border: "2px solid rgba(251,191,36,0.3)" }}>
            <Clock size={32} style={{ color: "#FBBF24" }} />
          </div>
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Pagamento em processamento
          </h1>
          <p className="text-sm text-muted max-w-xs leading-relaxed mb-2 mx-auto">
            Seu pagamento está sendo processado. Assim que confirmado, seu perfil será ativado automaticamente.
          </p>
          <p className="text-xs text-muted mb-8">
            Isso pode levar até 5 minutos dependendo do método de pagamento.
          </p>

          <div className="flex flex-col gap-3">
            {/* Ir para o painel mesmo assim */}
            <button onClick={() => router.push("/painel")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
              Ir para o painel
              <ArrowRight size={15} />
            </button>

            {/* Ver status da assinatura */}
            <button onClick={() => router.push("/painel/assinatura")}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: "#111113", border: "1px solid #1F1F23", color: "#94a3b8" }}>
              Ver status da assinatura
            </button>
          </div>

          <p className="text-[11px] text-muted mt-6 leading-relaxed">
            Se o pagamento foi aprovado, seu perfil será ativado em minutos mesmo após sair desta página.
          </p>
        </div>
      )}

    </div>
  );
}
