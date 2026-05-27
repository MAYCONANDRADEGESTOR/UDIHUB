# UDIHUB 🔵
> Encontre o profissional certo, perto de você.

Marketplace local de serviços para o Triângulo Mineiro.

---

## 🚀 Setup — Passo a Passo

### 1. Clone e instale dependências

```bash
git clone https://github.com/SEU_USUARIO/udihub.git
cd udihub
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com seus dados:

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `ASAAS_API_KEY` | Asaas → Configurações → API |
| `RESEND_API_KEY` | resend.com → API Keys |

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e rode o arquivo `supabase-schema.sql`
3. Ative o **Google OAuth** em Authentication → Providers
4. Adicione a URL de redirect: `https://SEU_DOMINIO.com/auth/callback`

### 4. Rode localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### 5. Deploy no Vercel

1. Push para o GitHub
2. Importe no [vercel.com](https://vercel.com)
3. Adicione as variáveis de ambiente no painel do Vercel
4. Deploy automático a cada push na `main`

---

## 📁 Estrutura do Projeto

```
udihub/
├── app/
│   ├── (auth)/           # Login e cadastro
│   ├── (cliente)/        # Área do cliente logado
│   ├── (profissional)/   # Painel do profissional
│   ├── (admin)/          # Painel administrativo
│   ├── servicos/         # Catálogo público
│   ├── seja-profissional/
│   ├── components/
│   │   ├── layout/       # BottomNav, Header
│   │   ├── professional/ # ProfessionalCard
│   │   └── ui/           # Skeletons, botões
│   ├── globals.css
│   └── layout.tsx
├── lib/
│   ├── supabase/         # Client e server
│   ├── constants.ts      # Categorias, cidades, planos
│   └── utils.ts
├── types/
│   └── index.ts
├── public/
│   ├── manifest.json     # PWA
│   └── icons/
├── supabase-schema.sql   # Schema completo do banco
└── .env.example
```

---

## 🗓 Fases de Desenvolvimento

| Fase | Status | Descrição |
|------|--------|-----------|
| 1 | ✅ | Base Next.js + Supabase + Layout + PWA |
| 2 | 🔄 | Landing page + Catálogo iFood + Perfil público |
| 3 | ⏳ | Auth completa + Painel profissional |
| 4 | ⏳ | Avaliações + Favoritos + Denúncias |
| 5 | ⏳ | Admin completo |
| 6 | ⏳ | Asaas pagamentos |
| 7 | ⏳ | Emails + SEO + Lançamento |

---

## 💼 Planos

| Plano | Preço | Benefícios |
|-------|-------|-----------|
| Básico | R$69/mês | Perfil ativo, aparece nas buscas |
| Pro | R$99/mês | Aparece primeiro + Badge + 10 fotos |

---

## 🛠 Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel
- **Pagamentos**: Asaas (PIX + Cartão)
- **Emails**: Resend
- **Ícones**: Lucide React

---

## 📧 Contato

- Email: Udihub@outlook.com  
- Instagram: [@udihub](https://www.instagram.com/udihub)
