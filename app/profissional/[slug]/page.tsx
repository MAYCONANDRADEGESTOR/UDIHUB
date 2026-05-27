"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, MessageCircle, Share2, Flag, CheckCircle, Heart, MapPin, X } from "lucide-react";
import { ProfileSkeleton } from "@/app/components/ui/Skeletons";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import type { Professional, Review } from "@/types";

const MOCK_PROF: Professional = {
  id: "1", user_id: "u1", slug: "joao-silva-encanador",
  bio: "Profissional com 15 anos de experiência em hidráulica residencial e comercial. Atendo emergências 24h. Serviço com garantia.",
  whatsapp: "34999991111", category_id: "encanador", status: "active", plan: "pro",
  featured: true, views_count: 342, avg_rating: 4.8, available_now: true,
  created_at: "2024-01-15T00:00:00Z",
  user: { id: "u1", name: "João Silva", email: "joao@email.com", role: "professional", banned: false, created_at: "2024-01-15T00:00:00Z", city: "Uberlândia" },
  neighborhoods: [
    { id: "n1", city_id: "c1", name: "Tibery", slug: "tibery" },
    { id: "n2", city_id: "c1", name: "Santa Mônica", slug: "santa-monica" },
  ],
};

const MOCK_REVIEWS: Review[] = [
  { id: "r1", professional_id: "1", client_id: "c1", rating: 5, comment: "Excelente profissional! Resolveu o problema rapidamente.", reply: "Obrigado pela confiança!", created_at: "2024-12-10T00:00:00Z", client: { id: "c1", name: "Maria Oliveira", email: "", role: "client", banned: false, created_at: "" } },
  { id: "r2", professional_id: "1", client_id: "c2", rating: 5, comment: "Chegou no horário combinado, trabalho limpo e garantido.", created_at: "2024-11-28T00:00:00Z", client: { id: "c2", name: "Pedro Costa", email: "", role: "client", banned: false, created_at: "" } },
  { id: "r3", professional_id: "1", client_id: "c3", rating: 4, comment: "Bom profissional, resolveu o problema.", created_at: "2024-11-15T00:00:00Z", client: { id: "c3", name: "Ana Ferreira", email: "", role: "client", banned: false, created_at: "" } },
];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size} fill={s <= rating ? "#FBBF24" : "transparent"} className={s <= rating ? "star-filled" : "star-empty"} />
      ))}
    </div>
  );
}

