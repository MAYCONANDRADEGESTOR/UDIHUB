"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Loader2,
  CheckCircle,
  MapPin,
  X,
} from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

const uberlandia = CITIES.find((c) => c.slug === "uberlandia")!;

export default function EditarPerfilPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(["Tibery", "Santa Mônica"]);
  const [form, setForm] = useState({
    name: "João Silva",
    bio: "Profissional com 15 anos de experiência em hidráulica residencial.",
    whatsapp: "(34) 99999-1111",
    category: "encanador",
  });

  function toggleNeighborhood(n: string) {
    setSelectedNeighborhoods((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted transition-all duration-200";
  const inputStyle = { background: "#09090B", border: "1px solid #1F1F23", outline: "none" };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <Link href="/painel" className="text-muted">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Editar perfil</h1>
        {saved && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#22c55e" }}>
            <CheckCircle size={13} />
            Salvo!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="px-4 py-4 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl"
              style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}
            >
              {getInitials(form.name)}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "#3B82F6", boxShadow: "0 0 10px rgba(59,130,246,0.5)" }}
            >
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <p className="font-syne font-bold text-foreground">{form.name}</p>
            <p className="text-xs text-muted">Toque na câmera para alterar a foto</p>
          </div>
        </div>

        {/* Available toggle */}
        <div
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          <div>
            <p className="font-semibold text-sm text-foreground">Disponível agora</p>
            <p className="text-xs text-muted">Aparece badge verde no seu perfil</p>
          </div>
          <button
            type="button"
            onClick={() => setAvailableNow(!availableNow)}
            className="w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0"
            style={{ background: availableNow ? "#22c55e" : "#1F1F23" }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
              style={{ left: availableNow ? "calc(100% - 20px)" : 4 }}
            />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Nome completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">WhatsApp</label>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Especialidade</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}
              style={{ ...inputStyle, color: "#FAFAFA" }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              maxLength={300}
              placeholder="Fale sobre sua experiência e serviços..."
              className={inputClass}
              style={{ ...inputStyle, resize: "none" }}
            />
            <p className="text-[10px] text-muted mt-1 text-right">{form.bio.length}/300</p>
          </div>
        </div>

        {/* Neighborhoods */}
        <div>
          <label className="block text-xs font-medium text-muted mb-2">
            Bairros atendidos ({selectedNeighborhoods.length} selecionados)
          </label>

          {/* Selected chips */}
          {selectedNeighborhoods.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedNeighborhoods.map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}
                >
                  {n}
                  <button type="button" onClick={() => toggleNeighborhood(n)}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Neighborhood picker */}
          <div
            className="max-h-40 overflow-y-auto rounded-xl p-2 space-y-0.5"
            style={{ background: "#09090B", border: "1px solid #1F1F23" }}
          >
            {uberlandia.neighborhoods.map((n) => {
              const selected = selectedNeighborhoods.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNeighborhood(n)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-150 flex items-center justify-between"
                  style={{
                    background: selected ? "rgba(59,130,246,0.1)" : "transparent",
                    color: selected ? "#93c5fd" : "#A1A1AA",
                  }}
                >
                  {n}
                  {selected && <CheckCircle size={10} style={{ color: "#3B82F6" }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
            boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </div>
  );
}
