"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

interface MyReview {
  id: string;
  rating: number;
  comment: string;
  reply?: string;
  created_at: string;
  professionals: {
    slug: string;
    users: { name: string };
    categories: { name: string; icon: string };
  };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12}
          fill={s <= rating ? "#FBBF24" : "transparent"}
          className={s <= rating ? "star-filled" : "star-empty"} />
      ))}
    </div>
  );
}

export default function AvaliacoesPage() {
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("reviews")
        .select(`id, rating, comment, reply, created_at,
          professionals(slug, users(name), categories(name, icon))`)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setReviews((data as any) || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
        <h1 className="font-syne font-bold text-xl text-foreground">Minhas avaliações</h1>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(251,191,36,0.1)" }}>
              <Star size={28} style={{ color: "#FBBF24" }} />
            </div>
            <h2 className="font-syne font-bold text-lg text-foreground mb-2">
              Nenhuma avaliação ainda
            </h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
              Após contratar um profissional pelo WhatsApp, você pode avaliar o serviço.
            </p>
            <Link href="/servicos"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.3)" }}>
              Buscar profissionais <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted mb-2">{reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""} enviada{reviews.length !== 1 ? "s" : ""}</p>
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-2xl"
                style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                {/* Professional info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", color: "#93c5fd" }}>
                      {getInitials((review.professionals as any)?.users?.name || "?")}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {(review.professionals as any)?.users?.name}
                      </p>
                      <p className="text-xs text-muted">
                        {(review.professionals as any)?.categories?.icon}{" "}
                        {(review.professionals as any)?.categories?.name}
                      </p>
                    </div>
                  </div>
                  <Link href={`/profissional/${(review.professionals as any)?.slug}`}
                    className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
                    Ver perfil →
                  </Link>
                </div>

                {/* Rating & comment */}
                <div className="flex items-center gap-2 mb-2">
                  <StarRow rating={review.rating} />
                  <span className="text-[10px] text-muted">
                    {new Date(review.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{review.comment}</p>

                {/* Reply */}
                {review.reply && (
                  <div className="mt-3 p-3 rounded-xl"
                    style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <div className="flex items-center gap-1 mb-1">
                      <MessageCircle size={10} style={{ color: "#3B82F6" }} />
                      <p className="text-[10px] font-bold" style={{ color: "#3B82F6" }}>
                        Resposta do profissional
                      </p>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{review.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
