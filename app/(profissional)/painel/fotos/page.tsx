"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Trash2, Loader2, Plus, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  order: number;
}

type ProfessionalPlan = "free" | "basic" | "professional" | "professional_annual" | "pro";

export default function FotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [plan, setPlan] = useState<ProfessionalPlan>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPaidPlan = plan === "professional" || plan === "professional_annual" || plan === "pro";
  const maxPhotos = isPaidPlan ? 10 : 3;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data: prof } = await supabase
        .from("professionals")
        .select("id, plan, professional_photos(id, url, caption, order)")
        .eq("user_id", user.id)
        .single();

      if (!prof) { router.push("/painel"); return; }

      setProfessionalId(prof.id);
      setPlan(prof.plan);
      setPhotos(
        ((prof.professional_photos as any[]) || [])
          .sort((a, b) => a.order - b.order)
      );
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !professionalId || !userId) return;

    if (photos.length >= maxPhotos) {
      toast.error(`Limite de ${maxPhotos} fotos para o plano ${isPaidPlan ? "Profissional" : "Gratuito"}`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto muito grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop();
    const path = `${userId}/${professionalId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("professional-photos")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      toast.error("Erro ao fazer upload da foto");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("professional-photos")
      .getPublicUrl(path);

    const { data: photo, error: dbError } = await supabase
      .from("professional_photos")
      .insert({
        professional_id: professionalId,
        url: urlData.publicUrl,
        order: photos.length,
      })
      .select()
      .single();

    if (dbError) {
      toast.error("Erro ao salvar foto");
      setUploading(false);
      return;
    }

    setPhotos((prev) => [...prev, photo as Photo]);
    toast.success("Foto adicionada!");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(photo: Photo) {
    if (!userId || !professionalId) return;
    const supabase = createClient();

    // Extrai o path da URL
    const urlParts = photo.url.split("/professional-photos/");
    if (urlParts[1]) {
      await supabase.storage.from("professional-photos").remove([urlParts[1]]);
    }

    await supabase.from("professional_photos").delete().eq("id", photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    toast.success("Foto removida");
  }

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
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Fotos do perfil</h1>
        <span className="text-xs text-muted">{photos.length}/{maxPhotos}</span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Info */}
        <div className="p-3 rounded-xl flex items-start gap-2"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <ImageIcon size={14} style={{ color: "#3B82F6" }} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed" style={{ color: "#93c5fd" }}>
            Profissionais com fotos recebem até 3x mais contatos. Plano {isPaidPlan ? "Profissional" : "Gratuito"}: até {maxPhotos} fotos.
          </p>
        </div>

        {/* Grade de fotos */}
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden"
              style={{ border: "1px solid #1F1F23" }}>
              <img src={photo.url} alt="Foto do profissional"
                className="w-full h-full object-cover" />
              <button onClick={() => handleDelete(photo)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.9)" }}>
                <Trash2 size={11} className="text-white" />
              </button>
            </div>
          ))}

          {/* Botão adicionar */}
          {photos.length < maxPhotos && (
            <button onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 border-2 border-dashed transition-all duration-200"
              style={{ borderColor: "#1F1F23", background: "#111113" }}>
              {uploading
                ? <Loader2 size={20} style={{ color: "#3B82F6" }} className="animate-spin" />
                : <>
                  <Plus size={20} className="text-muted" />
                  <span className="text-[10px] text-muted">Adicionar</span>
                </>}
            </button>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload} className="hidden" />

        {/* Upgrade para Profissional */}
        {!isPaidPlan && (
          <div className="p-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <p className="font-syne font-bold text-sm text-white mb-1">Quer mais fotos?</p>
            <p className="text-xs mb-3" style={{ color: "#93c5fd" }}>
              Assine o Plano Profissional e adicione até 10 fotos.
            </p>
            <Link href="/painel/assinatura"
              className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
              Assinar Plano Profissional
            </Link>
          </div>
        )}

        {photos.length === 0 && (
          <div className="text-center py-8">
            <Camera size={32} className="text-muted mx-auto mb-2" />
            <p className="font-syne font-bold text-foreground mb-1">Nenhuma foto ainda</p>
            <p className="text-sm text-muted">Adicione fotos do seu trabalho para atrair mais clientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
