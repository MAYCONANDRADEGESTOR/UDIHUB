"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Zap,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { PLANS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const MOCK_SUBSCRIPTION = {
  plan: "pro" as const,
  status: "active" as const,
  next_billing: "2025-02-27T00:00:00Z",
  asaas_subscription_id: "sub_123456",
};

export default function AssinaturaPage() {
  const [sub] = useState(MOCK_SUBSCRIPTION);
  const [loading, setLoading] = useState(false);

  const plan = PLANS[sub.plan];
  const isActive = sub.status === "active";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <Link href="/painel" className="text-muted">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">
          Assinatura
        </h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Current plan card */}
        <div
          className="p-5 rounded-2xl"
          style={{
            background:
              sub.plan === "pro"
                ? "linear-gradient(135deg, #0F1729, #1e3a5f)"
                : "#111113",
            border:
              sub.plan === "pro"
                ? "1px solid rgba(59,130,246,0.4)"
                : "1px solid #1F1F23",
            boxShadow:
              sub.plan === "pro" ? "0 0 24px rgba(59,130,246,0.15)" : "none",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-syne font-bold text-lg text-white">
                  Plano {plan.name}
                </span>
                {sub.plan === "pro" && <span className="badge-pro">PRO</span>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-syne font-extrabold text-3xl text-white">
                  R${plan.price}
                </span>
                <span className="text-sm text-muted">/mês</span>
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isActive ? "text-green-400" : "text-yellow-400"
              }`}
              style={{
                background: isActive
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(251,191,36,0.1)",
                border: isActive
                  ? "1px solid rgba(34,197,94,0.3)"
                  : "1px solid rgba(251,191,36,0.3)",
              }}
            >
              {isActive ? "● Ativo" : "● Inativo"}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            {plan.features.map((feat) => (
              <div key={feat} className="flex items-center gap-2">
                <CheckCircle size={12} style={{ color: "#3B82F6" }} />
                <span className="text-xs" style={{ color: "#93c5fd" }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>

          {/* Next billing */}
          {isActive && sub.next_billing && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <CreditCard size={13} className="text-muted" />
              <span className="text-xs text-muted">
                Próxima cobrança:{" "}
                <strong className="text-foreground">
                  {formatDate(sub.next_billing)}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Inactive warning */}
        {!isActive && (
          <div
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <AlertCircle size={16} style={{ color: "#f87171" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#f87171" }}>
                Assinatura inativa
              </p>
              <p className="text-xs text-muted mt-0.5">
                Seu perfil não aparece nas buscas. Renove para voltar a receber
                leads.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade to Pro */}
        {sub.plan === "basic" && (
          <div
            className="p-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #0F1729, #1e3a5f)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} style={{ color: "#3B82F6" }} />
              <span className="font-syne font-bold text-sm text-white">
                Upgrade para Pro
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#93c5fd" }}>
              Apareça primeiro nas buscas e receba mais leads. Por apenas
              +R$30/mês.
            </p>
            <button
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 12px rgba(59,130,246,0.4)",
              }}
            >
              Fazer upgrade — R$99/mês
            </button>
          </div>
        )}

        {/* Manage billing */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          <h3 className="font-syne font-bold text-sm text-foreground mb-3">
            Gerenciar pagamento
          </h3>
          <div className="space-y-2">
            <a
              href="https://www.asaas.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 text-sm"
              style={{ borderBottom: "1px solid #1F1F23" }}
            >
              <span className="text-muted">Ver faturas</span>
              <ExternalLink size={13} className="text-muted" />
            </a>
            <a
              href="https://www.asaas.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2.5 text-sm"
              style={{ borderBottom: "1px solid #1F1F23" }}
            >
              <span className="text-muted">Atualizar forma de pagamento</span>
              <ExternalLink size={13} className="text-muted" />
            </a>
            <button className="flex items-center justify-between w-full py-2.5 text-sm">
              <span style={{ color: "#f87171" }}>Cancelar assinatura</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted">
          Pagamentos processados com segurança pelo Asaas (PIX e cartão)
        </p>
      </div>
    </div>
  );
}
