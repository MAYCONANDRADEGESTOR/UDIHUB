export const PLANS = {
  free: {
    name: "Gratuito",
    price: 0,
    annual: false,
    features: [
      "Perfil ativo nas buscas",
      "Até 3 fotos no perfil",
      "Até 5 clientes únicos por mês",
      "Recebe leads via WhatsApp",
    ],
  },
  professional: {
    name: "Profissional",
    price: 59.90,
    annual: false,
    features: [
      "Clientes ilimitados",
      "Aparece antes dos perfis gratuitos",
      "Até 15 fotos na galeria",
      "Selo Verificado",
      "Painel de métricas avançado",
      "Suporte prioritário",
    ],
  },
  professional_annual: {
    name: "Profissional Anual",
    price: 499.90,
    annual: true,
    features: [
      "Tudo do plano Profissional",
      "Equivalente a R$41,66/mês",
      "Destaque Premium na categoria",
      "Selo Parceiro UdiHub",
    ],
  },
  // Legados — mantidos apenas para não quebrar profissionais antigos
  // que ainda não foram migrados ao modelo novo. Não devem ser atribuídos
  // a ninguém a partir de agora.
  basic: {
    name: "Básico (legado)",
    price: 69,
    annual: false,
    features: ["Perfil ativo e visível", "Aparece nas buscas", "Até 3 fotos", "Recebe leads via WhatsApp"],
  },
  pro: {
    name: "Pro (legado)",
    price: 99,
    annual: false,
    features: ["Aparece primeiro nas buscas", "Badge Pro em destaque", "Até 10 fotos na galeria"],
  },
};
