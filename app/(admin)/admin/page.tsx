"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, MapPin, CreditCard, Flag, BarChart3,
  ArrowUpRight, MessageCircle, Loader2, TrendingUp,
  Trash2, X, ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Metrics {
  totalProfessionals: number;
  activeProfessionals: number;
  proProfessionals: number;
  totalClients: number;
  totalUsers: number;
  monthlyRevenue: number;
  totalLeads: number;
  leadsToday: number;
  leadsWeek: number;
  pendingReports: number;
  citiesActive: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  created_at: string;
}

const ADMIN_EMAIL = "udihub@outlook.com";

export default function AdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<RecentUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        router.push("/");
        return;
      }
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        totalProf, activeProf, proProf,
        totalClients, totalUsers,
        totalLeads, leadsToday, leadsWeek,
        subscriptions, pendingReports,
        citiesActive, recentUsersData,
      ] = await Promise.all([
        supabase.from("professionals").select("id", { count: "exact", head: true }),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("subscriptions").select("plan").eq("status", "active"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cities").select("id", { count: "exact", head: true }).eq("enabled", true),
        supabase.from("users").select("id, name, email, role, banned, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const revenue = (subscriptions.data || []).reduce((acc, s) => acc + (s.plan === "pro" ? 99 : 69), 0);

      setMetrics({
        totalProfessionals: totalProf.count || 0,
        activeProfessionals: activeProf.count || 0,
        proProfessionals: proProf.count || 0,
        totalClients: totalClients.count || 0,
        totalUsers: totalUsers.count || 0,
        monthlyRevenue: revenue,
        totalLeads: totalLeads.count || 0,
        leadsToday: leadsToday.count || 0,
        leadsWeek: leadsWeek.count || 0,
        pendingReports: pendingReports.count || 0,
        citiesActive: citiesActive.count || 0,
      });

      setRecentUsers((recentUsersData.data as RecentUser[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("professionals").delete().eq("user_id", deleteModal.id);
    await supabase.from("users").delete().eq("id", deleteModal.id);
    setRecentUsers((prev) => prev.filter((u) => u.id !== deleteModal.id));
    setDeleteModal(null);
    setDeleting(false);
    toast.success("Usuário deletado!");
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  const meta275 = Math.round(((metrics?.activeProfessionals || 0) / 275) * 100);

  const ADMIN_SECTIONS = [
    { href: "/admin/usuarios", icon: Users, label: "Usuários", desc: "Gerenciar e banir", badge: null },
    { href: "/admin/cidades", icon: MapPin, label: "Cidades", desc: "Ativar novas cidades", badge: null },
    { href: "/admin/denuncias", icon: Flag, label: "Denúncias", desc: "Resolver denúncias", badge: metrics?.pendingReports || 0 },
    { href: "/admin/metricas", icon: BarChart3, label: "Métricas", desc: "Faturamento e dados", badge: null },
  ];

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header com botão voltar */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center gap-3">
          <Link href="/inicio" className="text-muted">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-syne font-bold text-xl text-foreground">Admin</h1>
            <p className="text-xs text-muted">UDIHUB Dashboard</p>
          </div>
          <Link href="/" className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>U</Link>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Receita + Leads */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} style={{ color: "#22c55e" }} />
              <span className="text-xs text-muted">Receita mensal</span>
            </div>
            <div className="font-syne font-extrabold text-2xl" style={{ color: "#22c55e" }}>
              R${(metrics?.monthlyRevenue || 0).toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-muted mt-1">{metrics?.activeProfessionals} assinantes ativos</div>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={14} style={{ color: "#3B82F6" }} />
              <span className="text-xs text-muted">Leads hoje</span>
            </div>
            <div className="font-syne font-extrabold text-2xl text-foreground">{metrics?.leadsToday}</div>
            <div className="text-[10px] text-muted mt-1">{metrics?.leadsWeek} esta semana</div>
          </div>
        </div>

        {/* Grid métricas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Profissionais", value: metrics?.totalProfessionals || 0, color: "#3B82F6" },
            { label: "Clientes", value: metrics?.totalClients || 0, color: "#a855f7" },
            { label: "Plano Pro", value: metrics?.proProfessionals || 0, color: "#f59e0b" },
            { label: "Total usuários", value: metrics?.totalUsers || 0, color: "#22c55e" },
            { label: "Leads total", value: metrics?.totalLeads || 0, color: "#3B82F6" },
            { label: "Cidades ativas", value: metrics?.citiesActive || 0, color: "#22c55e" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-2xl text-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="font-syne font-bold text-xl" style={{ color }}>{value}</div>
              <div className="text-[10px] text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Meta 275 */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: "#3B82F6" }} />
              <span className="font-syne font-bold text-sm text-foreground">Meta ano 1 — 275 assinantes</span>
            </div>
            <span className="text-sm font-bold" style={{ color: "#3B82F6" }}>{meta275}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#1F1F23" }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(meta275, 100)}%`, background: "linear-gradient(90deg, #3B82F6, #22c55e)" }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted">{metrics?.activeProfessionals} ativos</span>
            <span className="text-[10px] text-muted">275 meta</span>
          </div>
        </div>

        {/* Seções */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>GERENCIAR</p>
          <div className="grid grid-cols-2 gap-3">
            {ADMIN_SECTIONS.map(({ href, icon: Icon, label, desc, badge }) => (
              <Link key={href} href={href} className="card-hover p-4 rounded-2xl relative"
                style={{ background: "#111113" }}>
                {badge && badge > 0 && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: "#ef4444" }}>{badge}</div>
                )}
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(59,130,246,0.1)" }}>
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

        {/* Usuários recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: "#3B82F6" }}>USUÁRIOS RECENTES</p>
            <Link href="/admin/usuarios" className="text-xs font-semibold" style={{ color: "#3B82F6" }}>Ver todos</Link>
          </div>
          <div className="space-y-2">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <p className="text-sm text-muted">Nenhum usuário ainda</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd" }}>
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">{user.name || "Sem nome"}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ background: user.role === "professional" ? "rgba(59,130,246,0.1)" : "rgba(161,161,170,0.1)", color: user.role === "professional" ? "#93c5fd" : "#A1A1AA" }}>
                        {user.role === "professional" ? "Pro" : "Cliente"}
                      </span>
                      {user.banned && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>BANIDO</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted truncate">{user.email}</p>
                  </div>
                  <button onClick={() => setDeleteModal(user)}
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.08)" }}>
                    <Trash2 size={13} style={{ color: "#f87171" }} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setDeleteModal(null)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-foreground">Deletar usuário</h3>
              <button onClick={() => setDeleteModal(null)} className="text-muted"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted mb-6">
              Deletar <strong className="text-foreground">{deleteModal.name}</strong> permanentemente?
              Isso remove todos os dados do usuário e profissional vinculado.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-muted"
                style={{ background: "#09090B", border: "1px solid #1F1F23" }}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: "#ef4444", opacity: deleting ? 0.6 : 1 }}>
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
