"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, MessageCircle, Flag, CheckCircle, Heart, MapPin, X, Loader2, Clock, Coffee, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProfileSkeleton } from "@/app/components/ui/Skeletons";
import { getInitials, buildWhatsAppUrl } from "@/lib/utils";
import toast from "react-hot-toast";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size} fill={s <= rating ? "#FBBF24" : "transparent"}
          className={s <= rating ? "star-filled" : "star-empty"} />
      ))}
    </div>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star size={28} fill={s <= value ? "#FBBF24" : "transparent"}
            className={s <= value ? "text-yellow-400" : "text-muted"} />
        </button>
      ))}
    </div>
  );
}

export default function ProfissionalPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [prof, setProf] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reportReviewModal, setReportReviewModal] = useState<string | null>(null);
  const [reportReviewReason, setReportReviewReason] = useState("");
  const [submittingReviewReport, setSubmittingReviewReport] = useState(false);
  const [isProfOwner, setIsProfOwner] = useState(false);
  const [extraCategories, setExtraCategories] = useState<any[]>([]);
  const [limitReachedModal, setLimitReachedModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
        setUserRole(userData?.role || null);
      }

      const { data: profData } = await supabase
        .from("professionals")
        .select(`id, slug, bio, whatsapp, avg_rating, available_now, plan, views_count, created_at, avatar, work_hours,
          users(name, city, avatar),
          categories(name, icon, slug),
          professional_neighborhoods(neighborhoods(name)),
          professional_photos(url, caption, order)`)
        .eq("slug", slug)
        .eq("status", "active")
        .single();

      if (!profData) { setLoading(false); return; }

      const { data: profCats } = await supabase
        .from("professional_categories")
        .select("categories(name, icon, slug), is_primary")
        .eq("professional_id", profData.id)
        .eq("is_primary", false);
      setExtraCategories(profCats || []);

      if (user) {
        const { data: ownProf } = await supabase.from("professionals")
          .select("id").eq("user_id", user.id).eq("id", profData.id).single();
        if (ownProf) setIsProfOwner(true);
      }

      const storageKey = `viewed_${profData.id}`;
      const alreadyViewed = sessionStorage.getItem(storageKey);
      if (!alreadyViewed) {
        if (user) {
          await supabase.from("profile_views").upsert(
            { professional_id: profData.id, viewer_id: user.id, viewer_ip: "" },
            { onConflict: "professional_id,viewer_id", ignoreDuplicates: true }
          );
        } else {
          await supabase.from("profile_views").insert({ professional_id: profData.id, viewer_ip: "" });
        }
        sessionStorage.setItem(storageKey, "1");
      }

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("id, rating, comment, reply, created_at, users(name)")
        .eq("professional_id", profData.id)
        .order("created_at", { ascending: false });

      if (user) {
        const { data: fav } = await supabase.from("favorites")
          .select("id").eq("user_id", user.id).eq("professional_id", profData.id).single();
        if (fav) { setFavorited(true); setFavoriteId(fav.id); }

        const { data: existingReview } = await supabase.from("reviews")
          .select("id").eq("professional_id", profData.id).eq("client_id", user.id).single();
        if (existingReview) setAlreadyReviewed(true);
      }

      setProf(profData);
      setReviews(reviewsData || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  async function handleWhatsApp() {
    if (!prof) return;
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const res = await fetch("/api/whatsapp-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professional_id: prof.id, city: prof.users?.city || "Uberlândia" }),
      });
      if (res.status === 403) {
        const data = await res.json().catch(() => null);
        if (data?.error === "FREE_LIMIT_REACHED") {
          setLimitReachedModal(true);
          return;
        }
      }
    } catch {
      // Falha de rede: não bloqueia o cliente, segue para o WhatsApp normalmente.
    }
    window.open(buildWhatsAppUrl(prof.whatsapp, `Olá ${prof.users?.name}! Vi seu perfil no UDIHUB.`), "_blank");
  }

  async function toggleFavorite() {
    if (!userId) { toast.error("Faça login para favoritar"); return; }
    const supabase = createClient();
    if (favorited && favoriteId) {
      await supabase.from("favorites").delete().eq("id", favoriteId);
      setFavorited(false); setFavoriteId(null);
      toast.success("Removido dos favoritos");
    } else {
      const { data } = await supabase.from("favorites")
        .insert({ user_id: userId, professional_id: prof.id }).select("id").single();
      setFavorited(true); setFavoriteId(data?.id || null);
      toast.success("Adicionado aos favoritos ❤️");
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { toast.error("Faça login para avaliar"); return; }
    if (reviewComment.trim().length < 10) { toast.error("Escreva pelo menos 10 caracteres"); return; }
    setSubmittingReview(true);
    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      professional_id: prof.id,
      client_id: userId,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    if (error) { toast.error("Erro ao enviar avaliação"); setSubmittingReview(false); return; }
    const { data: allReviews } = await supabase.from("reviews").select("rating").eq("professional_id", prof.id);
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length;
      await supabase.from("professionals").update({ avg_rating: avg }).eq("id", prof.id);
    }
    toast.success("Avaliação enviada! Obrigado 🙏");
    setAlreadyReviewed(true);
    setShowReview(false);
    setReviewComment("");
    setReviewRating(5);
    const { data: newReviews } = await supabase.from("reviews")
      .select("id, rating, comment, reply, created_at, users(name)")
      .eq("professional_id", prof.id).order("created_at", { ascending: false });
    setReviews(newReviews || []);
    setSubmittingReview(false);
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { toast.error("Faça login para denunciar"); return; }
    setSubmittingReport(true);
    const supabase = createClient();
    await supabase.from("reports").insert({ reporter_id: userId, professional_id: prof.id, reason: reportReason });
    setReportSent(true);
    setSubmittingReport(false);
    setTimeout(() => { setShowReport(false); setReportSent(false); setReportReason(""); }, 2000);
  }

  async function handleReviewReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReviewModal || !prof?.id) return;
    setSubmittingReviewReport(true);
    const supabase = createClient();
    await supabase.from("review_reports").insert({
      review_id: reportReviewModal,
      professional_id: prof.id,
      reason: reportReviewReason,
    });
    toast.success("Denúncia enviada! Analisaremos em breve.");
    setReportReviewModal(null);
    setReportReviewReason("");
    setSubmittingReviewReport(false);
  }

  if (loading) return <div className="min-h-screen bg-background pt-16 pb-32"><ProfileSkeleton /></div>;

  if (!prof) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <p className="font-syne font-bold text-foreground text-lg mb-2">Profissional não encontrado</p>
      <p className="text-sm text-muted mb-6">Este perfil pode não existir ou estar inativo.</p>
      <Link href="/servicos" className="px-6 py-3 rounded-xl font-bold text-sm text-white"
        style={{ background: "linear-gradient(135deg, #3B82F6, #1d4ed8)" }}>
        Ver serviços disponíveis
      </Link>
    </div>
  );

  const neighborhoods = prof.professional_neighborhoods?.map((pn: any) => pn.neighborhoods?.name).filter(Boolean) || [];
  const ratingDist = [5,4,3,2,1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }));
  const avatarUrl = prof.avatar || prof.users?.avatar || null;
  const workHours = prof.work_hours as Record<string, any> | null;
  const todayIndex = new Date().getDay();
  const todayKey = DAYS[todayIndex].toLowerCase();
  const todayHours = workHours?.[todayKey];
  const isPaidPlan = prof.plan === "professional" || prof.plan === "professional_annual" || prof.plan === "pro";
  const planBadgeLabel = prof.plan === "professional_annual" ? "ANUAL" : "PRO";

  return (
    <>
      <div className="min-h-screen bg-background pb-44">
        <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
          style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}>
          <button onClick={() => router.back()} className="text-muted"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3">
            <button onClick={toggleFavorite}>
              <Heart size={20} fill={favorited ? "#ef4444" : "transparent"} className={favorited ? "text-red-500" : "text-muted"} />
            </button>
            <button onClick={() => setShowReport(true)} className="text-muted"><Flag size={18} /></button>
          </div>
        </div>

        <div className="px-4 py-6" style={{ background: "linear-gradient(180deg,#0F172A 0%,#09090B 100%)" }}>
          <div className="flex items-start gap-4">

            {/* MUDANÇA 1 — Online badge abaixo da foto, não sobreposto */}
            <div className="flex flex-col items-center gap-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt={prof.users?.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                  style={{ boxShadow: "0 0 24px rgba(59,130,246,0.3)" }} />
              ) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-2xl"
                  style={{ background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", color: "#93c5fd", boxShadow: "0 0 24px rgba(59,130,246,0.3)" }}>
                  {getInitials(prof.users?.name || "?")}
                </div>
              )}
              {prof.available_now && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.5)", color: "#22c55e" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Online
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-syne font-extrabold text-xl text-foreground">{prof.users?.name}</h1>
                {isPaidPlan && <span className="badge-pro">{planBadgeLabel}</span>}
              </div>
              <p className="text-xs text-muted mb-1">{prof.categories?.icon} {prof.categories?.name}</p>
              {extraCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {extraCategories.map((pc: any) => (
                    <span key={pc.categories?.slug} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1F1F23", color: "#64748b" }}>
                      {pc.categories?.icon} {pc.categories?.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mb-1">
                <StarRow rating={Math.round(prof.avg_rating)} />
                <span className="text-sm font-bold text-foreground">{prof.avg_rating > 0 ? Number(prof.avg_rating).toFixed(1) : "Novo"}</span>
                <span className="text-xs text-muted">({reviews.length} avaliações)</span>
              </div>
              {neighborhoods.length > 0 && (
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-muted" />
                  <span className="text-xs text-muted">{neighborhoods.join(", ")} · {prof.users?.city || "Uberlândia"}</span>
                </div>
              )}
            </div>
          </div>

          {/* MUDANÇA 2 — Data completa de cadastro no lugar do ano */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Avaliação", value: prof.avg_rating > 0 ? Number(prof.avg_rating).toFixed(1) : "—", icon: "⭐" },
              { label: "Visualizações", value: prof.views_count || 0, icon: "👁" },
              { label: "Cadastrado", value: new Date(prof.created_at).toLocaleDateString("pt-BR"), icon: "📅" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="text-center p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1F1F23" }}>
                <div className="text-base mb-0.5">{icon}</div>
                <div className="font-syne font-bold text-sm text-foreground">{value}</div>
                <div className="text-[9px] text-muted">{label}</div>
              </div>
            ))}
          </div>

          {workHours && todayHours && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: todayHours.closed ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${todayHours.closed ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` }}>
              <Clock size={13} style={{ color: todayHours.closed ? "#f87171" : "#22c55e" }} />
              <span className="text-xs font-medium" style={{ color: todayHours.closed ? "#f87171" : "#22c55e" }}>
                {todayHours.closed ? "Fechado hoje" : `Hoje: ${todayHours.open} – ${todayHours.close}${todayHours.lunch ? ` · Almoço: ${todayHours.lunchStart}–${todayHours.lunchEnd}` : ""}`}
              </span>
              {todayHours.nocturnal && <Moon size={11} style={{ color: "#a855f7" }} />}
            </div>
          )}
        </div>

        {prof.bio && (
          <div className="px-4 py-4" style={{ borderBottom: "1px solid #1F1F23" }}>
            <h2 className="font-syne font-bold text-sm text-foreground mb-2">Sobre</h2>
            <p className="text-sm text-muted leading-relaxed">{prof.bio}</p>
          </div>
        )}

        {workHours && (
          <div className="px-4 py-4" style={{ borderBottom: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} style={{ color: "#3B82F6" }} />
              <h2 className="font-syne font-bold text-sm text-foreground">Horários de atendimento</h2>
            </div>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const key = day.toLowerCase();
                const h = workHours[key];
                const isToday = DAYS[todayIndex] === day;
                if (!h) return null;
                return (
                  <div key={day} className="py-1.5 px-3 rounded-lg"
                    style={{ background: isToday ? "rgba(59,130,246,0.08)" : "transparent", border: isToday ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium flex items-center gap-1.5"
                        style={{ color: isToday ? "#93c5fd" : "#64748b", minWidth: "36px" }}>
                        {h.nocturnal && <Moon size={9} style={{ color: "#a855f7" }} />}
                        {day}{isToday && <span className="ml-1 text-[9px]">(hoje)</span>}
                      </span>
                      {h.closed ? (
                        <span className="text-xs" style={{ color: "#ef4444" }}>Fechado</span>
                      ) : (
                        <span className="text-xs font-medium text-foreground">{h.open} – {h.close}</span>
                      )}
                    </div>
                    {!h.closed && h.lunch && h.lunchStart && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Coffee size={9} style={{ color: "#FBBF24" }} />
                        <span className="text-[10px]" style={{ color: "#64748b" }}>
                          Intervalo: {h.lunchStart} – {h.lunchEnd}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {neighborhoods.length > 0 && (
          <div className="px-4 py-4" style={{ borderBottom: "1px solid #1F1F23" }}>
            <h2 className="font-syne font-bold text-sm text-foreground mb-3">Bairros atendidos</h2>
            <div className="flex flex-wrap gap-2">
              {neighborhoods.map((n: string) => (
                <span key={n} className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
                  <MapPin size={9} className="inline mr-1" />{n}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-sm text-foreground">Avaliações ({reviews.length})</h2>
            {userId && !alreadyReviewed && !isProfOwner && (
              <button onClick={() => setShowReview(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}>
                <Star size={11} />Avaliar
              </button>
            )}
            {!userId && (
              <Link href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}>
                <Star size={11} />Avaliar
              </Link>
            )}
            {alreadyReviewed && (
              <span className="text-xs text-muted flex items-center gap-1">
                <CheckCircle size={11} style={{ color: "#22c55e" }} />Você já avaliou
              </span>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="p-4 rounded-2xl mb-4" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-syne font-extrabold text-3xl text-foreground">{Number(prof.avg_rating).toFixed(1)}</div>
                  <StarRow rating={Math.round(prof.avg_rating)} size={12} />
                  <div className="text-xs text-muted mt-1">{reviews.length} avaliações</div>
                </div>
                <div className="flex-1 space-y-1">
                  {ratingDist.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted w-3">{star}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1F1F23" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: star >= 4 ? "#22c55e" : star === 3 ? "#FBBF24" : "#ef4444" }} />
                      </div>
                      <span className="text-[10px] text-muted w-6">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 && (
            <div className="text-center py-8">
              <Star size={24} className="text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">Nenhuma avaliação ainda</p>
              {userId && !alreadyReviewed && !isProfOwner && (
                <button onClick={() => setShowReview(true)}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24" }}>
                  Seja o primeiro a avaliar ⭐
                </button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-4 rounded-2xl" style={{ background: "#111113", border: "1px solid #1F1F23" }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd" }}>
                      {getInitials(review.users?.name || "?")}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{review.users?.name}</div>
                      <StarRow rating={review.rating} size={10} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted">{new Date(review.created_at).toLocaleDateString("pt-BR")}</span>
                    {isProfOwner && (
                      <button onClick={() => setReportReviewModal(review.id)}
                        className="p-1 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.08)" }}>
                        <Flag size={11} style={{ color: "#f87171" }} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">{review.comment}</p>
                {review.reply && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: "#3B82F6" }}>Resposta do profissional</p>
                    <p className="text-xs text-muted">{review.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed WhatsApp */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pt-3 pb-3 z-50"
        style={{ background: "rgba(9,9,11,0.98)", backdropFilter: "blur(20px)", borderTop: "1px solid #1F1F23" }}>
        <button onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base text-white"
          style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 0 24px rgba(22,163,74,0.4)" }}>
          <MessageCircle size={20} />Chamar no WhatsApp
        </button>
      </div>

      {/* Modal avaliação */}
      {showReview && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setShowReview(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-foreground">Avaliar {prof.users?.name}</h3>
              <button onClick={() => setShowReview(false)} className="text-muted"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="flex justify-center mb-4">
                <StarSelector value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Conte como foi o serviço..." rows={4} required minLength={10}
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted mb-3"
                style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none", resize: "none" }} />
              <button type="submit" disabled={submittingReview}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#FBBF24,#f59e0b)", opacity: submittingReview ? 0.7 : 1 }}>
                {submittingReview && <Loader2 size={14} className="animate-spin" />}
                Enviar avaliação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal denúncia de avaliação */}
      {reportReviewModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setReportReviewModal(null)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-foreground">Denunciar avaliação</h3>
              <button onClick={() => setReportReviewModal(null)} className="text-muted"><X size={18} /></button>
            </div>
            <form onSubmit={handleReviewReport}>
              <div className="flex flex-col gap-2 mb-3">
                {["Avaliação falsa ou fraudulenta", "Conteúdo ofensivo ou inapropriado", "Não contratou meus serviços", "Outro motivo"].map((reason) => (
                  <button key={reason} type="button"
                    onClick={() => setReportReviewReason(reason)}
                    className="text-left px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: reportReviewReason === reason ? "rgba(239,68,68,0.1)" : "#09090B",
                      border: reportReviewReason === reason ? "1px solid rgba(239,68,68,0.3)" : "1px solid #1F1F23",
                      color: reportReviewReason === reason ? "#f87171" : "#A1A1AA",
                    }}>
                    {reason}
                  </button>
                ))}
              </div>
              <button type="submit"
                disabled={!reportReviewReason || submittingReviewReport}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: "#ef4444", opacity: (!reportReviewReason || submittingReviewReport) ? 0.5 : 1 }}>
                {submittingReviewReport && <Loader2 size={14} className="animate-spin" />}
                Enviar denúncia
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal denúncia do perfil */}
      {showReport && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setShowReport(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-5 animate-slide-up"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-syne font-bold text-foreground">Denunciar perfil</h3>
              <button onClick={() => setShowReport(false)} className="text-muted"><X size={18} /></button>
            </div>
            {reportSent ? (
              <div className="text-center py-6">
                <CheckCircle size={32} style={{ color: "#22c55e" }} className="mx-auto mb-2" />
                <p className="font-semibold text-foreground">Denúncia enviada!</p>
                <p className="text-xs text-muted mt-1">Nossa equipe irá analisar em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleReport}>
                <textarea value={reportReason} onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Descreva o motivo da denúncia..." rows={4} required minLength={20}
                  className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder-muted mb-3"
                  style={{ background: "#09090B", border: "1px solid #1F1F23", outline: "none", resize: "none" }} />
                <button type="submit" disabled={submittingReport}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: "#ef4444" }}>
                  {submittingReport && <Loader2 size={14} className="animate-spin" />}
                  Enviar denúncia
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal limite atingido */}
      {limitReachedModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setLimitReachedModal(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 animate-slide-up text-center"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setLimitReachedModal(false)} className="text-muted"><X size={18} /></button>
            </div>
            <Clock size={32} style={{ color: "#FBBF24" }} className="mx-auto mb-3" />
            <h3 className="font-syne font-bold text-foreground text-lg mb-2">
              Este profissional está indisponível para novos contatos
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Este profissional atingiu o limite de novos contatos neste mês. Tente novamente em breve ou veja outros profissionais disponíveis na mesma categoria.
            </p>
            <button onClick={() => router.push(`/servicos/${prof.categories?.slug || ""}`)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg,#3B82F6,#1d4ed8)" }}>
              Ver outros profissionais
            </button>
          </div>
        </div>
      )}

      {/* Modal login para WhatsApp */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setShowLoginPrompt(false)}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 animate-slide-up text-center"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowLoginPrompt(false)} className="text-muted"><X size={18} /></button>
            </div>
            <MessageCircle size={32} style={{ color: "#22c55e" }} className="mx-auto mb-3" />
            <h3 className="font-syne font-bold text-foreground text-lg mb-2">
              Entre para conversar no WhatsApp
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-5">
              Para contatar {prof.users?.name}, faça login ou crie uma conta gratuita. Leva menos de 1 minuto.
            </p>
            <div className="flex flex-col gap-2">
              <Link href={`/login?redirect=/profissional/${slug}`}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg,#3B82F6,#1d4ed8)" }}>
                Entrar
              </Link>
              <Link href={`/cadastro?redirect=/profissional/${slug}`}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1F1F23", color: "#A1A1AA" }}>
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
