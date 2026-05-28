"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CITIES } from "@/lib/constants";
import toast from "react-hot-toast";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

export default function EditarPerfilClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", neighborhood: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data } = await supabase
        .from("users").select("name, phone, neighborhood").eq("id", user.id).single();
      if (data) setForm({ name: data.name || "", phone: data.phone || "", neighborhood: data.neighborhood || "" });
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("users").update({
      name: form.name,
      phone: form.phone,
      neighborhood: form.neighborhood,
    }).eq("id", userId);
    if (error) { toast.error("Erro ao salvar"); setSaving(false); return; }
    toast.success("Perfil atualizado!");
    router.push("/perfil");
    setSaving(false);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#111113", border: "1px solid #1F1F23", outline: "none" };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/perfil" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Editar perfil</h1>
      </div>

      <form onSubmit={handleSave} className="px-4 py-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Nome completo</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Seu nome" required className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Telefone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="(34) 99999-9999" className={inputClass} style={inputStyle} />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Bairro</label>
          <select value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            className={inputClass} style={{ ...inputStyle, color: form.neighborhood ? "#FAFAFA" : "#A1A1AA" }}>
            <option value="">Selecione seu bairro</option>
            {uberlandia.neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
