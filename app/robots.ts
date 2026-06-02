import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/painel",
          "/admin",
          "/inicio",
          "/favoritos",
          "/perfil",
          "/api",
        ],
      },
    ],
    sitemap: "https://udihub.com.br/sitemap.xml",
  };
}
