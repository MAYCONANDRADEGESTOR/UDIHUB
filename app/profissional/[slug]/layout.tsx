import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();

  const { data: prof } = await supabase
    .from("professionals")
    .select("bio, users(name), categories(name, icon), professional_neighborhoods(neighborhoods(name))")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!prof) {
    return {
      title: "Profissional não encontrado | UDIHUB",
      description: "Este perfil não existe ou está inativo.",
    };
  }

  const name = (prof.users as any)?.name || "Profissional";
  const category = (prof.categories as any)?.name || "Serviços";
  const icon = (prof.categories as any)?.icon || "";
  const neighborhood = (prof.professional_neighborhoods as any)?.[0]?.neighborhoods?.name;
  const location = neighborhood ? `${neighborhood}, Uberlândia` : "Uberlândia";
  const description = prof.bio
    ? `${prof.bio.slice(0, 120)}...`
    : `${name} é ${category} em ${location}. Encontre profissionais de confiança no UDIHUB.`;

  return {
    title: `${name} — ${icon} ${category} em ${location} | UDIHUB`,
    description,
    openGraph: {
      title: `${name} — ${category} em ${location}`,
      description,
      url: `https://udihub.com.br/profissional/${params.slug}`,
      siteName: "UDIHUB",
      locale: "pt_BR",
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${name} — ${category} | UDIHUB`,
      description,
    },
    alternates: {
      canonical: `https://udihub.com.br/profissional/${params.slug}`,
    },
  };
}

export default function ProfissionalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
