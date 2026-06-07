import { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { CATEGORIES } from "@/lib/constants";

const BASE_URL = "https://udihub.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/servicos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/seja-profissional`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/cadastro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/como-funciona`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/excluir-conta`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  // 107 categorias — geradas automaticamente do constants.ts
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/servicos/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  let professionalPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: professionals } = await supabase
      .from("professionals")
      .select("slug, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (professionals) {
      professionalPages = professionals.map((prof) => ({
        url: `${BASE_URL}/profissional/${prof.slug}`,
        lastModified: new Date(prof.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      }));
    }
  } catch {}

  return [...staticPages, ...categoryPages, ...professionalPages];
}
