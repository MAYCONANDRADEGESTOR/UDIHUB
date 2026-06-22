"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function ServicosPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSlugs, setActiveSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadAdminData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") return;
      setIsAdmin(true);

      // Busca todos os slugs de categoria que têm pelo menos 1 profissional ativo
      const { data: cats } = await supabase
        .from("professionals")
        .select("categories(slug)")
        .eq("status", "active");

      if (cats) {
        const slugs = new Set<string>(
          cats.map((p: any) => p.categories?.slug).filter(Boolean)
        );
        setActiveSlugs(slugs);
      }
    }
    loadAdminData();
  }, []);

  const filtered = CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header com botão voltar */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>

        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <ArrowLeft size={18} className="text-muted" />
          </button>
          <h1 className="font-syne font-bold text-xl text-foreground flex-1">
            Categorias
          </h1>
          <span className="text-xs text-muted">{CATEGORIES.length} serviços</span>
        </div>

        {/* Busca */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}>
          <Search size={16} className="text-muted flex-shrink-0" />
          <input type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar serviço..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted outline-none" />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={14} className="text-muted" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {query ? (
          <>
            <p className="text-xs text-muted mb-4">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "{query}"
            </p>
            <div className="flex flex-col gap-2">
              {filtered.map((cat) => {
                const hasProf = isAdmin && activeSlugs.has(cat.slug);
                return (
                  <Link key={cat.slug} href={`/servicos/${cat.slug}`}
                    className="card-hover flex items-center gap-4 px-4 py-3 rounded-2xl"
                    style={{
                      background: "#111113",
                      border: hasProf
                        ? "1px solid #22c55e"
                        : "1px solid #1F1F23",
                      boxShadow: hasProf
                        ? "0 0 10px rgba(34,197,94,0.35)"
                        : "none",
                    }}>
                    <span className="text-2xl w-10 text-center">{cat.icon}</span>
                    <span className="font-medium text-sm text-foreground">{cat.name}</span>
                    {hasProf && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                        ✓
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#3B82F6" }}>
              TODAS AS CATEGORIAS
            </p>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const hasProf = isAdmin && activeSlugs.has(cat.slug);
                return (
                  <Link key={cat.slug} href={`/servicos/${cat.slug}`}
                    className="card-hover flex flex-col items-center gap-2 p-3 rounded-2xl text-center group"
                    style={{
                      background: "#111113",
                      border: hasProf
                        ? "1px solid #22c55e"
                        : "1px solid #1F1F23",
                      boxShadow: hasProf
                        ? "0 0 12px rgba(34,197,94,0.4)"
                        : "none",
                    }}>
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[10px] text-muted group-hover:text-foreground transition-colors leading-tight font-medium">
                      {cat.name.split("/")[0].trim()}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
