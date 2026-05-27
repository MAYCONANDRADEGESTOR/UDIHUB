"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export default function ServicosPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "rgba(9,9,11,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #1F1F23",
        }}
      >
        <h1 className="font-syne font-bold text-xl text-foreground mb-3">
          Serviços
        </h1>

        {/* Search */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          <Search size={16} className="text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar serviço..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={14} className="text-muted" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Category grid - iFood style */}
        {query ? (
          <>
            <p className="text-xs text-muted mb-4">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "{query}"
            </p>
            <div className="flex flex-col gap-2">
              {filtered.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/servicos/${cat.slug}`}
                  className="card-hover flex items-center gap-4 px-4 py-3 rounded-2xl"
                  style={{ background: "#111113" }}
                >
                  <span className="text-2xl w-10 text-center">{cat.icon}</span>
                  <span className="font-medium text-sm text-foreground">{cat.name}</span>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#3B82F6" }}>
              TODAS AS CATEGORIAS
            </p>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/servicos/${cat.slug}`}
                  className="card-hover flex flex-col items-center gap-2 p-3 rounded-2xl text-center group"
                  style={{ background: "#111113" }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] text-muted group-hover:text-foreground transition-colors leading-tight font-medium">
                    {cat.name.split("/")[0].trim()}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
