"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, MessageCircle, Copy, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  users: { name: string; avatar: string | null };
}

export default function PainelAvaliacoesPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [avgRating, setAvgRating] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: prof } = await supabase
        .from("professionals")
        .select("id, slug, avg_rating")
        .eq("user_id", user.id)
        .single();

      if (!prof) { router.push("/painel"); return; }

      setSlug(prof.slug);
      setAvgRating(prof.avg_rating || 0);

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, users(name, avatar)")
        .eq("professional_id", prof.id)
        .order("created_at", { ascending: false });

      setReviews((reviewsData as any) || []);
      setLoading(false);
    }
    load();
  }, []);

  async function copyLink() {
    const link = `https://udihub.com.br/profissional/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  }

  async function shareWhatsApp() {
    const link = `https://udihub.com.br/profissional/${slug}`;
    const text = `Olá! Veja meu perfil no UDIHUB e entre em contato comigo: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  const stars = [5, 4, 3, 2, 1];

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
        <h1 className="font-syne font-bold text-lg text-foreground flex-1">Avaliações</h1>
        {avgRating > 0 && (
          <div className="flex items-center gap-1">
            <Star size={14} fill="#FBBF24" className="star-filled" />
            <span className="text-sm font-bold text-foreground">{Number(avgRating).toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Pedir avaliações */}
        <div className="p-4 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #0F1729, #1e3a5f)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <p className="font-syne font-bold text-sm text-white mb-1">Peça avaliações aos seus clientes</p>
          <p className="text-xs mb-3" style={{ color: "#93c5fd" }}>
            Compartilhe o link do seu perfil após cada serviço. Clientes que clicaram no seu WhatsApp podem te avaliar.
          </p>
          <div className="flex gap-2">
            <button onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white"
              style={{ background: copied ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.2)", border: copied ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(59,130,246,0.4)" }}>
              {copied ? <Check size={13} style={{ color: "#22c55e" }} /> : <Copy size={13} />}
              <span style={{ color: copied ? "#22c55e" : "#93c5fd" }}>{copied ? "Copiado!" : "Copiar link"}</span>
            </button>
            <button onClick={shareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white"
              style={{ background: "rgba(22,163,74,0.2)", border: "1px solid rgba(22,163,74,0.4)", color: "#22c55e" }}>
              <MessageCircle size={13} />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Avaliações */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <Star size={32} className="text-muted mx-auto mb-3" />
            <p className="font-syne font-bold text-foreground mb-1">Nenhuma avaliação ainda</p>
            <p className="text-sm text-muted max-w-xs mx-auto leading-relaxed">
              Compartilhe seu perfil com clientes após cada serviço para receber avaliações.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: "#3B82F6" }}>
              {reviews.length} AVALIAÇÃO{reviews.length !== 1 ? "ÕES" : ""}
            </p>
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="flex items-start gap-3 mb-2">
                  {(review.users as any)?.avatar ? (
                    <img src={(review.users as any).avatar} alt=""
                      className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#93c5fd" }}>
                      {(review.users as any)?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">{(review.users as any)?.name}</p>
                      <p className="text-[10px] text-muted">
                        {new Date(review.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11}
                          fill={s <= review.rating ? "#FBBF24" : "transparent"}
                          className={s <= review.rating ? "star-filled" : "text-muted"} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-muted leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
