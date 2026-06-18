"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Search, RotateCcw, Crown,
  Layers, X, Check, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

const ADMIN_EMAIL = "udihub@outlook.com";

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuito",
  professional: "Profissional",
  professional_annual: "Profissional Anual",
  pro: "Pro (legado)",
  basic: "Basico (legado)",
};

const PLAN_OPTIONS = ["free", "professional", "professional_annual"];

interface ProfRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  unique_clients_limit: number;
  used: number;
  category: string;
}

export default function AdminProfissionaisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProfRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("");
  const [changingPlanFor, setChangingPlanFor] = useState<ProfRow | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      router.push("/");
      return;
    }

    const { data: profsData, error } = await supabase
      .from("professionals")
      .select(`id, plan, status, unique_clients_limit, users(name, email), categories(name)`)
      .order("plan", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar profissionais");
      setLoading(false);
      return;
    }

    const ids = (profsData || []).map((p: any) => p.id);
    let countByProf: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: contactsData } = await supabase
        .from("unique_client_contacts")
        .select("professional_id")
        .in("professional_id", ids)
        .gt("window_expires_at", new Date().toISOString());
      for (const c of contactsData || []) {
        countByProf[c.professional_id] = (countByProf[c.professional_id] || 0) + 1;
      }
    }

    const mapped: ProfRow[] = (profsData || []).map((p: any) => ({
      id: p.id,
      name: p.users?.name || "Sem nome",
      email: p.users?.email || "",
      plan: p.plan,
      status: p.status,
      unique_clients_limit: p.unique_clients_limit || 5,
      used: countByProf[p.id] || 0,
      category: p.categories?.name || "",
    }));

    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleChangePlan(newPlan: string) {
    if (!changingPlanFor) return;
    setSavingPlan(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("professionals")
      .update({ plan: newPlan, plan_migrated_at: new Date().toISOString() })
      .eq("id", changingPlanFor.id);

    if (error) {
      toast.error("Erro ao alterar plano");
      setSavingPlan(false);
      return;
    }

    setRows((prev) => prev.map((r) => r.id === changingPlanFor.id ? { ...r, plan: newPlan } : r));
    toast.success(`Plano alterado para ${PLAN_LABELS[newPlan] || newPlan}`);
    setChangingPlanFor(null);
    setSavingPlan(false);
  }

  async function handleResetCounter(prof: ProfRow) {
    setResettingId(prof.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("unique_client_contacts")
      .delete()
      .eq("professional_id", prof.id);

    if (error) {
      toast.error("Erro ao resetar contador");
      setResettingId(null);
      return;
    }

    setRows((prev) => prev.map((r) => r.id === prof.id ? { ...r, used: 0 } : r));
    toast.success(`Contador de ${prof.name} resetado para 0/${prof.unique_clients_limit}`);
    setResettingId(null);
  }

  const filtered = rows.filter((r) => {
    const matchesSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = !filterPlan || r.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center gap-3 mb-3">
          <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="font-syne font-bold text-lg text-foreground">Planos & Limites</h1>
            <p className="text-xs text-muted">{rows.length} profissionais cadastrados</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <Search size={14} className="text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome ou email..."
              className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder-muted" />
          </div>
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto">
          {[
            { value: "", label: "Todos" },
            { value: "free", label: "Gratuito" },
            { value: "professional", label: "Profissional" },
            { value: "professional_annual", label: "Anual" },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setFilterPlan(value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
              style={{
                background: filterPlan === value ? "rgba(59,130,246,0.2)" : "#111113",
                border: filterPlan === value ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
                color: filterPlan === value ? "#3B82F6" : "#A1A1AA",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <p className="text-sm text-muted">Nenhum profissional encontrado</p>
          </div>
        ) : filtered.map((prof) => {
          const isPaid = prof.plan === "professional" || prof.plan === "professional_annual" || prof.plan === "pro";
          const isAtLimit = !isPaid && prof.used >= prof.unique_clients_limit;
          const isNearLimit = !isPaid && prof.used === prof.unique_clients_limit - 1;

          return (
            <div key={prof.id} className="p-4 rounded-2xl"
              style={{
                background: "#111113",
                border: isAtLimit ? "1px solid rgba(239,68,68,0.3)" : isNearLimit ? "1px solid rgba(251,191,36,0.3)" : "1px solid #1F1F23",
              }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{ background: isPaid ? "rgba(251,191,36,0.12)" : "rgba(59,130,246,0.1)", color: isPaid ? "#FBBF24" : "#93c5fd" }}>
                  {getInitials(prof.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm text-foreground truncate">{prof.name}</span>
                    {isPaid && <Crown size={12} style={{ color: "#FBBF24" }} />}
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ background: prof.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: prof.status === "active" ? "#22c55e" : "#f87171" }}>
                      {prof.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">{prof.email}</p>
                  {prof.category && <p className="text-[10px] text-muted mt-0.5">{prof.category}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #1F1F23" }}>
                <button onClick={() => setChangingPlanFor(prof)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#3B82F6" }}>
                  <Layers size={12} /> {PLAN_LABELS[prof.plan] || prof.plan}
                </button>

                {!isPaid ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold"
                      style={{ color: isAtLimit ? "#ef4444" : isNearLimit ? "#FBBF24" : "#22c55e" }}>
                      {prof.used}/{prof.unique_clients_limit} clientes
                    </span>
                    <button onClick={() => handleResetCounter(prof)} disabled={resettingId === prof.id}
                      className="p-1.5 rounded-lg"
                      style={{ background: "rgba(161,161,170,0.08)" }}>
                      {resettingId === prof.id
                        ? <Loader2 size={13} className="animate-spin text-muted" />
                        : <RotateCcw size={13} className="text-muted" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold" style={{ color: "#22c55e" }}>Ilimitado</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal trocar plano */}
      {changingPlanFor && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setChangingPlanFor(null)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-foreground">Alterar plano</h3>
              <button onClick={() => setChangingPlanFor(null)} className="text-muted"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted mb-4">
              <strong className="text-foreground">{changingPlanFor.name}</strong> — plano atual: {PLAN_LABELS[changingPlanFor.plan] || changingPlanFor.plan}
            </p>
            <div className="space-y-2 mb-4">
              {PLAN_OPTIONS.map((planValue) => (
                <button key={planValue} onClick={() => handleChangePlan(planValue)}
                  disabled={savingPlan || planValue === changingPlanFor.plan}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: planValue === changingPlanFor.plan ? "rgba(59,130,246,0.1)" : "#09090B",
                    border: planValue === changingPlanFor.plan ? "1px solid #3B82F6" : "1px solid #1F1F23",
                    color: planValue === changingPlanFor.plan ? "#3B82F6" : "#A1A1AA",
                    opacity: savingPlan ? 0.6 : 1,
                  }}>
                  {PLAN_LABELS[planValue]}
                  {planValue === changingPlanFor.plan && <Check size={14} />}
                </button>
              ))}
            </div>
            {changingPlanFor.plan !== "professional" && changingPlanFor.plan !== "professional_annual" && (
              <div className="flex items-start gap-2 p-3 rounded-xl"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <AlertCircle size={13} style={{ color: "#FBBF24" }} className="flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted leading-relaxed">
                  Alterar manualmente para um plano pago aqui NÃO cria cobrança no Asaas. Use isso apenas para casos excepcionais (cortesia, correção de erro). Para assinatura real, o profissional deve pagar pelo fluxo normal.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
