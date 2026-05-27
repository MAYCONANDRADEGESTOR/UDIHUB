import Link from "next/link";
import {
  Users,
  MapPin,
  CreditCard,
  Star,
  Flag,
  BarChart3,
  ArrowUpRight,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

const ADMIN_METRICS = {
  totalProfessionals: 47,
  activeProfessionals: 38,
  totalClients: 312,
  monthlyRevenue: 3243,
  totalLeads: 1847,
  leadsToday: 23,
  pendingReports: 2,
  pendingReviews: 5,
};

const ADMIN_SECTIONS = [
  { href: "/admin/usuarios", icon: Users, label: "Usuários", desc: "Gerenciar e banir usuários", badge: null },
  { href: "/admin/cidades", icon: MapPin, label: "Cidades", desc: "Habilitar e desabilitar cidades", badge: null },
  { href: "/admin/assinaturas", icon: CreditCard, label: "Assinaturas", desc: "Gerenciar pagamentos Asaas", badge: null },
  { href: "/admin/avaliacoes", icon: Star, label: "Avaliações", desc: "Moderar avaliações", badge: ADMIN_METRICS.pendingReviews },
  { href: "/admin/denuncias", icon: Flag, label: "Denúncias", desc: "Resolver denúncias", badge: ADMIN_METRICS.pendingReports },
  { href: "/admin/metricas", icon: BarChart3, label: "Métricas", desc: "Faturamento e crescimento", badge: null },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-bold text-xl text-foreground">Admin</h1>
            <p className="text-xs text-muted mt-0.5">UDIHUB Dashboard</p>
          </div>
          <Link href="/" className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}
            >
              U
            </div>
          </Link>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-4 rounded-2xl"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} style={{ color: "#3B82F6" }} />
              <span className="text-xs text-muted">Receita mensal</span>
            </div>
            <div className="font-syne font-extrabold text-2xl" style={{ color: "#22c55e" }}>
              R${ADMIN_METRICS.monthlyRevenue.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-muted mt-1">
              {ADMIN_METRICS.activeProfessionals} assinantes
            </div>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={14} style={{ color: "#22c55e" }} />
              <span className="text-xs text-muted">Leads hoje</span>
            </div>
            <div className="font-syne font-extrabold text-2xl text-foreground">
              {ADMIN_METRICS.leadsToday}
            </div>
            <div className="text-[10px] text-muted mt-1">
              {ADMIN_METRICS.totalLeads.toLocaleString()} no total
            </div>
          </div>
        </div>

        {/* Sub metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Profissionais", value: ADMIN_METRICS.totalProfessionals, color: "#3B82F6" },
            { label: "Clientes", value: ADMIN_METRICS.totalClients, color: "#a855f7" },
            { label: "Ativos", value: ADMIN_METRICS.activeProfessionals, color: "#22c55e" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="p-3 rounded-2xl text-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}
            >
              <div className="font-syne font-bold text-xl" style={{ color }}>{value}</div>
              <div className="text-[10px] text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>
            GERENCIAR
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ADMIN_SECTIONS.map(({ href, icon: Icon, label, desc, badge }) => (
              <Link
                key={href}
                href={href}
                className="card-hover p-4 rounded-2xl relative"
                style={{ background: "#111113" }}
              >
                {badge && badge > 0 && (
                  <div
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: "#ef4444" }}
                  >
                    {badge}
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(59,130,246,0.1)" }}
                  >
                    <Icon size={16} style={{ color: "#3B82F6" }} />
                  </div>
                  <ArrowUpRight size={12} className="text-muted" />
                </div>
                <div className="mt-3">
                  <div className="font-semibold text-sm text-foreground">{label}</div>
                  <div className="text-[10px] text-muted mt-0.5">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
