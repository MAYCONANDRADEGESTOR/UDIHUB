import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, MessageCircle } from "lucide-react";
import type { Professional } from "@/types";
import { getInitials } from "@/lib/utils";

interface ProfessionalCardProps {
  professional: Professional;
}

export default function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const { user, category, slug, avg_rating, plan, available_now, neighborhoods } = professional;

  const neighborhood = neighborhoods?.[0]?.name;

  return (
    <div
      className="card-hover rounded-2xl overflow-hidden"
      style={{ background: "#111113" }}
    >
      <Link href={`/profissional/${slug}`}>
        {/* Avatar area */}
        <div className="relative px-4 pt-4 pb-3">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden">
                  <Image
                    src={user.avatar}
                    alt={user?.name || ""}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center font-syne font-bold text-xl"
                  style={{
                    background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)",
                    color: "#93c5fd",
                  }}
                >
                  {getInitials(user?.name || "?")}
                </div>
              )}
              {available_now && (
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                  style={{
                    background: "#22c55e",
                    borderColor: "#111113",
                    boxShadow: "0 0 6px rgba(34,197,94,0.6)",
                  }}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-syne font-bold text-sm text-foreground truncate">
                    {user?.name}
                  </h3>
                  <p className="text-xs text-muted truncate">{category?.name}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {plan === "pro" && <span className="badge-pro">PRO</span>}
                  {available_now && <span className="badge-available">Disponível</span>}
                </div>
              </div>

              {/* Location */}
              {neighborhood && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={10} className="text-muted flex-shrink-0" />
                  <span className="text-xs text-muted truncate">{neighborhood}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: "1px solid #1F1F23" }}>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  fill={star <= Math.round(avg_rating) ? "#FBBF24" : "transparent"}
                  className={star <= Math.round(avg_rating) ? "star-filled" : "star-empty"}
                />
              ))}
              <span className="text-xs text-muted ml-1">
                {avg_rating > 0 ? avg_rating.toFixed(1) : "Novo"}
              </span>
            </div>

            <span
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "#3B82F6" }}
            >
              Ver perfil →
            </span>
          </div>
        </div>
      </Link>

      {/* WhatsApp button */}
      <div className="px-4 pb-4">
        <a
          href={`https://wa.me/55${professional.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-98"
          style={{
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            boxShadow: "0 0 12px rgba(22,163,74,0.3)",
          }}
        >
          <MessageCircle size={15} />
          Chamar no WhatsApp
        </a>
      </div>
    </div>
  );
}
