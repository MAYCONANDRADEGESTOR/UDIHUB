"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, MapPin, CreditCard, Flag, BarChart3,
  ArrowUpRight, MessageCircle, Loader2, TrendingUp,
  X, ArrowLeft, AlertCircle, UserCheck, Crown,
  Camera, Clock, Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

const ASAAS_PIX_FIXED = 0.99;
const ASAAS_PIX_PERCENT = 0.0139;

// Preços reais por plano no modelo Freemium. "pro" e "basic" são legados
// mantidos só por segurança (não devem mais existir em uso real).
const PLAN_PRICE: Record<string, number> = {
  professional: 59.90,
  professional_annual: 499.90,
  pro: 99, // legado
  basic: 69, // legado
};

function calcNet(valor: number) {
  const fee = (valor * ASAAS_PIX_PERCENT) + ASAAS_PIX_FIXED;
  return { net: valor - fee, fee };
}

function fmt2(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Metrics {
  totalProfessionals: number;
  activeProfessionals: number;
  inactiveProfessionals: number;
  paidProfessionals: number;
  freeProfessionals: number;
  totalClients: number;
  totalUsers: number;
  monthlyRevenue: number;
  netRevenue: number;
  asaasFees: number;
  totalLeads: number;
  leadsToday: number;
  leadsWeek: number;
  pendingReports: number;
  citiesActive: number;
  newUsersToday: number;
  newUsersWeek: number;
  freeAtLimit: number;
  freeNearLimit: number;
  pendingPayments: number;
  oldestPendingHours: number | null;
}

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
}

const ADMIN_EMAIL = "udihub@outlook.com";

