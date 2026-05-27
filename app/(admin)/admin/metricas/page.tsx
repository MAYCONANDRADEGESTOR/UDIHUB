import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, MessageCircle, CreditCard, Target } from "lucide-react";

const MONTHLY_DATA = [
  { month: "Ago", leads: 120, revenue: 690, professionals: 10 },
  { month: "Set", leads: 310, revenue: 1380, professionals: 20 },
  { month: "Out", leads: 580, revenue: 2070, professionals: 30 },
  { month: "Nov", leads: 840, revenue: 2760, professionals: 40 },
  { month: "Dez", leads: 1240, revenue: 3105, professionals: 45 },
  { month: "Jan", leads: 1847, revenue: 3243, professionals: 47 },
];

const current = MONTHLY_DATA[MONTHLY_DATA.length - 1];
const prev = MONTHLY_DATA[MONTHLY_DATA.length - 2];

function pct(current: number, prev: number) {
  const diff = ((current - prev) / prev) * 100;
  return diff > 0 ? `+${diff.toFixed(0)}%` : `${diff.toFixed(0)}%`;
}

const maxLeads = Math.max(...MONTHLY_DATA.map((d) => d.leads));
const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));

export default function AdminMetricasPage() {
  return (
    <div className="min-h-screen bg-background pb-6">
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <Link href="/admin" className="text-muted">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-syne font-bold text-lg text-foreground">Métricas</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: CreditCard,
              label: "Receita mensal",
              value: `R$${current.revenue.toLocaleString("pt-BR")}`,
              change: pct(current.revenue, prev.revenue),
              positive: current.revenue >= prev.revenue,
              color: "#22c55e",
            },
            {
              icon: MessageCircle,
              label: "Leads no mês",
              value: current.leads.toLocaleString(),
              change: pct(current.leads, prev.leads),
              positive: current.leads >= prev.leads,
              color: "#3B82F6",
            },
            {
              icon: Users,
              label: "Profissionais",
              value: current.professionals,
              change: pct(current.professionals, prev.professionals),
              positive: current.professionals >= prev.professionals,
              color: "#a855f7",
            },
            {
              icon: Target,
              label: "Meta (275)",
              value: `${Math.round((current.professionals / 275) * 100)}%`,
              change: `${current.professionals}/275`,
              positive: true,
              color: "#f59e0b",
            },
          ].map(({ icon: Icon, label, value, change, positive, color }) => (
            <div
              key={label}
              className="p-4 rounded-2xl"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={13} style={{ color }} />
                <span className="text-[10px] text-muted">{label}</span>
              </div>
              <div className="font-syne font-extrabold text-xl text-foreground">{value}</div>
              <div
                className="text-[10px] font-bold mt-0.5"
                style={{ color: positive ? "#22c55e" : "#f87171" }}
              >
                {change} vs mês anterior
              </div>
            </div>
          ))}
        </div>

        {/* Leads chart */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: "#3B82F6" }} />
            <h2 className="font-syne font-bold text-sm text-foreground">Leads por mês</h2>
          </div>
          <div className="flex items-end gap-2 h-24">
            {MONTHLY_DATA.map((d) => {
              const h = Math.round((d.leads / maxLeads) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${h}%`,
                      background: d.month === "Jan"
                        ? "linear-gradient(180deg, #3B82F6, #1d4ed8)"
                        : "rgba(59,130,246,0.3)",
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[9px] text-muted">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue chart */}
        <div
          className="p-4 rounded-2xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={14} style={{ color: "#22c55e" }} />
            <h2 className="font-syne font-bold text-sm text-foreground">Faturamento MRR</h2>
          </div>
          <div className="flex items-end gap-2 h-24">
            {MONTHLY_DATA.map((d) => {
              const h = Math.round((d.revenue / maxRevenue) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${h}%`,
                      background: d.month === "Jan"
                        ? "linear-gradient(180deg, #22c55e, #15803d)"
                        : "rgba(34,197,94,0.3)",
                      minHeight: 4,
                    }}
                  />
                  <span className="text-[9px] text-muted">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projections */}
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #0F1729, #1e3a5f)",
            border: "1px solid rgba(59,130,246,0.3)",
          }}
        >
          <h2 className="font-syne font-bold text-sm text-white mb-3">🎯 Projeções</h2>
          <div className="space-y-2">
            {[
              { label: "50 assinantes", value: "R$3.450/mês" },
              { label: "100 assinantes", value: "R$6.900/mês" },
              { label: "275 assinantes (meta ano 1)", value: "R$18.975/mês" },
              { label: "500 assinantes", value: "R$34.500/mês" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-xs" style={{ color: "#93c5fd" }}>{label}</span>
                <span className="text-xs font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
