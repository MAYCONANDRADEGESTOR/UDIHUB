import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import BottomNav from "@/app/components/layout/BottomNav";

const GA_ID = "G-QK04EZWBTR";

export const metadata: Metadata = {
  title: {
    default: "UDIHUB — Encontre o profissional certo, perto de você",
    template: "%s | UDIHUB",
  },
  description: "UDIHUB é o marketplace de serviços locais do Triângulo Mineiro. Encontre encanadores, eletricistas, pintores, personal trainers e muito mais perto de você em Uberlândia, MG.",
  keywords: [
    "UDIHUB", "udihub", "marketplace serviços Uberlândia",
    "profissionais Uberlândia", "encanador Uberlândia",
    "eletricista Uberlândia", "pintor Uberlândia",
    "serviços locais Triângulo Mineiro", "profissionais Uberaba",
    "encontrar profissional MG",
  ],
  authors: [{ name: "UDIHUB", url: "https://udihub.com.br" }],
  creator: "UDIHUB",
  publisher: "UDIHUB",
  metadataBase: new URL("https://udihub.com.br"),
  alternates: { canonical: "https://udihub.com.br" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://udihub.com.br",
    siteName: "UDIHUB",
    title: "UDIHUB — Encontre o profissional certo, perto de você",
    description: "Marketplace de serviços locais do Triângulo Mineiro. Encontre profissionais em Uberlândia, MG.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "UDIHUB — Marketplace de serviços em Uberlândia MG" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UDIHUB — Profissionais perto de você",
    description: "Marketplace de serviços locais do Triângulo Mineiro.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "UDIHUB" },
  icons: { icon: "/logo.png", apple: "/logo.png", shortcut: "/logo.png" },
  verification: { google: "cA4wo2-DPRYakeEmQw3Lj_tAQLV2R0CJyJrQN5Z2TDk" },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "UDIHUB",
              "alternateName": "UDI HUB",
              "url": "https://udihub.com.br",
              "description": "Marketplace de serviços locais do Triângulo Mineiro",
              "potentialAction": {
                "@type": "SearchAction",
                "target": { "@type": "EntryPoint", "urlTemplate": "https://udihub.com.br/servicos/{search_term_string}" },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "UDIHUB",
              "url": "https://udihub.com.br",
              "logo": "https://udihub.com.br/logo.png",
              "description": "Marketplace de serviços locais do Triângulo Mineiro",
              "address": { "@type": "PostalAddress", "addressLocality": "Uberlândia", "addressRegion": "MG", "addressCountry": "BR" },
              "sameAs": ["https://www.instagram.com/udihub"]
            })
          }}
        />
      </head>
      <body className="font-sans bg-background text-foreground antialiased">

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

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
            success: { iconTheme: { primary: "#3B82F6", secondary: "#FAFAFA" } },
          }}
        />
      </body>
    </html>
  );
}
