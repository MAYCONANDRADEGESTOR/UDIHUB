"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, X, Camera, MapPin, FileText, Star, Image } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  action: string;
  href: string;
  icon: any;
  color: string;
}

interface Props {
  hasAvatar: boolean;
  hasBio: boolean;
  hasNeighborhood: boolean;
  hasPhotosGallery: boolean;
  avgRating: number;
}

export default function NotificationBell({
  hasAvatar,
  hasBio,
  hasNeighborhood,
  hasPhotosGallery,
  avgRating,
}: Props) {
  const [open, setOpen] = useState(false);

  const notifications: Notification[] = [];

  if (!hasAvatar) {
    notifications.push({
      id: "no_photo",
      title: "Adicione uma foto de perfil!",
      message: "Perfis com foto recebem 3x mais contatos. Clientes confiam mais em quem tem foto.",
      action: "Adicionar foto",
      href: "/painel/perfil",
      icon: Camera,
      color: "#f59e0b",
    });
  }

  if (!hasBio) {
    notifications.push({
      id: "no_bio",
      title: "Complete sua bio",
      message: "Conte sobre seus servicos e experiencia. Uma bio completa aumenta sua conversao.",
      action: "Completar bio",
      href: "/painel/perfil",
      icon: FileText,
      color: "#3B82F6",
    });
  }

  if (!hasNeighborhood) {
    notifications.push({
      id: "no_neighborhood",
      title: "Adicione seus bairros",
      message: "Clientes buscam por bairro! Adicione onde voce atende para aparecer mais nas buscas.",
      action: "Adicionar bairros",
      href: "/painel/perfil",
      icon: MapPin,
      color: "#a855f7",
    });
  }

  if (!hasPhotosGallery) {
    notifications.push({
      id: "no_photos",
      title: "Adicione fotos do seu trabalho",
      message: "Mostre exemplos do seu trabalho! Fotos aumentam a confianca dos clientes.",
      action: "Adicionar fotos",
      href: "/painel/fotos",
      icon: Image,
      color: "#22c55e",
    });
  }

  if (avgRating === 0) {
    notifications.push({
      id: "no_rating",
      title: "Peca avaliacoes aos clientes",
      message: "Avaliacoes aumentam sua credibilidade. Peca para seus clientes avaliarem voce no UDIHUB.",
      action: "Ver meu perfil",
      href: "/painel",
      icon: Star,
      color: "#FBBF24",
    });
  }

  const count = notifications.length;
  if (count === 0) return null;

  return (
    <div className="relative">
      {/* Botão sino */}
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl"
        style={{ background: "#111113", border: "1px solid #1F1F23" }}>
        <Bell size={16} className="text-muted" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse"
          style={{ background: "#ef4444" }}>
          {count}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
            style={{ background: "#111113", border: "1px solid #1F1F23" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid #1F1F23" }}>
              <div>
                <p className="font-syne font-bold text-sm text-foreground">Notificacoes</p>
                <p className="text-[10px] text-muted">{count} dica{count !== 1 ? "s" : ""} para melhorar seu perfil</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted p-1">
                <X size={14} />
              </button>
            </div>

            {/* Lista */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif, i) => {
                const Icon = notif.icon;
                return (
                  <div key={notif.id} className="p-4"
                    style={{ borderBottom: i < notifications.length - 1 ? "1px solid #1F1F23" : "none" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${notif.color}18` }}>
                        <Icon size={14} style={{ color: notif.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-foreground mb-0.5">{notif.title}</p>
                        <p className="text-[11px] text-muted leading-relaxed mb-2">{notif.message}</p>
                        <Link href={notif.href} onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                          style={{ background: `${notif.color}18`, color: notif.color }}>
                          {notif.action} →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 text-center"
              style={{ borderTop: "1px solid #1F1F23", background: "rgba(0,0,0,0.2)" }}>
              <Link href="/painel/perfil" onClick={() => setOpen(false)}
                className="text-xs font-semibold"
                style={{ color: "#3B82F6" }}>
                Completar perfil agora →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
