import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  // Busca todos os profissionais ativos
  const { data: professionals } = await supabase
    .from('professionals')
    .select('slug, created_at')
    .eq('status', 'active')

  // URLs das categorias com -uberlandia
  const categoryUrls = [
    'acupuntura', 'adestrador', 'advogado', 'aluguel-equipamentos',
    'arquiteto', 'assistente-virtual', 'azulejista', 'baba',
    'banho-tosa', 'bartender', 'borracheiro', 'buffet',
    'cabeleireiro', 'calha-rufos', 'carregador', 'cerimonialista',
    'chaveiro', 'chaveiro-24h', 'churrasqueiro', 'confeitaria',
    'consultor-financeiro', 'contador', 'corretor-de-imoveis',
    'costureira', 'cozinheiro', 'criador-sites', 'cuidador-idosos',
    'decorador-festas', 'dedetizacao', 'dedetizacao-termitas',
    'dentista', 'desentupidor-esgoto', 'desentupidora',
    'desenvolvedor', 'designer-sobrancelhas', 'designer-grafico',
    'diarista', 'dj', 'editor-video', 'eletricista',
    'eletrodomesticos', 'encanador', 'enfermeiro', 'envelopamento',
    'esteticista', 'estofador', 'fisioterapeuta', 'fonoaudiologo',
    'fotografo', 'funilaria', 'gesseiro', 'guincho',
    'higienizacao-veiculos', 'hotel-pets', 'impermeabilizacao',
    'influenciador-digital', 'acessorios-automotivos',
    'instalador-antenas', 'cameras-cftv', 'energia-solar',
    'grades-telas', 'instalador-piso', 'som-automotivo',
    'artes-marciais', 'pilates', 'yoga', 'jardineiro',
    'lavador-veiculos', 'lavanderia', 'limpeza-caixa-dagua',
    'limpeza-sofa', 'locutor', 'manicure', 'maquiadora',
    'marceneiro', 'marido-aluguel', 'marmitaria', 'marmoraria',
    'martelinho-ouro', 'massagista', 'mecanico', 'mecanico-motos',
    'mestre-obras', 'micropigmentacao', 'montador-moveis',
    'motorista', 'mudanca-transporte', 'nutricionista',
    'nutricionista-esportivo', 'paisagista', 'pedreiro',
    'personal-stylist', 'personal-trainer', 'pet-sitter',
    'pintor', 'pintura-automotiva', 'pintura-fachada',
    'piscineiro', 'podologo', 'podologo-domiciliar',
    'portao-automatico', 'produtor-conteudo', 'professor-particular',
    'psicologo', 'rastreador-veicular', 'seguranca-particular',
    'serralheiro', 'social-media', 'soldador', 'tapecaria-automotiva',
    'tatuador', 'ar-condicionado', 'tecnico-celular',
    'tecnico-informatica', 'refrigeracao', 'tecnico-som',
    'tecnico-eletronico', 'telhador', 'terapeuta', 'tradutor',
    'veterinario', 'vidraceiro',
  ].map((slug) => ({
    url: `https://udihub.com.br/servicos/${slug}-uberlandia`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // URLs dos perfis de profissionais
  const professionalUrls = (professionals ?? []).map((pro) => ({
    url: `https://udihub.com.br/profissional/${pro.slug}`,
    lastModified: new Date(pro.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Páginas estáticas
  const staticUrls = [
    {
      url: 'https://udihub.com.br',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: 'https://udihub.com.br/servicos',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://udihub.com.br/seja-profissional',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://udihub.com.br/como-funciona',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  return [...staticUrls, ...categoryUrls, ...professionalUrls]
}
