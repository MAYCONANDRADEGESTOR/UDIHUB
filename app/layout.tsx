import type { Metadata, Viewport } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import BottomNav from "@/app/components/layout/BottomNav";

const GA_ID = "G-QK04EZWBTR";
const PIXEL_ID = "4151514745140497";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

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
  verification: {
    google: "cA4wo2-DPRYakeEmQw3Lj_tAQLV2R0CJyJrQN5Z2TDk",
    other: { "facebook-domain-verification": ["x5ydkkdr196fme54z8d7l0u9e9p64q"] },
  },
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
    <html lang="pt-BR" className={`dark ${syne.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "UDIHUB",
              "url": "https://udihub.com.br",
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
              "address": { "@type": "PostalAddress", "addressLocality": "Uberlândia", "addressRegion": "MG", "addressCountry": "BR" },
              "sameAs": ["https://www.instagram.com/udihub"]
            })
          }}
        />
      </head>
      <body className="font-sans bg-background text-foreground antialiased">

        {/* Google Analytics */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
            alt="" />
        </noscript>

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
