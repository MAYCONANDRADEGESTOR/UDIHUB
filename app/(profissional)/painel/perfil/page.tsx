"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, CheckCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

export default function EditarPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [allNeighborhoods, setAllNeighborhoods] = useState<{ id: string; name: string }[]>([]);
  const [selectedNeighborhoodIds, setSelectedNeighborhoodIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    category: "",
    bio: "",
    available_now: false,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const cityRes = await supabase.from("cities").select("id").eq("slug", "uberlandia").single();
      const cityId = cityRes.data?.id || "";

      const [{ data: prof }, { data: userData }, { data: neighborhoods }] = await Promise.all([
        supabase.from("professionals")
          .select("id, whatsapp, bio, available_now, categories(slug), professional_neighborhoods(neighborhood_id)")
          .eq("user_id", user.id).single(),
        supabase.from("users").select("name, email, phone, avatar").eq("id", user.id).single(),
        supabase.from("neighborhoods").select("id, name").eq("city_id", cityId).order("name"),
      ]);

      if (!prof) { router.push("/seja-profissional"); return; }

      setProfessionalId(prof.id);
      setAvatar(userData?.avatar || null);
      setAllNeighborhoods(neighborhoods || []);
      setSelectedNeighborhoodIds(
        (prof.professional_neighborhoods as any[])?.map((pn: any) => pn.neighborhood_id) || []
      );
      setForm({
        name: userData?.name || "",
        email: userData?.email || user.email || "",
        phone: userData?.phone || "",
        whatsapp: prof.whatsapp || "",
        category: (prof.categories as any)?.slug || "",
        bio: prof.bio || "",
        available_now: prof.available_now || false,
      });
      setLoading(false);
    }
    load();
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto muito grande. Máximo 5MB."); return; }

    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro ao fazer upload"); setUploadingAvatar(false); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    await supabase.from("users").update({ avatar: avatarUrl }).eq("id", userId);
    setAvatar(avatarUrl);
    toast.success("Foto atualizada!");
    setUploadingAvatar(false);
  }

  function toggleNeighborhood(id: string) {
    setSelectedNeighborhoodIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!professionalId || !userId) return;
    setSaving(true);
    const supabase = createClient();

    const { data: cat } = await supabase.from("categories").select("id").eq("slug", form.category).single();

    await Promise.all([
      supabase.from("users").update({
        name: form.name,
        phone: form.phone || null,
      }).eq("id", userId),
      supabase.from("professionals").update({
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        bio: form.bio,
        available_now: form.available_now,
        ...(cat ? { category_id: cat.id } : {}),
      }).eq("id", professionalId),
    ]);

    await supabase.from("professional_neighborhoods").delete().eq("professional_id", professionalId);
    if (selectedNeighborhoodIds.length > 0) {
      await supabase.from("professional_neighborhoods").insert(
        selectedNeighborhoodIds.map((nid) => ({ professional_id: professionalId, neighborhood_id: nid }))
      );
    }

    setSaving(false);
    toast.success("Perfil atualizado!");
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#09090B", border: "1px solid #1F1F23", outline: "none" };
  const inputReadOnly = { background: "#09090B", border: "1px solid #1F1F23", outline: "none", opacity: 0.5 };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={24} style={{ color: "#3B82F6" }} className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <Link href="/painel" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Editar perfil</h1>
      </div>

      <form onSubmit={handleSave} className="px-4 py-4 space-y-5">

        {/* Avatar com upload */}
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {uploadingAvatar ? (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Loader2 size={20} style={{ color: "#3B82F6" }} className="animate-spin" />
              </div>
            ) : avatar ? (
              <img src={avatar} alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: "2px solid #1F1F23" }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl"
                style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                {getInitials(form.name)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "#3B82F6", boxShadow: "0 0 10px rgba(59,130,246,0.5)" }}>
              <Camera size={12} className="text-white" />
            </div>
          </div>
          <div>
            <p className="font-syne font-bold text-foreground">{form.name || "Seu nome"}</p>
            <p className="text-xs text-muted">Toque na câmera para alterar a foto</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="user"
            onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Disponível agora */}
        <div className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div>
            <p className="font-semibold text-sm text-foreground">Disponível agora</p>
            <p className="text-xs text-muted">Aparece badge verde no seu perfil</p>
          </div>
          <button type="button" onClick={() => setForm({ ...form, available_now: !form.available_now })}
            className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
            style={{ background: form.available_now ? "#22c55e" : "#1F1F23" }}>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
              style={{ left: form.available_now ? "calc(100% - 20px)" : 4 }} />
          </button>
        </div>

        {/* Campos */}
        <div className="space-y-3">

          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nome completo</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome" required className={inputClass} style={inputStyle} />
          </div>

          {/* Email — somente leitura */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">E-mail</label>
            <input type="email" value={form.email} readOnly
              className={inputClass} style={inputReadOnly} />
            <p className="text-[10px] text-muted mt-1">Para alterar o e-mail entre em contato com o suporte</p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Telefone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(34) 99999-9999" className={inputClass} style={inputStyle} />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">WhatsApp (recebe leads)</label>
            <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="(34) 99999-9999" required className={inputClass} style={inputStyle} />
          </div>

          {/* Especialidade */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Especialidade</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass} style={{ ...inputStyle, color: "#FAFAFA" }}>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4} maxLength={300} placeholder="Fale sobre sua experiência e serviços..."
              className={inputClass} style={{ ...inputStyle, resize: "none" }} />
            <p className="text-[10px] text-muted mt-1 text-right">{form.bio.length}/300</p>
          </div>
        </div>

        {/* Bairros atendidos */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">
            Bairros atendidos ({selectedNeighborhoodIds.length} selecionados)
          </label>
          {selectedNeighborhoodIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {allNeighborhoods
                .filter((n) => selectedNeighborhoodIds.includes(n.id))
                .map((n) => (
                  <div key={n.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                    {n.name}
                    <button type="button" onClick={() => toggleNeighborhood(n.id)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
            </div>
          )}
          <div className="max-h-40 overflow-y-auto rounded-xl p-2 space-y-0.5"
            style={{ background: "#09090B", border: "1px solid #1F1F23" }}>
            {allNeighborhoods.map((n) => {
              const selected = selectedNeighborhoodIds.includes(n.id);
              return (
                <button key={n.id} type="button" onClick={() => toggleNeighborhood(n.id)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center justify-between"
                  style={{ background: selected ? "rgba(59,130,246,0.1)" : "transparent", color: selected ? "#93c5fd" : "#A1A1AA" }}>
                  {n.name}
                  {selected && <CheckCircle size={10} style={{ color: "#3B82F6" }} />}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)", opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </div>
  );
}
