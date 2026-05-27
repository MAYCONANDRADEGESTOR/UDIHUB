"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, X, Upload, Loader2, ImageIcon } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

const MAX_PHOTOS_BASIC = 3;
const MAX_PHOTOS_PRO = 10;

export default function FotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [plan] = useState<"basic" | "pro">("pro");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxPhotos = plan === "pro" ? MAX_PHOTOS_PRO : MAX_PHOTOS_BASIC;
  const canAdd = photos.length < maxPhotos;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    // TODO: upload to Supabase Storage
    setTimeout(() => {
      const newPhotos: Photo[] = files.slice(0, maxPhotos - photos.length).map((f, i) => ({
        id: `temp-${Date.now()}-${i}`,
        url: URL.createObjectURL(f),
        order: photos.length + i,
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
      setUploading(false);
    }, 1500);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
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
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Fotos</h1>
        <span className="text-xs text-muted">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      <div className="px-4 py-4">
        {/* Plan limit info */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-4"
          style={{
            background: plan === "pro" ? "rgba(59,130,246,0.08)" : "rgba(161,161,170,0.08)",
            border: plan === "pro" ? "1px solid rgba(59,130,246,0.2)" : "1px solid #1F1F23",
          }}
        >
          <ImageIcon size={16} style={{ color: plan === "pro" ? "#3B82F6" : "#A1A1AA" }} />
          <p className="text-xs text-muted flex-1">
            Plano {plan === "pro" ? "Pro" : "Básico"}: até{" "}
            <strong className="text-foreground">{maxPhotos} fotos</strong>
          </p>
          {plan === "basic" && (
            <Link href="/painel/assinatura" className="text-xs font-bold" style={{ color: "#3B82F6" }}>
              Upgrade
            </Link>
          )}
        </div>

        {/* Photos grid */}
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={photo.url}
                alt=""
                fill
                className="object-cover"
              />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}

          {/* Add photo slot */}
          {canAdd && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "2px dashed rgba(59,130,246,0.3)",
              }}
            >
              {uploading ? (
                <Loader2 size={20} style={{ color: "#3B82F6" }} className="animate-spin" />
              ) : (
                <>
                  <Plus size={20} style={{ color: "#3B82F6" }} />
                  <span className="text-[10px] font-medium" style={{ color: "#3B82F6" }}>
                    Adicionar
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {photos.length > 0 && (
          <button
            className="w-full mt-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
              boxShadow: "0 0 16px rgba(59,130,246,0.3)",
            }}
          >
            Salvar fotos
          </button>
        )}

        {photos.length === 0 && !uploading && (
          <div className="text-center py-12">
            <ImageIcon size={36} className="text-muted mx-auto mb-3" />
            <p className="font-syne font-bold text-foreground mb-1">Adicione fotos do seu trabalho</p>
            <p className="text-sm text-muted mb-6">
              Perfis com fotos recebem até 3x mais contatos
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white mx-auto"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 16px rgba(59,130,246,0.3)",
              }}
            >
              <Upload size={16} />
              Escolher fotos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
