import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}
      >
        <Link href="/" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground">Termos de Uso</h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        <p className="text-xs text-muted">Última atualização: junho de 2026</p>

        {[
          {
            title: "1. Sobre o UDIHUB",
            text: "O UDIHUB é uma plataforma de marketplace local de serviços que conecta clientes a profissionais autônomos na região do Triângulo Mineiro. Não somos prestadores de serviço — atuamos como intermediário digital entre as partes.",
          },
          {
            title: "2. Cadastro e Conta",
            text: "Para utilizar recursos completos da plataforma, é necessário criar uma conta com informações verídicas. O usuário é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta.",
          },
          {
            title: "3. Para Clientes",
            text: "O uso da plataforma é totalmente gratuito para clientes. Ao entrar em contato com um profissional, o cliente assume a responsabilidade pela contratação e pelo acordo de valores, prazos e condições diretamente com o profissional.",
          },
          {
            title: "4. Para Profissionais",
            text: "O cadastro de profissionais é gratuito (Plano Gratuito), permitindo a criação de perfil e aparição nas buscas. Profissionais que desejarem destaque e clientes ilimitados podem assinar o Plano Profissional (R$59,90/mês) ou o Plano Profissional Anual (R$499,90/ano). O pagamento é processado pelo Asaas via PIX ou cartão de crédito. O perfil pago é desativado automaticamente em caso de inadimplência, voltando ao Plano Gratuito.",
          },
          {
            title: "5. Responsabilidades",
            text: "O UDIHUB não se responsabiliza pela qualidade dos serviços prestados, acordos financeiros, danos ou prejuízos decorrentes da relação entre clientes e profissionais. Cada profissional é autônomo e responsável pelo seu próprio trabalho.",
          },
          {
            title: "6. Conteúdo Proibido",
            text: "É proibido publicar informações falsas, números de WhatsApp inválidos, avaliações fraudulentas ou qualquer conteúdo que viole a legislação brasileira. Perfis que violem estas regras serão banidos sem aviso prévio.",
          },
          {
            title: "7. Avaliações",
            text: "Apenas clientes que entraram em contato via WhatsApp com um profissional podem avaliá-lo. As avaliações devem ser honestas e baseadas em experiências reais. Avaliações fraudulentas resultarão em banimento.",
          },
          {
            title: "8. Cancelamento",
            text: "Profissionais podem cancelar sua assinatura paga a qualquer momento pelo painel. O perfil pago permanece ativo até o fim do período pago, voltando então ao Plano Gratuito. Clientes podem excluir sua conta a qualquer momento pelo perfil.",
          },
          {
            title: "9. Privacidade",
            text: "O tratamento de dados pessoais é realizado conforme nossa Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
          },
          {
            title: "10. Alterações",
            text: "O UDIHUB reserva o direito de alterar estes termos a qualquer momento. Alterações significativas serão comunicadas por email. O uso continuado da plataforma após as alterações implica aceitação dos novos termos.",
          },
          {
            title: "11. Contato",
            text: "Para dúvidas sobre estes termos, entre em contato pelo email: Udihub@outlook.com",
          },
        ].map(({ title, text }) => (
          <div key={title}>
            <h2 className="font-syne font-bold text-sm text-foreground mb-2">{title}</h2>
            <p className="text-sm text-muted leading-relaxed">{text}</p>
          </div>
        ))}

        <div
          className="p-4 rounded-2xl mt-6"
          style={{ background: "#111113", border: "1px solid #1F1F23" }}
        >
          <p className="text-xs text-muted text-center">
            UDIHUB · Uberlândia, MG ·{" "}
            <a href="mailto:Udihub@outlook.com" style={{ color: "#3B82F6" }}>
              Udihub@outlook.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
