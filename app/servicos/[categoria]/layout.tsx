import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants";

interface Props {
  params: { categoria: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.slug === params.categoria);

  if (!category) {
    return {
      title: "Categoria não encontrada | UDIHUB",
      description: "Esta categoria não existe no UDIHUB.",
    };
  }

  const title = `${category.icon} ${category.name} em Uberlândia | UDIHUB`;
  const description = `Encontre profissionais de ${category.name} em Uberlândia. Compare perfis, avaliações e entre em contato direto pelo WhatsApp. Grátis no UDIHUB.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://udihub.com.br/servicos/${params.categoria}`,
      siteName: "UDIHUB",
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://udihub.com.br/servicos/${params.categoria}`,
    },
  };
}

export default function CategoriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
