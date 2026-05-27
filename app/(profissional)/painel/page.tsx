"use client";

import Link from "next/link";
import {
  MessageCircle,
  Eye,
  Star,
  TrendingUp,
  User,
  Image,
  CreditCard,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

const MOCK_STATS = {
  leadsToday: 3,
  leadsWeek: 18,
  leadsMonth: 67,
  viewsMonth: 342,
  rating: 4.8,
  totalReviews: 24,
};

const RECENT_LEADS = [
  { city: "Uberlândia", neighborhood: "Tibery", time: "há 2h", day: "Hoje" },
  { city: "Uberlândia", neighborhood: "Santa Mônica", time: "há 5h", day: "Hoje" },
  { city: "Uberlândia", neighborhood: "Jardim Karaíba", time: "ontem", day: "Ontem" },
  { city: "Uberlândia", neighborhood: "Morumbi", time: "ontem", day: "Ontem" },
];

export default function PainelPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-bold text-xl text-foreground">
              Painel
            </h1>
            <p className="text-xs text-muted mt-0.5">Bem-vindo de volta 👋</p>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <span className="badge-pro">PRO</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Lead cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Leads hoje", value: MOCK_STATS.leadsToday, color: "#22c55e" },
            { label: "Semana", value: MOCK_STATS.leadsWeek, color: "#3B82F6" },
            { label: "Mês", value: MOCK_STATS.leadsMonth, color: "#a855f7" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="p-3 rounded-2xl text-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}
            >
              <div className="font-syne font-extrabold text-2xl" style={{ color }}>
                {value}
              </div>
              <div className="text-[10px] text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Views & rating */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.1)" }}
            >
              <Eye size={16} style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <div className="font-syne font-bold text-lg text-foreground">
                {MOCK_STATS.viewsMonth}
              </div>
              <div className="text-[10px] text-muted">Visualizações</div>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(251,191,36,0.1)" }}
            >
              <Star size={16} style={{ color: "#FBBF24" }} />
            </div>
            <div>
              <div className="font-syne font-bold text-lg text-foreground">
                {MOCK_STATS.rating}
              </div>
              <div className="text-[10px] text-muted">{MOCK_STATS.totalReviews} avaliações</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-syne font-bold text-sm text-foreground mb-3">
            Gerenciar
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/painel/perfil", icon: User, label: "Editar perfil", desc: "Atualizar dados" },
              { href: "/painel/fotos", icon: Image, label: "Fotos", desc: "Gerenciar galeria" },
              { href: "/painel/avaliacoes", icon: Star, label: "Avaliações", desc: "Ver e responder" },
              { href: "/painel/assinatura", icon: CreditCard, label: "Assinatura", desc: "Gerenciar plano" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="card-hover p-4 rounded-2xl"
                style={{ background: "#111113" }}
              >
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

        {/* Recent leads */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-syne font-bold text-sm text-foreground">
              Leads recentes
            </h2>
            <Link
              href="/painel/leads"
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: "#3B82F6" }}
            >
              Ver todos <ArrowUpRight size={10} />
            </Link>
          </div>

          <div className="space-y-2">
            {RECENT_LEADS.map((lead, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.1)" }}
                  >
                    <MessageCircle size={14} style={{ color: "#22c55e" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {lead.neighborhood}
                    </div>
                    <div className="text-xs text-muted">{lead.city}</div>
                  </div>
                </div>
                <span className="text-xs text-muted">{lead.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
