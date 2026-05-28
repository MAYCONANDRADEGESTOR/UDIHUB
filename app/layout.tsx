import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import BottomNav from "@/app/components/layout/BottomNav";

export const metadata: Metadata = {
  title: {
    default: "UDIHUB — Encontre o profissional certo, perto de você",
    template: "%s | UDIHUB",
  },
  description:
    "Marketplace local de serviços para o Triângulo Mineiro. Encontre encanadores, eletricistas, pintores e muito mais perto de você.",
  keywords: ["serviços", "profissionais", "Uberlândia", "Triângulo Mineiro"],
  authors: [{ name: "UDIHUB" }],
  creator: "UDIHUB",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://udihub.com.br",
    siteName: "UDIHUB",
    title: "UDIHUB — Encontre o profissional certo, perto de você",
    description: "Marketplace local de serviços para o Triângulo Mineiro.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "UDIHUB" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UDIHUB",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-background text-foreground font-inter antialiased">
        {children}
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#111113",
              color: "#FAFAFA",
              border: "1px solid #1F1F23",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#3B82F6", secondary: "#FAFAFA" },
            },
          }}
        />
      </body>
    </html>
  );
}
