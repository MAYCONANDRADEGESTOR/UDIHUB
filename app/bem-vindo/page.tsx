"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BemVindoPage() {
  const router = useRouter();
  const [dest, setDest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("users")
        .select("name, role")
        .eq("id", user.id)
        .single();

      setName(data?.name?.split(" ")[0] || null);

      if (data?.role === "admin") setDest("/admin");
      else if (data?.role === "professional") setDest("/painel");
      else setDest("/inicio");
    }
    load();
  }, []);

  async function handleContinuar() {
    setLoading(true);
    router.push(dest || "/inicio");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(135deg, #09090B 0%, #0F172A 100%)" }}>

      {/* Logo */}
      <div className="mb-6 animate-fade-in">
        <Image src="/logo.png" alt="UDIHUB" width={80} height={80}
          className="rounded-2xl object-cover mx-auto"
          style={{ boxShadow: "0 0 40px rgba(59,130,246,0.4)" }} />
      </div>

      {/* Texto */}
      <div className="mb-8 space-y-2">
        <h1 className="font-syne font-bold text-3xl text-foreground">
          Bem-vindo{name ? `, ${name}` : ""}! 🎉
        </h1>
        <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
          Sua conta foi criada com sucesso no UDIHUB.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-2"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
          <span className="text-xs font-bold" style={{ color: "#22c55e" }}>
            Conta ativa e pronta para usar
          </span>
        </div>
      </div>

      {/* Botão continuar */}
      <button onClick={handleContinuar} disabled={loading || !dest}
        className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white w-full max-w-xs"
        style={{
          background: "linear-gradient(135deg, #3B82F6, #1d4ed8)",
          boxShadow: "0 0 24px rgba(59,130,246,0.4)",
          opacity: (!dest || loading) ? 0.7 : 1,
        }}>
        {loading
          ? <><Loader2 size={18} className="animate-spin" /> Entrando...</>
          : <> Continuar <ArrowRight size={18} /></>}
      </button>

      <p className="text-xs text-muted mt-4">
        UDI<span style={{ color: "#3B82F6" }}>HUB</span> · Uberlândia, MG
      </p>
    </div>
  );
}
