"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, MapPin, CreditCard, Flag, BarChart3,
  ArrowUpRight, MessageCircle, Loader2, TrendingUp,
  Trash2, X, ArrowLeft, AlertCircle, UserCheck, Crown,
  Camera, Tag, Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

const ASAAS_PIX_FIXED = 0.99;
const ASAAS_PIX_PERCENT = 0.0139;

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
  proProfessionals: number;
  basicProfessionals: number;
  couponProfessionals: number;
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
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  created_at: string;
}

interface Report {
  id: string;
  reason: string;
  status: string;
  created_at: string;
}

interface CouponProf {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  categoria: string;
  coupon_code: string;
  trial_ends_at: string | null;
  status: string;
  created_at: string;
}

const ADMIN_EMAIL = "udihub@outlook.com";

export default function AdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [couponProfs, setCouponProfs] = useState<CouponProf[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<RecentUser | null>(null);
  const [deleting, setDeleting] = useState(false);
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
        totalProf, activeProf, inactiveProf, proProf, basicProf,
        totalClients, totalUsers,
        totalLeads, leadsToday, leadsWeek,
        subscriptions, pendingReports,
        citiesActive, recentUsersData,
        newUsersToday, newUsersWeek,
        recentReportsData, carouselSetting,
        adminData, couponData,
      ] = await Promise.all([
        supabase.from("professionals").select("id", { count: "exact", head: true }),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("status", "inactive"),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("plan", "basic"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("whatsapp_clicks").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("subscriptions").select("plan").eq("status", "active"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cities").select("id", { count: "exact", head: true }).eq("enabled", true),
        supabase.from("users").select("id, name, email, role, banned, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
        supabase.from("reports").select("id, reason, status, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(3),
        supabase.from("app_settings").select("value").eq("key", "pro_carousel_active").single(),
        supabase.from("users").select("name, avatar").eq("id", user.id).single(),
        // Profissionais com cupom
        supabase.from("professionals")
          .select("id, coupon_code, trial_ends_at, status, created_at, whatsapp, users(name, email), categories(name)")
          .not("coupon_code", "is", null)
          .order("created_at", { ascending: false }),
      ]);

      setAdminAvatar(adminData.data?.avatar || null);
      setAdminName(adminData.data?.name || "Admin");
      setCarouselActive(carouselSetting.data?.value === "true");

      // Profissionais com cupom
      const couponList: CouponProf[] = (couponData.data || []).map((p: any) => ({
        id: p.id,
        name: p.users?.name || "Sem nome",
        email: p.users?.email || "",
        whatsapp: p.whatsapp || "",
        categoria: p.categories?.name || "",
        coupon_code: p.coupon_code,
        trial_ends_at: p.trial_ends_at,
        status: p.status,
        created_at: p.created_at,
      }));
      setCouponProfs(couponList);

      // Contar cupons
      const couponCount = couponData.data?.length || 0;

      let totalRevenue = 0, totalFees = 0;
      for (const s of subscriptions.data || []) {
        const valor = s.plan === "pro" ? 99 : 69;
        const { net, fee } = calcNet(valor);
        totalRevenue += valor;
        totalFees += fee;
      }

      setMetrics({
        totalProfessionals: totalProf.count || 0,
        activeProfessionals: activeProf.count || 0,
        inactiveProfessionals: inactiveProf.count || 0,
        proProfessionals: proProf.count || 0,
        basicProfessionals: basicProf.count || 0,
        couponProfessionals: couponCount,
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
      });

      setRecentUsers((recentUsersData.data as RecentUser[]) || []);
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

  async function handleDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("professionals").delete().eq("user_id", deleteModal.id);
    await supabase.from("users").delete().eq("id", deleteModal.id);
    setRecentUsers((prev) => prev.filter((u) => u.id !== deleteModal.id));
    setDeleteModal(null);
    setDeleting(false);
    toast.success("Usuario deletado!");
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

  function daysRemaining(date: string | null) {
    if (!date) return null;
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
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
    { href: "/admin/usuarios", icon: Users, label: "Usuarios", desc: "Gerenciar e banir", badge: null },
    { href: "/admin/cidades", icon: MapPin, label: "Cidades", desc: "Ativar novas cidades", badge: null },
    { href: "/admin/denuncias", icon: Flag, label: "Denuncias", desc: "Resolver denuncias", badge: metrics?.pendingReports || 0 },
    { href: "/admin/metricas", icon: BarChart3, label: "Metricas", desc: "Faturamento e dados", badge: null },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header com foto de perfil do admin */}
      <div className="px-4 pt-4 pb-3 sticky top-0 z-40"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted"><ArrowLeft size={20} /></Link>

          {/* Avatar clicável */}
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
            { label: "Basico", value: metrics?.basicProfessionals || 0, color: "#3B82F6" },
            { label: "Pro", value: metrics?.proProfessionals || 0, color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-2.5 rounded-2xl text-center"
              style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="font-syne font-bold text-xl" style={{ color }}>{value}</div>
              <div className="text-[9px] text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Cupom card destaque */}
        <div className="p-4 rounded-2xl"
          style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.15)" }}>
              <Tag size={16} style={{ color: "#FBBF24" }} />
            </div>
            <div className="flex-1">
              <p className="font-syne font-bold text-sm text-foreground">Cupom UDIHUB90</p>
              <p className="text-[10px] text-muted">3 meses gratis · Plano Basico</p>
            </div>
            <div className="text-right">
              <div className="font-syne font-bold text-2xl" style={{ color: "#FBBF24" }}>
                {metrics?.couponProfessionals || 0}
              </div>
              <div className="text-[10px] text-muted">cadastrados</div>
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
            <span className="text-[10px] text-muted">275 meta · R$18.975/mes</span>
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
                <p className="text-[10px] text-muted">Destaque na home para profissionais PRO</p>
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

        {/* Profissionais com cupom */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: "#FBBF24" }}>
              CUPOM UDIHUB90 ({couponProfs.length})
            </p>
          </div>
          {couponProfs.length === 0 ? (
            <div className="text-center py-6 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <Tag size={20} className="mx-auto text-muted mb-2" />
              <p className="text-xs text-muted">Nenhum profissional cadastrado pelo cupom ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {couponProfs.map((prof) => {
                const days = daysRemaining(prof.trial_ends_at);
                return (
                  <div key={prof.id} className="p-4 rounded-2xl"
                    style={{ background: "#111113", border: "1px solid rgba(251,191,36,0.15)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs"
                        style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24" }}>
                        {getInitials(prof.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground truncate">{prof.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                            style={{
                              background: prof.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                              color: prof.status === "active" ? "#22c55e" : "#f87171"
                            }}>
                            {prof.status === "active" ? "Ativo" : "Inativo"}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                            style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24" }}>
                            {prof.coupon_code}
                          </span>
                        </div>
                        <p className="text-xs text-muted truncate">{prof.email}</p>
                        {prof.categoria && (
                          <p className="text-[10px] text-muted mt-0.5">{prof.categoria}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted">
                            Cadastrou {formatDate(prof.created_at)}
                          </span>
                          {days !== null && (
                            <span className="flex items-center gap-1 text-[10px]"
                              style={{ color: days > 7 ? "#22c55e" : days > 0 ? "#FBBF24" : "#f87171" }}>
                              <Clock size={9} />
                              {days > 0 ? `${days} dias restantes` : "Trial expirado"}
                            </span>
                          )}
                        </div>
                        {prof.whatsapp && (
                          <a href={`https://wa.me/55${prof.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Oi ${prof.name}! Aqui e o Maycon do UDIHUB. Tudo certo com seu perfil?`)}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: "rgba(22,163,74,0.1)", color: "#22c55e", border: "1px solid rgba(22,163,74,0.2)" }}>
                            WhatsApp →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

        {/* Usuarios recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: "#3B82F6" }}>USUARIOS RECENTES</p>
            <Link href="/admin/usuarios" className="text-xs font-semibold" style={{ color: "#3B82F6" }}>Ver todos</Link>
          </div>
          <div className="space-y-2">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <p className="text-sm text-muted">Nenhum usuario ainda</p>
              </div>
            ) : recentUsers.map((user) => (
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
                      {user.role === "professional" ? "Prof" : "Cliente"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted truncate">{user.email}</p>
                </div>
                <button onClick={() => setDeleteModal(user)}
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ background: "rgba(239,68,68,0.08)" }}>
                  <Trash2 size={13} style={{ color: "#f87171" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal deletar */}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setDeleteModal(null)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-foreground">Deletar usuario</h3>
              <button onClick={() => setDeleteModal(null)} className="text-muted"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted mb-6">
              Deletar <strong className="text-foreground">{deleteModal.name}</strong> permanentemente?
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
