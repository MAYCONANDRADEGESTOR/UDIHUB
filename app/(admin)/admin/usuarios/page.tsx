"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Ban, CheckCircle, User, Briefcase, AlertTriangle, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials, formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "client" | "professional";
  banned: boolean;
  ban_reason?: string;
  created_at: string;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "professional">("all");
  const [banModal, setBanModal] = useState<{ user: UserItem; action: "ban" | "unban" } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("id, name, email, role, banned, ban_reason, created_at")
      .order("created_at", { ascending: false });
    setUsers((data as any) || []);
    setLoading(false);
  }

  async function handleBanAction() {
    if (!banModal) return;
    setProcessing(true);
    const supabase = createClient();
    const isBanning = banModal.action === "ban";

    await supabase.from("users").update({
      banned: isBanning,
      ban_reason: isBanning ? banReason : null,
    }).eq("id", banModal.user.id);

    if (banModal.user.role === "professional") {
      const { data: prof } = await supabase
        .from("professionals").select("id").eq("user_id", banModal.user.id).single();
      if (prof) {
        await supabase.from("professionals")
          .update({ status: isBanning ? "suspended" : "active" })
          .eq("id", prof.id);
      }
    }

    setUsers((prev) => prev.map((u) =>
      u.id === banModal.user.id
        ? { ...u, banned: isBanning, ban_reason: isBanning ? banReason : undefined }
        : u
    ));
    setBanModal(null);
    setBanReason("");
    setProcessing(false);
  }

  const filtered = users.filter((u) => {
    const matchQuery = u.name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/admin" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Usuários</h1>
        <span className="text-xs text-muted">{users.length} total</span>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <Search size={16} className="text-muted" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted outline-none" />
        </div>

        <div className="flex gap-2">
          {(["all", "client", "professional"] as const).map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: roleFilter === r ? "rgba(59,130,246,0.2)" : "#111113",
                border: roleFilter === r ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
                color: roleFilter === r ? "#3B82F6" : "#A1A1AA",
              }}>
              {r === "all" ? "Todos" : r === "client" ? "Clientes" : "Profissionais"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <User size={28} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((user) => (
              <div key={user.id} className="p-4 rounded-2xl"
                style={{ background: "#111113", border: user.banned ? "1px solid rgba(239,68,68,0.3)" : "1px solid #1F1F23" }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: user.banned ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)", color: user.banned ? "#f87171" : "#93c5fd" }}>
                    {getInitials(user.name || "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{user.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                        style={{ background: user.role === "professional" ? "rgba(59,130,246,0.1)" : "rgba(161,161,170,0.1)", color: user.role === "professional" ? "#93c5fd" : "#A1A1AA" }}>
                        {user.role === "professional" ? <Briefcase size={9} /> : <User size={9} />}
                        {user.role === "professional" ? "Profissional" : "Cliente"}
                      </span>
                      {user.banned && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>BANIDO</span>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                    {user.ban_reason && <p className="text-xs mt-0.5" style={{ color: "#f87171" }}>Motivo: {user.ban_reason}</p>}
                    <p className="text-[10px] text-muted mt-0.5">Desde {formatDate(user.created_at)}</p>
                  </div>
                  <button onClick={() => setBanModal({ user, action: user.banned ? "unban" : "ban" })}
                    className="p-2 rounded-xl flex-shrink-0"
                    style={{ background: user.banned ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: user.banned ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)" }}>
                    {user.banned
                      ? <CheckCircle size={15} style={{ color: "#22c55e" }} />
                      : <Ban size={15} style={{ color: "#f87171" }} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {banModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setBanModal(null)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} style={{ color: banModal.action === "ban" ? "#f87171" : "#22c55e" }} />
                <h3 className="font-syne font-bold text-foreground">
                  {banModal.action === "ban" ? "Banir usuário" : "Desbanir usuário"}
                </h3>
              </div>
              <button onClick={() => setBanModal(null)} className="text-muted"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted mb-4">
              {banModal.action === "ban"
                ? `Banir "${banModal.user.name}"? O perfil será removido do marketplace imediatamente.`
                : `Restaurar acesso de "${banModal.user.name}"?`}
            </p>
            {banModal.action === "ban" && (
              <textarea value={banReason} onChange={(e) => setBanReason(e.target.value)}
                placeholder="Motivo do banimento..." rows={3} required
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted mb-3"
                style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none", resize: "none" }} />
            )}
            <div className="flex gap-3">
              <button onClick={() => setBanModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-muted"
                style={{ background: "#09090B", border: "1px solid #1F1F23" }}>Cancelar</button>
              <button onClick={handleBanAction}
                disabled={processing || (banModal.action === "ban" && !banReason.trim())}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: banModal.action === "ban" ? "#ef4444" : "#22c55e", opacity: processing ? 0.6 : 1 }}>
                {processing && <Loader2 size={14} className="animate-spin" />}
                {banModal.action === "ban" ? "Confirmar banimento" : "Restaurar acesso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
