import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="relative z-10">
        {/* Número 404 */}
        <div className="font-syne font-black text-8xl mb-2"
          style={{ color: "#1F1F23", letterSpacing: "-4px" }}>
          404
        </div>

        <div className="text-5xl mb-6">🔍</div>

        <h1 className="font-syne font-extrabold text-2xl text-foreground mb-2">
          Página não encontrada
        </h1>
        <p className="text-sm text-muted mb-8 max-w-xs leading-relaxed mx-auto">
          A página que você está procurando não existe ou foi removida.
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link href="/inicio"
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
            <Home size={16} /> Ir para o início
          </Link>
          <Link href="/servicos"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: "#111113", border: "1px solid #1F1F23", color: "#A1A1AA" }}>
            Ver serviços disponíveis
          </Link>
        </div>
      </div>
    </div>
  );
}
