"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RetornoPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "active" | "waiting">("checking");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

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
          clearInterval(interval);
          clearTimeout(timeout);
          setTimeout(() => router.push("/painel"), 2500);
        }
      } catch {}
    }

    checkStatus();
    interval = setInterval(checkStatus, 3000);
    timeout = setTimeout(() => {
      clearInterval(interval);
      setStatus("waiting");
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

      {status === "checking" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(59,130,246,0.1)", border: "2px solid rgba(59,130,246,0.3)" }}>
            <Loader2 size={32} style={{ color: "#3B82F6" }} className="animate-spin" />
          </div>
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Confirmando pagamento...
          </h1>
          <p className="text-sm text-muted max-w-xs leading-relaxed">
            Estamos verificando seu pagamento. Isso pode levar alguns segundos.
          </p>
          <div className="flex gap-1 mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#3B82F6", animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </>
      )}

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
            Conta ativa
          </div>
        </>
      )}

      {status === "waiting" && (
        <>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(251,191,36,0.1)", border: "2px solid rgba(251,191,36,0.3)" }}>
            <Clock size={32} style={{ color: "#FBBF24" }} />
          </div>
          <h1 className="font-syne font-bold text-2xl text-foreground mb-2">
            Aguardando confirmação
          </h1>
          <p className="text-sm text-muted max-w-xs leading-relaxed mb-2">
            Seu pagamento está sendo processado. Assim que confirmado, seu perfil será ativado automaticamente.
          </p>
          <p className="text-xs text-muted mb-6">
            Isso pode levar até 5 minutos dependendo do método de pagamento.
          </p>
          <button onClick={() => router.push("/painel/assinatura")}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
            Voltar para assinatura
          </button>
        </>
      )}

    </div>
  );
}
