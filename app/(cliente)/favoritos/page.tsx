"use client";

import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

// Mock empty state + TODO: fetch from Supabase
const MOCK_FAVORITES: any[] = [];

export default function FavoritosPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div
        className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <h1 className="font-syne font-bold text-xl text-foreground">Favoritos</h1>
      </div>

      <div className="px-4 py-4">
        {MOCK_FAVORITES.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(239,68,68,0.1)" }}
            >
              <Heart size={28} style={{ color: "#ef4444" }} />
            </div>
            <h2 className="font-syne font-bold text-lg text-foreground mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
              Toque no coração nos perfis dos profissionais para salvar seus favoritos aqui.
            </p>
            <Link
              href="/servicos"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
                boxShadow: "0 0 16px rgba(59,130,246,0.3)",
              }}
            >
              Explorar serviços <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {/* TODO: render favorites */}
          </div>
        )}
      </div>
    </div>
  );
}
