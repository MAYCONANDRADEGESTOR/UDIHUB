"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, CheckCircle, X, Clock, Moon, Coffee, Instagram } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";

const DAYS = [
  { key: "dom", label: "Domingo" },
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sáb", label: "Sábado" },
];

type DayHours = {
  open: string; close: string; closed: boolean;
  lunch: boolean; lunchStart: string; lunchEnd: string;
  nocturnal: boolean;
};
type WorkHours = Record<string, DayHours>;

const DEFAULT_DAY: DayHours = {
  open: "08:00", close: "17:00", closed: false,
  lunch: false, lunchStart: "12:00", lunchEnd: "13:00",
  nocturnal: false,
};

const DEFAULT_HOURS: WorkHours = {
  dom: { ...DEFAULT_DAY, closed: true },
  seg: { ...DEFAULT_DAY },
  ter: { ...DEFAULT_DAY },
  qua: { ...DEFAULT_DAY },
  qui: { ...DEFAULT_DAY },
  sex: { ...DEFAULT_DAY },
  sáb: { ...DEFAULT_DAY, close: "13:00" },
};

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [workHours, setWorkHours] = useState<WorkHours>(DEFAULT_HOURS);
  const [showHours, setShowHours] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", whatsapp: "",
    bio: "", available_now: false, instagram: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const cityRes = await supabase.from("cities").select("id").eq("slug", "uberlandia").single();
      const cityId = cityRes.data?.id || "";

      const [{ data: prof }, { data: userData }, { data: neighborhoods }, { data: profCats }] = await Promise.all([
        supabase.from("professionals")
          .select("id, whatsapp, bio, available_now, work_hours, instagram, professional_neighborhoods(neighborhood_id)")
          .eq("user_id", user.id).single(),
        supabase.from("users").select("name, email, phone, avatar").eq("id", user.id).single(),
        supabase.from("neighborhoods").select("id, name").eq("city_id", cityId).order("name"),
        supabase.from("professional_categories").select("category_id, is_primary").eq("professional_id",
          (await supabase.from("professionals").select("id").eq("user_id", user.id).single()).data?.id || ""
        ),
      ]);

      if (!prof) { router.push("/seja-profissional"); return; }

      setProfessionalId(prof.id);
      setAvatar(userData?.avatar || null);
      setAllNeighborhoods(neighborhoods || []);
      setSelectedNeighborhoodIds(
        (prof.professional_neighborhoods as any[])?.map((pn: any) => pn.neighborhood_id) || []
      );

      // Carregar categorias selecionadas (primária primeiro)
      if (profCats && profCats.length > 0) {
        const sorted = [...profCats].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
        const { data: catsData } = await supabase
          .from("categories").select("id, slug")
          .in("id", sorted.map((pc: any) => pc.category_id));

        if (catsData) {
          const slugs = sorted.map((pc: any) =>
            catsData.find((c: any) => c.id === pc.category_id)?.slug
          ).filter(Boolean) as string[];
          setSelectedCategories(slugs);
        }
      }

      if (prof.work_hours) {
        const saved = prof.work_hours as Record<string, any>;
        const migrated: WorkHours = {};
        for (const key of Object.keys(DEFAULT_HOURS)) {
          migrated[key] = { ...DEFAULT_DAY, ...(saved[key] || {}) };
        }
        setWorkHours(migrated);
        setShowHours(true);
      }

      setForm({
        name: userData?.name || "",
        email: userData?.email || user.email || "",
        phone: userData?.phone || "",
        whatsapp: prof.whatsapp || "",
        bio: prof.bio || "",
        available_now: prof.available_now || false,
        instagram: prof.instagram || "",
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

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) { toast.error("Máximo 3 categorias!"); return prev; }
      return [...prev, slug];
    });
  }

  function updateDayHours(key: string, field: keyof DayHours, value: string | boolean) {
    setWorkHours((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function applyNocturnal(key: string, isNocturnal: boolean) {
    setWorkHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], nocturnal: isNocturnal, open: isNocturnal ? "18:00" : "08:00", close: isNocturnal ? "23:00" : "17:00", lunch: false },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!professionalId || !userId) return;
    if (selectedCategories.length === 0) { toast.error("Selecione pelo menos 1 categoria"); return; }
    setSaving(true);
    const supabase = createClient();

    const { data: catsData } = await supabase
      .from("categories").select("id, slug")
      .in("slug", selectedCategories);

    const primaryCat = catsData?.find((c: any) => c.slug === selectedCategories[0]);

    await Promise.all([
      supabase.from("users").update({ name: form.name, phone: form.phone || null }).eq("id", userId),
      supabase.from("professionals").update({
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        bio: form.bio,
        available_now: form.available_now,
        work_hours: showHours ? workHours : null,
        category_id: primaryCat?.id || null,
        instagram: form.instagram ? form.instagram.replace("@", "") : null,
      }).eq("id", professionalId),
    ]);

    // Atualizar categorias
    await supabase.from("professional_categories").delete().eq("professional_id", professionalId);
    if (catsData && catsData.length > 0) {
      await supabase.from("professional_categories").insert(
        selectedCategories.map((slug, idx) => ({
          professional_id: professionalId,
          category_id: catsData.find((c: any) => c.slug === slug)?.id,
          is_primary: idx === 0,
        })).filter((pc) => pc.category_id)
      );
    }

    // Atualizar bairros
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
  const timeInput = "text-xs px-2 py-1.5 rounded-lg text-foreground";
  const timeStyle = { background: "#111113", border: "1px solid #1F1F23", outline: "none" };

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

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {uploadingAvatar ? (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <Loader2 size={20} style={{ color: "#3B82F6" }} className="animate-spin" />
              </div>
            ) : avatar ? (
              <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" style={{ border: "2px solid #1F1F23" }} />
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
            <p className="text-xs text-muted">Toque para tirar foto ou escolher da galeria</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Disponível agora */}
        <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
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
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nome completo</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome" required className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">E-mail</label>
            <input type="email" value={form.email} readOnly className={inputClass} style={inputReadOnly} />
            <p className="text-[10px] text-muted mt-1">Para alterar o e-mail entre em contato com o suporte</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">WhatsApp (recebe leads)</label>
            <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="(34) 99999-9999" required className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              <Instagram size={11} className="inline mr-1" />Instagram (opcional)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">@</span>
              <input type="text" value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value.replace("@", "") })}
                placeholder="seuinstagram"
                className={inputClass}
                style={{ ...inputStyle, paddingLeft: "2rem" }} />
            </div>
            {form.instagram && (
              <a href={`https://instagram.com/${form.instagram}`} target="_blank" rel="noreferrer"
                className="text-[10px] mt-1 block" style={{ color: "#3B82F6" }}>
                instagram.com/{form.instagram} →
              </a>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4} maxLength={300} placeholder="Fale sobre sua experiência e serviços..."
              className={inputClass} style={{ ...inputStyle, resize: "none" }} />
            <p className="text-[10px] text-muted mt-1 text-right">{form.bio.length}/300</p>
          </div>
        </div>

        {/* ── CATEGORIAS ── */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">
            Especialidades ({selectedCategories.length}/3 selecionadas)
            <span className="ml-1 text-[10px]" style={{ color: "#64748b" }}>— máximo 3</span>
          </label>

          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCategories.map((slug, idx) => {
                const cat = CATEGORIES.find(c => c.slug === slug);
                if (!cat) return null;
                return (
                  <div key={slug} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: idx === 0 ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.08)",
                      border: `1px solid ${idx === 0 ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.2)"}`,
                      color: "#93c5fd"
                    }}>
                    {cat.icon} {cat.name}
                    {idx === 0 && <span className="text-[9px] ml-1 opacity-70">principal</span>}
                    <button type="button" onClick={() => toggleCategory(slug)}><X size={10} /></button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="max-h-48 overflow-y-auto rounded-xl p-2 space-y-0.5"
            style={{ background: "#09090B", border: "1px solid #1F1F23" }}>
            {CATEGORIES.map((cat) => {
              const selected = selectedCategories.includes(cat.slug);
              const isPrimary = selectedCategories[0] === cat.slug;
              return (
                <button key={cat.slug} type="button" onClick={() => toggleCategory(cat.slug)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 flex items-center justify-between"
                  style={{
                    background: selected ? "rgba(59,130,246,0.1)" : "transparent",
                    color: selected ? "#93c5fd" : "#A1A1AA"
                  }}>
                  <span>{cat.icon} {cat.name}</span>
                  {selected && (
                    <span className="flex items-center gap-1">
                      {isPrimary && <span className="text-[9px] opacity-70">principal</span>}
                      <CheckCircle size={10} style={{ color: "#3B82F6" }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted mt-1">A primeira categoria selecionada é a principal</p>
        </div>

        {/* ── HORÁRIOS ── */}
        <div className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Clock size={15} style={{ color: "#3B82F6" }} />
              <p className="font-syne font-bold text-sm text-foreground">Horários de atendimento</p>
            </div>
            <button type="button" onClick={() => setShowHours(!showHours)}
              className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
              style={{ background: showHours ? "#3B82F6" : "#1F1F23" }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                style={{ left: showHours ? "calc(100% - 20px)" : 4 }} />
            </button>
          </div>
          <p className="text-xs text-muted mb-3">
            {showHours ? "Configure os horários exibidos no seu perfil." : "Ative para mostrar seus horários no perfil."}
          </p>

          {showHours && (
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => {
                const h: DayHours = { ...DEFAULT_DAY, ...(workHours[key] || {}) };
                return (
                  <div key={key} className="rounded-xl overflow-hidden" style={{ background: "#09090B", border: "1px solid #1F1F23" }}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-xs font-semibold text-muted w-12 flex-shrink-0">{label}</span>
                      {h.closed ? (
                        <span className="flex-1 text-xs" style={{ color: "#ef4444" }}>Fechado</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                          <input type="time" value={h.open} onChange={(e) => updateDayHours(key, "open", e.target.value)} className={timeInput} style={timeStyle} />
                          <span className="text-xs text-muted">–</span>
                          <input type="time" value={h.close} onChange={(e) => updateDayHours(key, "close", e.target.value)} className={timeInput} style={timeStyle} />
                        </div>
                      )}
                      <button type="button" onClick={() => updateDayHours(key, "closed", !h.closed)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
                        style={{ background: h.closed ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: h.closed ? "#22c55e" : "#f87171", border: `1px solid ${h.closed ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                        {h.closed ? "Abrir" : "Fechar"}
                      </button>
                    </div>
                    {!h.closed && (
                      <div className="flex items-center gap-3 px-3 pb-2">
                        <button type="button" onClick={() => updateDayHours(key, "lunch", !h.lunch)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                          style={{ background: h.lunch ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${h.lunch ? "rgba(251,191,36,0.3)" : "#1F1F23"}`, color: h.lunch ? "#FBBF24" : "#64748b" }}>
                          <Coffee size={10} />Almoço
                        </button>
                        {!h.nocturnal ? (
                          <button type="button" onClick={() => applyNocturnal(key, true)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1F1F23", color: "#64748b" }}>
                            <Moon size={10} />Noturno
                          </button>
                        ) : (
                          <button type="button" onClick={() => applyNocturnal(key, false)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}>
                            <Moon size={10} />Noturno ✓
                          </button>
                        )}
                      </div>
                    )}
                    {!h.closed && h.lunch && (
                      <div className="flex items-center gap-2 px-3 pb-2.5" style={{ borderTop: "1px solid #1F1F23", paddingTop: "8px" }}>
                        <Coffee size={11} style={{ color: "#FBBF24" }} className="flex-shrink-0" />
                        <span className="text-[10px] text-muted flex-shrink-0">Almoço:</span>
                        <input type="time" value={h.lunchStart} onChange={(e) => updateDayHours(key, "lunchStart", e.target.value)} className={timeInput} style={timeStyle} />
                        <span className="text-xs text-muted">–</span>
                        <input type="time" value={h.lunchEnd} onChange={(e) => updateDayHours(key, "lunchEnd", e.target.value)} className={timeInput} style={timeStyle} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bairros */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">
            Bairros atendidos ({selectedNeighborhoodIds.length} selecionados)
          </label>
          {selectedNeighborhoodIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {allNeighborhoods.filter((n) => selectedNeighborhoodIds.includes(n.id)).map((n) => (
                <div key={n.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}>
                  {n.name}
                  <button type="button" onClick={() => toggleNeighborhood(n.id)}><X size={10} /></button>
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
