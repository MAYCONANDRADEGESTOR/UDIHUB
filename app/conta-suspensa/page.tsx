import Link from "next/link";
import { ShieldX, Mail } from "lucide-react";

export default function ContaSuspensaPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
        <ShieldX size={36} style={{ color: "#ef4444" }} />
      </div>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>U</div>
        <span className="font-syne font-bold text-lg text-foreground">
          UDI<span style={{ color: "#3B82F6" }}>HUB</span>
        </span>
      </div>
      <h1 className="font-syne font-extrabold text-2xl text-foreground mb-3">Conta suspensa</h1>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-2">
        Sua conta foi suspensa por violar os Termos de Uso do UDIHUB.
      </p>
      <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
        Se você acredita que isso foi um erro, entre em contato com nosso suporte.
      </p>
      <a href="mailto:Udihub@outlook.com?subject=Revisão de suspensão de conta"
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white mb-4"
        style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}>
        <Mail size={16} />
        Contatar suporte
      </a>
      <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors duration-200">
        Voltar ao início
      </Link>
      <div className="mt-10 p-4 rounded-2xl max-w-xs text-left"
        style={{ background: "#111113", border: "1px solid rgba(239,68,68,0.2)" }}>
        <p className="text-xs font-bold mb-2" style={{ color: "#f87171" }}>Motivos comuns de suspensão:</p>
        <ul className="space-y-1">
          {["Número de WhatsApp inválido ou falso", "Avaliações fraudulentas", "Informações enganosas no perfil", "Múltiplas denúncias de usuários"].map((item) => (
            <li key={item} className="text-xs text-muted flex items-start gap-1.5">
              <span style={{ color: "#f87171" }}>•</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
