import Link from "next/link";
import Image from "next/image";
import { ShieldX, Mail, ArrowLeft } from "lucide-react";

export default function BanidoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>

      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="UDIHUB" width={56} height={56}
          className="rounded-2xl object-cover"
          style={{ boxShadow: "0 0 24px rgba(139,92,246,0.3)" }} />
      </div>

      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
        <ShieldX size={36} style={{ color: "#f87171" }} />
      </div>

      <h1 className="font-syne font-bold text-2xl text-foreground mb-3">
        Acesso bloqueado
      </h1>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
        Sua conta foi suspensa por violação dos termos de uso do UDIHUB.
        Se acredita que foi um engano, entre em contato com nosso suporte.
      </p>

      <a href="mailto:udihub@outlook.com"
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white mb-4"
        style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
        <Mail size={16} />
        Falar com suporte
      </a>

      <Link href="/" className="flex items-center gap-1.5 text-xs text-muted">
        <ArrowLeft size={13} />
        Voltar ao início
      </Link>
    </div>
  );
}