export default function ProfissionalPage() {
  const params = useParams();
  const router = useRouter();
  const [prof, setProf] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    setTimeout(() => { setProf(MOCK_PROF); setReviews(MOCK_REVIEWS); setLoading(false); }, 600);
  }, []);

  async function handleWhatsApp() {
    if (!prof) return;
    try { await fetch("/api/whatsapp-click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ professional_id: prof.id, city: "Uberlândia", neighborhood: prof.neighborhoods?.[0]?.name }) }); } catch {}
    window.open(buildWhatsAppUrl(prof.whatsapp, `Olá ${prof.user?.name}! Vi seu perfil no UDIHUB.`), "_blank");
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    setReportSent(true);
    setTimeout(() => { setShowReport(false); setReportSent(false); setReportReason(""); }, 2000);
  }

  if (loading) return <div className="min-h-screen bg-background pt-16 pb-32"><ProfileSkeleton /></div>;
  if (!prof) return <div className="flex items-center justify-center min-h-screen bg-background"><div className="text-center px-4"><p className="font-syne font-bold text-foreground text-lg">Profissional não encontrado</p><Link href="/servicos" className="text-sm mt-2 block" style={{color:"#3B82F6"}}>Ver serviços</Link></div></div>;

  const ratingDist = [5,4,3,2,1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length, pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0 }));

  return (
    <>
      <div className="min-h-screen bg-background pb-36">
        <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14" style={{background:"rgba(9,9,11,0.95)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1F1F23"}}>
          <button onClick={() => router.back()} className="text-muted"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
            <button onClick={() => setFavorited(!favorited)}><Heart size={20} fill={favorited ? "#ef4444" : "transparent"} className={favorited ? "text-red-500" : "text-muted"} /></button>
            <button onClick={() => setShowReport(true)} className="text-muted"><Flag size={18} /></button>
          </div>
        </div>

        <div className="px-4 py-6" style={{background:"linear-gradient(180deg,#0F172A 0%,#09090B 100%)"}}>
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl" style={{background:"linear-gradient(135deg,#1e3a5f,#1d4ed8)",color:"#93c5fd",boxShadow:"0 0 24px rgba(59,130,246,0.3)"}}>
                {getInitials(prof.user?.name || "?")}
              </div>
              {prof.available_now && <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{background:"rgba(34,197,94,0.2)",border:"1px solid rgba(34,197,94,0.5)",color:"#22c55e"}}><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Online</div>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-syne font-extrabold text-xl text-foreground">{prof.user?.name}</h1>
                {prof.plan === "pro" && <span className="badge-pro">PRO</span>}
              </div>
              <div className="flex items-center gap-2 mb-2"><StarRow rating={Math.round(prof.avg_rating)} /><span className="text-sm font-bold text-foreground">{prof.avg_rating.toFixed(1)}</span><span className="text-xs text-muted">({reviews.length} avaliações)</span></div>
              {prof.neighborhoods && prof.neighborhoods.length > 0 && <div className="flex items-center gap-1"><MapPin size={11} className="text-muted" /><span className="text-xs text-muted">{prof.neighborhoods.map((n) => n.name).join(", ")} · Uberlândia</span></div>}
            </div>
          </div>
        </div>

        {prof.bio && <div className="px-4 py-4" style={{borderBottom:"1px solid #1F1F23"}}><h2 className="font-syne font-bold text-sm text-foreground mb-2">Sobre</h2><p className="text-sm text-muted leading-relaxed">{prof.bio}</p></div>}

        <div className="px-4 py-4">
          <h2 className="font-syne font-bold text-sm text-foreground mb-4">Avaliações ({reviews.length})</h2>
          {reviews.length > 0 && (
            <div className="p-4 rounded-2xl mb-4" style={{background:"#111113",border:"1px solid #1F1F23"}}>
              <div className="flex items-center gap-4">
                <div className="text-center"><div className="font-syne font-extrabold text-3xl text-foreground">{prof.avg_rating.toFixed(1)}</div><StarRow rating={Math.round(prof.avg_rating)} size={12} /><div className="text-xs text-muted mt-1">{reviews.length} avaliações</div></div>
                <div className="flex-1 space-y-1">{ratingDist.map(({star,pct}) => (<div key={star} className="flex items-center gap-2"><span className="text-[10px] text-muted w-3">{star}</span><div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:"#1F1F23"}}><div className="h-full rounded-full" style={{width:`${pct}%`,background:star>=4?"#22c55e":star===3?"#FBBF24":"#ef4444"}} /></div><span className="text-[10px] text-muted w-6">{pct}%</span></div>))}</div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-2xl" style={{background:"#111113",border:"1px solid #1F1F23"}}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:"rgba(59,130,246,0.15)",color:"#93c5fd"}}>{getInitials(review.client?.name || "?")}</div>
                    <div><div className="text-xs font-semibold text-foreground">{review.client?.name}</div><StarRow rating={review.rating} size={10} /></div>
                  </div>
                  <span className="text-[10px] text-muted">{new Date(review.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">{review.comment}</p>
                {review.reply && <div className="mt-3 p-3 rounded-xl" style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.15)"}}><p className="text-[10px] font-bold mb-1" style={{color:"#3B82F6"}}>Resposta do profissional</p><p className="text-xs text-muted">{review.reply}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-8 z-50" style={{background:"rgba(9,9,11,0.98)",backdropFilter:"blur(20px)",borderTop:"1px solid #1F1F23"}}>
        <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base text-white" style={{background:"linear-gradient(135deg,#16a34a,#15803d)",boxShadow:"0 0 24px rgba(22,163,74,0.4)"}}>
          <MessageCircle size={20} />Chamar no WhatsApp
        </button>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" style={{background:"rgba(0,0,0,0.7)"}} onClick={(e) => e.target === e.currentTarget && setShowReport(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up" style={{background:"#111113",border:"1px solid #1F1F23"}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-foreground">Denunciar perfil</h3>
              <button onClick={() => setShowReport(false)} className="text-muted"><X size={18} /></button>
            </div>
            {reportSent ? (
              <div className="text-center py-6"><CheckCircle size={32} style={{color:"#22c55e"}} className="mx-auto mb-2" /><p className="font-semibold text-foreground">Denúncia enviada!</p></div>
            ) : (
              <form onSubmit={handleReport}>
                <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Descreva o motivo..." rows={4} required minLength={20} className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted mb-3" style={{background:"#09090B",border:"1px solid #1F1F23",outline:"none",resize:"none"}} />
                <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm text-white" style={{background:"#ef4444"}}>Enviar denúncia</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