export default function AdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselActive, setCarouselActive] = useState(false);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [adminAvatar, setAdminAvatar] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [adminUserId, setAdminUserId] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        router.push("/");
        return;
      }
      setAdminUserId(user.id);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        totalProf, activeProf, inactiveProf, paidProf, freeProf,
        totalClients, totalUsers,
        totalLeads, leadsToday, leadsWeek,
        subscriptions, pendingReports,
        citiesActive,
        newUsersToday, newUsersWeek,
        recentReportsData, carouselSetting,
        adminData, pendingPaymentsData, oldestPendingData,
      ] = await Promise.all([
        supabase.from("professionals").select("id", { count: "exact", head: true }),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("status", "inactive"),
        supabase.from("professionals").select("id", { count: "exact", head: true }).in("plan", ["professional", "professional_annual", "pro"]),
        supabase.from("professionals").select("id", { count: "exact", head: true }).in("plan", ["free", "basic"]),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("subscriptions").select("plan").eq("status", "active"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cities").select("id", { count: "exact", head: true }).eq("enabled", true),
        supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("reports").select("id, reason, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(3),
        supabase.from("app_settings").select("value").eq("key", "pro_carousel_active").single(),
        supabase.from("users").select("name, avatar").eq("id", user.id).single(),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("subscriptions").select("created_at").eq("status", "pending").order("created_at", { ascending: true }).limit(1),
      ]);

      setAdminAvatar(adminData.data?.avatar || null);
      setAdminName(adminData.data?.name || "Admin");
      setCarouselActive(carouselSetting.data?.value === "true");

      let totalRevenue = 0, totalFees = 0;
      for (const s of subscriptions.data || []) {
        const valor = PLAN_PRICE[s.plan as string] ?? 0;
        const { net, fee } = calcNet(valor);
        totalRevenue += valor;
        totalFees += fee;
      }

      // Quantos profissionais free estão no limite (5/5) ou perto dele (4/5) —
      // usa a mesma janela de 30 dias rolante da função check_and_register_unique_client.
      const { data: freeProfsData } = await supabase
        .from("professionals")
        .select("id, unique_clients_limit")
        .in("plan", ["free", "basic"]);

      let freeAtLimit = 0;
      let freeNearLimit = 0;
      if (freeProfsData && freeProfsData.length > 0) {
        const ids = freeProfsData.map((p: any) => p.id);
        const { data: contactsData } = await supabase
          .from("unique_client_contacts")
          .select("professional_id")
          .in("professional_id", ids)
          .gt("window_expires_at", new Date().toISOString());

        const countByProf: Record<string, number> = {};
        for (const c of contactsData || []) {
          countByProf[c.professional_id] = (countByProf[c.professional_id] || 0) + 1;
        }
        for (const p of freeProfsData) {
          const used = countByProf[p.id] || 0;
          if (used >= (p.unique_clients_limit || 5)) freeAtLimit++;
          else if (used === (p.unique_clients_limit || 5) - 1) freeNearLimit++;
        }
      }

      const oldestPendingCreatedAt = oldestPendingData.data?.[0]?.created_at;
      const oldestPendingHours = oldestPendingCreatedAt
        ? Math.round((Date.now() - new Date(oldestPendingCreatedAt).getTime()) / (1000 * 60 * 60))
        : null;

      setMetrics({
        totalProfessionals: totalProf.count || 0,
        activeProfessionals: activeProf.count || 0,
        inactiveProfessionals: inactiveProf.count || 0,
        paidProfessionals: paidProf.count || 0,
        freeProfessionals: freeProf.count || 0,
        totalClients: totalClients.count || 0,
        totalUsers: totalUsers.count || 0,
        monthlyRevenue: totalRevenue,
        netRevenue: Math.round((totalRevenue - totalFees) * 100) / 100,
        asaasFees: Math.round(totalFees * 100) / 100,
        totalLeads: totalLeads.count || 0,
        leadsToday: leadsToday.count || 0,
        leadsWeek: leadsWeek.count || 0,
        pendingReports: pendingReports.count || 0,
        citiesActive: citiesActive.count || 0,
        newUsersToday: newUsersToday.count || 0,
        newUsersWeek: newUsersWeek.count || 0,
        freeAtLimit,
        freeNearLimit,
        pendingPayments: pendingPaymentsData.count || 0,
        oldestPendingHours,
      });

      setRecentReports((recentReportsData.data as Report[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !adminUserId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto muito grande. Maximo 5MB."); return; }
    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${adminUserId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro ao fazer upload"); setUploadingAvatar(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("users").update({ avatar: url }).eq("id", adminUserId);
    setAdminAvatar(url);
    toast.success("Foto atualizada!");
    setUploadingAvatar(false);
  }

  async function toggleCarousel() {
    setCarouselLoading(true);
    const supabase = createClient();
    const newValue = !carouselActive;
    await supabase.from("app_settings")
      .update({ value: String(newValue), updated_at: new Date().toISOString() })
      .eq("key", "pro_carousel_active");
    setCarouselActive(newValue);
    toast.success(newValue ? "Carrossel PRO ativado!" : "Carrossel PRO desativado");
    setCarouselLoading(false);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("pt-BR");
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  const meta275 = Math.round(((metrics?.activeProfessionals || 0) / 275) * 100);
  const conversionRate = metrics?.totalUsers
    ? Math.round((metrics.totalProfessionals / metrics.totalUsers) * 100)
    : 0;

  const ADMIN_SECTIONS = [
    { href: "/admin/profissionais", icon: Layers, label: "Planos", desc: "Gerenciar planos e limites", badge: metrics?.freeAtLimit || 0 },
    { href: "/admin/usuarios", icon: Users, label: "Usuarios", desc: "Gerenciar e banir", badge: 0 },
    { href: "/admin/cidades", icon: MapPin, label: "Cidades", desc: "Ativar novas cidades", badge: 0 },
    { href: "/admin/denuncias", icon: Flag, label: "Denuncias", desc: "Resolver denuncias", badge: metrics?.pendingReports || 0 },
    { href: "/admin/metricas", icon: BarChart3, label: "Metricas", desc: "Faturamento e dados", badge: 0 },
    { href: "/admin/pagamentos", icon: CreditCard, label: "Pagamentos", desc: "Assinaturas e cobrancas", badge: metrics?.pendingPayments || 0 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header com foto de perfil do admin */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted"><ArrowLeft size={20} /></Link>

          <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {uploadingAvatar ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Loader2 size={16} style={{ color: "#3B82F6" }} className="animate-spin" />
              </div>
            ) : adminAvatar ? (
              <img src={adminAvatar} alt={adminName}
                className="w-10 h-10 rounded-xl object-cover"
                style={{ border: "2px solid #3B82F6" }} />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                {getInitials(adminName)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "#3B82F6", boxShadow: "0 0 6px rgba(59,130,246,0.5)" }}>
              <Camera size={8} className="text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={handleAvatarChange} className="hidden" />
          </div>

          <div className="flex-1">
            <h1 className="font-syne font-bold text-xl text-foreground">Admin</h1>
            <p className="text-xs text-muted">UDIHUB Dashboard</p>
          </div>
          <Link href="/" className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>U</Link>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Alertas */}
        {(metrics?.inactiveProfessionals || 0) > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={14} style={{ color: "#f87171" }} className="flex-shrink-0" />
            <p className="text-xs" style={{ color: "#f87171" }}>
              <strong>{metrics?.inactiveProfessionals}</strong> profissional(is) com perfil inativo
            </p>
            <Link href="/admin/usuarios" className="ml-auto text-[10px] font-bold" style={{ color: "#f87171" }}>Ver</Link>
          </div>
        )}

        {(metrics?.freeAtLimit || 0) > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Layers size={14} style={{ color: "#f87171" }} className="flex-shrink-0" />
            <p className="text-xs" style={{ color: "#f87171" }}>
              <strong>{metrics?.freeAtLimit}</strong> profissional(is) no limite de 5/5 clientes
            </p>
            <Link href="/admin/profissionais" className="ml-auto text-[10px] font-bold" style={{ color: "#f87171" }}>Ver</Link>
          </div>
        )}

        {(metrics?.pendingReports || 0) > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <Flag size={14} style={{ color: "#FBBF24" }} className="flex-shrink-0" />
            <p className="text-xs" style={{ color: "#FBBF24" }}>
              <strong>{metrics?.pendingReports}</strong> denuncia(s) pendente(s)
            </p>
            <Link href="/admin/denuncias" className="ml-auto text-[10px] font-bold" style={{ color: "#FBBF24" }}>Ver</Link>
          </div>
        )}

        {/* Pagamentos pendentes — relacionado ao webhook do Asaas que nao dispara sozinho */}
        {(metrics?.pendingPayments || 0) > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)" }}>
            <Clock size={14} style={{ color: "#a855f7" }} className="flex-shrink-0" />
            <p className="text-xs flex-1" style={{ color: "#c4b5fd" }}>
              <strong>{metrics?.pendingPayments}</strong> pagamento(s) pendente(s)
              {metrics?.oldestPendingHours !== null && metrics.oldestPendingHours > 1 && (
                <> · o mais antigo parado há {metrics.oldestPendingHours}h</>
              )}
              {" "}— confira manualmente no Asaas caso o webhook nao tenha confirmado
            </p>
            <a href="https://www.asaas.com" target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 text-[10px] font-bold" style={{ color: "#a855f7" }}>
              Asaas →
            </a>
          </div>
        )}

        {/* Receita + Leads */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <CreditCard size={13} style={{ color: "#22c55e" }} />
              <span className="text-[11px] text-muted">Receita liquida</span>
            </div>
            <div className="font-syne font-extrabold text-lg" style={{ color: "#22c55e" }}>
              R${fmt2(metrics?.netRevenue || 0)}
            </div>
            <div className="text-[9px] mt-1" style={{ color: "#64748b" }}>
              Bruto: R${(metrics?.monthlyRevenue || 0).toLocaleString("pt-BR")}
            </div>
            <div className="text-[9px]" style={{ color: "#f87171" }}>
              Taxa: -R${fmt2(metrics?.asaasFees || 0)}
            </div>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageCircle size={13} style={{ color: "#3B82F6" }} />
              <span className="text-[11px] text-muted">Leads hoje</span>
            </div>
            <div className="font-syne font-extrabold text-lg text-foreground">{metrics?.leadsToday}</div>
            <div className="text-[9px] text-muted mt-1">{metrics?.leadsWeek} esta semana</div>
          </div>
        </div>

        {/* Novos + Conversao */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <UserCheck size={13} style={{ color: "#a855f7" }} />
              <span className="text-[11px] text-muted">Novos hoje</span>
            </div>
            <div className="font-syne font-extrabold text-lg" style={{ color: "#a855f7" }}>
              {metrics?.newUsersToday}
            </div>
            <div className="text-[9px] text-muted mt-1">{metrics?.newUsersWeek} esta semana</div>
          </div>
          <div className="p-3 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={13} style={{ color: "#f59e0b" }} />
              <span className="text-[11px] text-muted">Conversao</span>
            </div>
            <div className="font-syne font-extrabold text-lg" style={{ color: "#f59e0b" }}>
              {conversionRate}%
            </div>
            <div className="text-[9px] text-muted mt-1">usuarios profissionais</div>
          </div>
        </div>

        {/* Grid metricas */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Profissionais", value: metrics?.totalProfessionals || 0, color: "#3B82F6" },
            { label: "Clientes", value: metrics?.totalClients || 0, color: "#a855f7" },
            { label: "Ativos", value: metrics?.activeProfessionals || 0, color: "#22c55e" },
            { label: "Inativos", value: metrics?.inactiveProfessionals || 0, color: "#f87171" },
            { label: "Gratuito", value: metrics?.freeProfessionals || 0, color: "#A1A1AA" },
            { label: "Pago", value: metrics?.paidProfessionals || 0, color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-2.5 rounded-2xl text-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="font-syne font-bold text-xl" style={{ color }}>{value}</div>
              <div className="text-[9px] text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Freemium card destaque */}
        <div className="p-4 rounded-2xl"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)" }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(59,130,246,0.15)" }}>
              <Layers size={16} style={{ color: "#3B82F6" }} />
            </div>
            <div className="flex-1">
              <p className="font-syne font-bold text-sm text-foreground">Modelo Freemium</p>
              <p className="text-[10px] text-muted">Limite de 5 clientes únicos / 30 dias</p>
            </div>
            <Link href="/admin/profissionais" className="text-xs font-bold" style={{ color: "#3B82F6" }}>Gerenciar</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2.5 rounded-xl text-center" style={{ background: "rgba(239,68,68,0.08)" }}>
              <div className="font-syne font-bold text-lg" style={{ color: "#ef4444" }}>{metrics?.freeAtLimit || 0}</div>
              <div className="text-[9px] text-muted">No limite (5/5)</div>
            </div>
            <div className="p-2.5 rounded-xl text-center" style={{ background: "rgba(251,191,36,0.08)" }}>
              <div className="font-syne font-bold text-lg" style={{ color: "#FBBF24" }}>{metrics?.freeNearLimit || 0}</div>
              <div className="text-[9px] text-muted">Perto (4/5)</div>
            </div>
          </div>
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
            <span className="text-[10px] text-muted">275 meta · R$16.472,50/mes</span>
          </div>
        </div>

        {/* Carrossel PRO */}
        <div className="p-4 rounded-2xl"
          style={{ background: "#111113", border: `1px solid ${carouselActive ? "rgba(251,191,36,0.3)" : "#1F1F23"}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: carouselActive ? "rgba(251,191,36,0.15)" : "rgba(161,161,170,0.08)" }}>
                <Crown size={16} style={{ color: carouselActive ? "#FBBF24" : "#A1A1AA" }} />
              </div>
              <div>
                <p className="font-syne font-bold text-sm text-foreground">Carrossel PRO</p>
                <p className="text-[10px] text-muted">Destaque na home para profissionais pagos</p>
              </div>
            </div>
            <button onClick={toggleCarousel} disabled={carouselLoading}
              className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
              style={{ background: carouselActive ? "#FBBF24" : "#1F1F23" }}>
              {carouselLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                  style={{ left: carouselActive ? "calc(100% - 20px)" : 4 }} />
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${carouselActive ? "bg-yellow-400 animate-pulse" : "bg-gray-600"}`} />
            <span className="text-[10px]" style={{ color: carouselActive ? "#FBBF24" : "#64748b" }}>
              {carouselActive ? "Ativo — aparecendo na home para todos" : "Inativo — clique para ativar"}
            </span>
          </div>
        </div>

        {/* Secoes */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: "#3B82F6" }}>GERENCIAR</p>
          <div className="grid grid-cols-2 gap-3">
            {ADMIN_SECTIONS.map(({ href, icon: Icon, label, desc, badge }) => (
              <Link key={href} href={href} className="card-hover p-4 rounded-2xl relative"
                style={{ background: "#111113" }}>
                {badge > 0 && (
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

        {/* Denuncias recentes */}
        {recentReports.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold tracking-widest" style={{ color: "#FBBF24" }}>DENUNCIAS PENDENTES</p>
              <Link href="/admin/denuncias" className="text-xs font-semibold" style={{ color: "#FBBF24" }}>Ver todas</Link>
            </div>
            <div className="space-y-2">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#111113", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <Flag size={13} style={{ color: "#FBBF24" }} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{report.reason || "Sem motivo"}</p>
                    <p className="text-[10px] text-muted">{formatDate(report.created_at)}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold"
                    style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24" }}>PENDENTE</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
