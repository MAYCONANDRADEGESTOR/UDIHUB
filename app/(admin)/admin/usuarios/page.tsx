"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Ban,
  CheckCircle,
  User,
  Briefcase,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
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

const MOCK_USERS: UserItem[] = [
  { id: "1", name: "João Silva", email: "joao@email.com", role: "professional", banned: false, created_at: "2025-01-10T00:00:00Z" },
  { id: "2", name: "Maria Oliveira", email: "maria@email.com", role: "client", banned: false, created_at: "2025-01-12T00:00:00Z" },
  { id: "3", name: "Pedro Costa", email: "pedro@email.com", role: "professional", banned: true, ban_reason: "Número de WhatsApp falso", created_at: "2025-01-05T00:00:00Z" },
  { id: "4", name: "Ana Ferreira", email: "ana@email.com", role: "client", banned: false, created_at: "2025-01-15T00:00:00Z" },
  { id: "5", name: "Carlos Mendes", email: "carlos@email.com", role: "professional", banned: false, created_at: "2025-01-08T00:00:00Z" },
];

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "professional">("all");
  const [banModal, setBanModal] = useState<{ user: UserItem; action: "ban" | "unban" } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = users.filter((u) => {
    const matchQuery = u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  async function handleBanAction() {
    if (!banModal) return;
    setLoading(true);
    // TODO: call Supabase
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === banModal.user.id
            ? { ...u, banned: banModal.action === "ban", ban_reason: banModal.action === "ban" ? banReason : undefined }
            : u
        )
      );
      setBanModal(null);
      setBanReason("");
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
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
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Usuários</h1>
        <span className="text-xs text-muted">{users.length} total</span>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          <Search size={16} className="text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted outline-none"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-2">
          {(["all", "client", "professional"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                background: roleFilter === r ? "rgba(59,130,246,0.2)" : "#111113",
                border: roleFilter === r ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1F1F23",
                color: roleFilter === r ? "#3B82F6" : "#A1A1AA",
              }}
            >
              {r === "all" ? "Todos" : r === "client" ? "Clientes" : "Profissionais"}
            </button>
          ))}
        </div>

        {/* Users list */}
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-2xl"
              style={{
                background: "#111113",
                border: user.banned ? "1px solid rgba(239,68,68,0.3)" : "1px solid #1F1F23",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: user.banned
                      ? "rgba(239,68,68,0.1)"
                      : "rgba(59,130,246,0.1)",
                    color: user.banned ? "#f87171" : "#93c5fd",
                  }}
                >
                  {getInitials(user.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{user.name}</span>
                    <div
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: user.role === "professional"
                          ? "rgba(59,130,246,0.1)"
                          : "rgba(161,161,170,0.1)",
                        color: user.role === "professional" ? "#93c5fd" : "#A1A1AA",
                      }}
                    >
                      {user.role === "professional" ? <Briefcase size={9} /> : <User size={9} />}
                      {user.role === "professional" ? "Profissional" : "Cliente"}
                    </div>
                    {user.banned && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                        BANIDO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5 truncate">{user.email}</p>
                  {user.ban_reason && (
                    <p className="text-xs mt-1" style={{ color: "#f87171" }}>
                      Motivo: {user.ban_reason}
                    </p>
                  )}
                  <p className="text-[10px] text-muted mt-1">
                    Desde {formatDate(user.created_at)}
                  </p>
                </div>

                {/* Ban/Unban button */}
                <button
                  onClick={() => setBanModal({ user, action: user.banned ? "unban" : "ban" })}
                  className="p-2 rounded-xl transition-all duration-150 flex-shrink-0"
                  style={{
                    background: user.banned
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                    border: user.banned
                      ? "1px solid rgba(34,197,94,0.2)"
                      : "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {user.banned ? (
                    <CheckCircle size={15} style={{ color: "#22c55e" }} />
                  ) : (
                    <Ban size={15} style={{ color: "#f87171" }} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ban modal */}
      {banModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setBanModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={18}
                  style={{ color: banModal.action === "ban" ? "#f87171" : "#22c55e" }}
                />
                <h3 className="font-syne font-bold text-foreground">
                  {banModal.action === "ban" ? "Banir usuário" : "Desbanir usuário"}
                </h3>
              </div>
              <button onClick={() => setBanModal(null)} className="text-muted">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-muted mb-4">
              {banModal.action === "ban"
                ? `Banir "${banModal.user.name}"? O perfil será removido do marketplace imediatamente.`
                : `Restaurar acesso de "${banModal.user.name}"?`}
            </p>

            {banModal.action === "ban" && (
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Motivo do banimento (registro interno)..."
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted mb-3"
                style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none", resize: "none" }}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setBanModal(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-muted"
                style={{ background: "#09090B", border: "1px solid #1F1F23" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleBanAction}
                disabled={loading || (banModal.action === "ban" && !banReason.trim())}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: banModal.action === "ban" ? "#ef4444" : "#22c55e",
                  opacity: loading || (banModal.action === "ban" && !banReason.trim()) ? 0.6 : 1,
                }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                {banModal.action === "ban" ? "Confirmar banimento" : "Restaurar acesso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
