"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

// Mesmos preços e rótulos usados em /api/assinatura e no dashboard admin.
const PLAN_PRICE: Record<string, number> = {
  professional: 59.90,
  professional_annual: 499.90,
  pro: 99,
  basic: 69,
};

const PLAN_LABEL: Record<string, string> = {
  professional: "Profissional",
  professional_annual: "Profissional Anual",
  pro: "Pro (legado)",
  basic: "Básico (legado)",
};

interface Subscription {
  id: string;
  plan: string;
  status: string;
  created_at: string;
  next_billing: string | null;
  asaas_subscription_id: string | null;
  professional_id: string;
  professionals: {
    slug: string;
    users: { name: string; email: string } | null;
  } | null;
}

type Filter = "all" | "pending" | "active" | "inactive";

export default function AdminPagamentosPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select(`id, plan, status, created_at, next_billing, asaas_subscription_id, professional_id,
        professionals(slug, users(name, email))`)
      .order("created_at", { ascending: false });
    setSubscriptions((data as any) || []);
    setLoading(false);
  }

  async function handleConfirm(sub: Subscription) {
    setConfirmingId(sub.id);
    try {
      const res = await fetch("/api/admin/confirmar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId: sub.professional_id, plan: sub.plan }),
      });
      if (!res.ok) throw new Error();

      const nextBilling = new Date();
      if (sub.plan === "professional_annual") nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      else nextBilling.setMonth(nextBilling.getMonth() + 1);

      setSubscriptions((prev) =>
        prev.map((s) => s.id === sub.id ? { ...s, status: "active", next_billing: nextBilling.toISOString() } : s)
      );
      toast.success("Pagamento confirmado! Profissional ativado.");
    } catch {
      toast.error("Erro ao confirmar pagamento");
    }
    setConfirmingId(null);
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
  }

  const filtered = filter === "all" ? subscriptions : subscriptions.filter((s) => s.status === filter);
  const counts = {
    all: subscriptions.length,
    pending: subscriptions.filter((s) => s.status === "pending").length,
    active: subscriptions.filter((s) => s.status === "active").length,
    inactive: subscriptions.filter((s) => s.status === "inactive").length,
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40 flex items-center gap-3"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <h1 className="font-syne font-bold text-xl text-foreground">Pagamentos</h1>
          <p className="text-xs text-muted">Assinaturas e cobranças</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { key: "pending", label: "Pendentes" },
            { key: "active", label: "Ativas" },
            { key: "inactive", label: "Inativas" },
            { key: "all", label: "Todas" },
          ] as { key: Filter; label: string }[]).map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5"
              style={{
                background: filter === key ? "rgba(59,130,246,0.12)" : "#111113",
                border: filter === key ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
                color: filter === key ? "#3B82F6" : "#A1A1AA",
              }}>
              {label}
              <span className="text-[10px] opacity-70">{counts[key]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <CreditCard size={28} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">Nenhuma assinatura {filter !== "all" ? "neste filtro" : "ainda"}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {filtered.map((sub) => {
            const name = sub.professionals?.users?.name || "Profissional removido";
            const email = sub.professionals?.users?.email;
            const value = PLAN_PRICE[sub.plan] ?? 0;
            const isPending = sub.status === "pending";
            const isActive = sub.status === "active";

            return (
              <div key={sub.id} className="p-4 rounded-2xl"
                style={{
                  background: "#111113",
                  border: isPending ? "1px solid rgba(168,85,247,0.3)" : "1px solid #1F1F23",
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}>
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 flex items-center gap-1"
                        style={{
                          background: isActive ? "rgba(34,197,94,0.1)" : isPending ? "rgba(168,85,247,0.12)" : "rgba(239,68,68,0.1)",
                          color: isActive ? "#22c55e" : isPending ? "#a855f7" : "#f87171",
                        }}>
                        {isActive && <CheckCircle size={9} />}
                        {isPending && <Clock size={9} />}
                        {!isActive && !isPending && <XCircle size={9} />}
                        {isActive ? "Ativa" : isPending ? "Pendente" : "Inativa"}
                      </span>
                    </div>
                    {email && <p className="text-[11px] text-muted truncate">{email}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
                        {PLAN_LABEL[sub.plan] || sub.plan}
                      </span>
                      <span className="text-xs text-muted">R${value.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted">Criada {formatDate(sub.created_at)}</span>
                      {sub.next_billing && (
                        <span className="text-[10px] text-muted">Próx. venc. {formatDate(sub.next_billing)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {sub.professionals?.slug && (
                  <Link href={`/profissional/${sub.professionals.slug}`} target="_blank"
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#64748b" }}>
                    Ver perfil <ExternalLink size={9} />
                  </Link>
                )}

                {isPending && (
                  <button onClick={() => handleConfirm(sub)} disabled={confirmingId === sub.id}
                    className="w-full mt-3 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#a855f7,#7e22ce)", opacity: confirmingId === sub.id ? 0.7 : 1 }}>
                    {confirmingId === sub.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    Confirmar pagamento e ativar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
