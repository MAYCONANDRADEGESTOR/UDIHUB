"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, CreditCard, Zap, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { PLANS } from "@/lib/constants";
import toast from "react-hot-toast";

export default function AssinaturaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [professional, setProfessional] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("basic");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/assinatura");
      const data = await res.json();
      setSubscription(data.subscription);
      setProfessional(data.professional);
      if (data.professional?.plan) setSelectedPlan(data.professional.plan);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubscribe() {
    setPaying(true);
    try {
      const res = await fetch("/api/assinatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.open(data.paymentUrl, "_blank");
        toast.success("Link de pagamento aberto!");
      } else {
        toast.error("Erro ao gerar link de pagamento");
      }
    } catch {
      toast.error("Erro ao processar pagamento");
    }
    setPaying(false);
  }

  const isActive = professional?.status === "active" && subscription?.status === "active";
  const isPending = subscription?.status === "pending";
  const planData = PLANS[selectedPlan];

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/painel" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Assinatura</h1>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Status atual */}
        {isActive ? (
          <div className="p-5 rounded-2xl"
            style={{ background: "linear-gradient(135deg,#0F1729,#1e3a5f)", border: "1px solid rgba(59,130,246,0.4)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-syne font-bold text-lg text-white">Plano {PLANS[professional.plan].name}</span>
                  {professional.plan === "pro" && <span className="badge-pro">PRO</span>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-syne font-extrabold text-3xl text-white">R${PLANS[professional.plan].price}</span>
                  <span className="text-sm text-muted">/mês</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-bold text-green-400"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                ● Ativo
              </div>
            </div>
            <div className="space-y-2">
              {PLANS[professional.plan].features.map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <CheckCircle size={12} style={{ color: "#3B82F6" }} />
                  <span className="text-xs" style={{ color: "#93c5fd" }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ) : isPending ? (
          <div className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <AlertCircle size={16} style={{ color: "#FBBF24" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#FBBF24" }}>Pagamento pendente</p>
              <p className="text-xs text-muted mt-0.5">Complete o pagamento para ativar seu perfil nas buscas.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={16} style={{ color: "#f87171" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#f87171" }}>Perfil inativo</p>
              <p className="text-xs text-muted mt-0.5">Assine um plano para aparecer nas buscas e receber clientes.</p>
            </div>
          </div>
        )}

        {/* Seleção de plano (se não ativo) */}
        {!isActive && (
          <>
            <div>
              <p className="text-xs font-bold text-muted mb-3 tracking-widest">ESCOLHA SEU PLANO</p>
              <div className="grid grid-cols-2 gap-3">
                {(["basic", "pro"] as const).map((p) => (
                  <button key={p} onClick={() => setSelectedPlan(p)}
                    className="p-4 rounded-2xl text-left transition-all duration-200"
                    style={{
                      background: selectedPlan === p ? "rgba(59,130,246,0.1)" : "#111113",
                      border: selectedPlan === p ? "1px solid rgba(59,130,246,0.5)" : "1px solid #1F1F23",
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-syne font-bold text-sm text-foreground">{PLANS[p].name}</span>
                      {selectedPlan === p && <CheckCircle size={14} style={{ color: "#3B82F6" }} />}
                    </div>
                    <div className="font-syne font-extrabold text-xl mb-2" style={{ color: "#3B82F6" }}>
                      R${PLANS[p].price}<span className="text-xs font-normal text-muted">/mês</span>
                    </div>
                    <div className="space-y-1">
                      {PLANS[p].features.slice(0, 3).map((f) => (
                        <div key={f} className="flex items-center gap-1.5">
                          <CheckCircle size={9} style={{ color: "#3B82F6" }} />
                          <span className="text-[10px] text-muted">{f}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSubscribe} disabled={paying}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#3B82F6,#1d4ed8)", boxShadow: "0 0 24px rgba(59,130,246,0.4)", opacity: paying ? 0.7 : 1 }}>
              {paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
              {paying ? "Gerando link..." : `Assinar — R$${PLANS[selectedPlan].price}/mês`}
            </button>

            <p className="text-center text-xs text-muted">
              Pagamento via PIX ou cartão pelo Asaas · Cancele quando quiser
            </p>
          </>
        )}

        {/* Upgrade para Pro */}
        {isActive && professional?.plan === "basic" && (
          <div className="p-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg,#0F1729,#1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} style={{ color: "#3B82F6" }} />
              <span className="font-syne font-bold text-sm text-white">Upgrade para Pro</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#93c5fd" }}>
              Apareça primeiro nas buscas. Por apenas +R$30/mês.
            </p>
            <button onClick={() => { setSelectedPlan("pro"); handleSubscribe(); }}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#3B82F6,#1d4ed8)" }}>
              Upgrade — R$99/mês
            </button>
          </div>
        )}

        {/* Gerenciar */}
        {isActive && (
          <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <h3 className="font-syne font-bold text-sm text-foreground mb-3">Gerenciar</h3>
            <a href="https://www.asaas.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 text-sm"
              style={{ borderBottom: "1px solid #1F1F23" }}>
              <span className="text-muted">Ver faturas no Asaas</span>
              <ExternalLink size={13} className="text-muted" />
            </a>
            <button className="flex items-center justify-between w-full py-2.5 text-sm">
              <span style={{ color: "#f87171" }}>Cancelar assinatura</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
