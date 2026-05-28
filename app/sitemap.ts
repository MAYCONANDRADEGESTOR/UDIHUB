import { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://udihub.com.br";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/servicos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/seja-profissional`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/cadastro`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/termos`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacidade`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/servicos/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}
