import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center pb-24"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}
    >
      {/* Glow blob */}
      <div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 relative z-10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}
        >
          U
        </div>
        <span className="font-syne font-bold text-xl text-foreground">
          UDI<span style={{ color: "#3B82F6" }}>HUB</span>
        </span>
      </div>

      {/* 404 */}
      <div className="relative z-10 mb-6">
        <div
          className="font-syne font-extrabold text-8xl leading-none"
          style={{
            background: "linear-gradient(135deg, #1F1F23, #2a2a35)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </div>
        <div
          className="absolute inset-0 font-syne font-extrabold text-8xl leading-none blur-sm opacity-30"
          style={{ color: "#3B82F6" }}
        >
          404
        </div>
      </div>

      <h1 className="font-syne font-bold text-xl text-foreground mb-2 relative z-10">
        Página não encontrada
      </h1>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-8 relative z-10">
        A página que você procura não existe ou foi removida.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs relative z-10">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
            boxShadow: "0 0 20px rgba(59,130,246,0.3)",
          }}
        >
          <Home size={16} />
          Ir para o início
        </Link>

        <Link
          href="/servicos"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
          style={{
            background: "#111113",
            border: "1px solid #1F1F23",
            color: "#A1A1AA",
          }}
        >
          <Search size={16} />
          Buscar serviços
        </Link>
      </div>
    </div>
  );
}
