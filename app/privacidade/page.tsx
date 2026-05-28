import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{ background: "rgba(9,9,11,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F23" }}
      >
        <Link href="/" className="text-muted"><ArrowLeft size={20} /></Link>
        <h1 className="font-syne font-bold text-lg text-foreground">Política de Privacidade</h1>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
        <p className="text-xs text-muted">Última atualização: maio de 2025</p>

        {[
          {
            title: "1. Quem somos",
            text: "O UDIHUB é uma plataforma digital de marketplace de serviços locais, operada para conectar clientes e profissionais autônomos no Triângulo Mineiro. Este documento explica como coletamos, usamos e protegemos seus dados pessoais.",
          },
          {
            title: "2. Dados que coletamos",
            text: "Coletamos: nome completo, endereço de email, número de telefone/WhatsApp, cidade e bairro, foto de perfil (opcional), dados de navegação e interação na plataforma, e dados de pagamento (processados pelo Asaas — não armazenamos dados de cartão).",
          },
          {
            title: "3. Como usamos seus dados",
            text: "Seus dados são usados para: criar e gerenciar sua conta, conectar clientes a profissionais, processar pagamentos de assinaturas, enviar notificações e emails transacionais, melhorar a experiência da plataforma e cumprir obrigações legais.",
          },
          {
            title: "4. Compartilhamento de dados",
            text: "Não vendemos seus dados. Compartilhamos apenas com: Supabase (banco de dados e autenticação), Asaas (processamento de pagamentos), Resend (envio de emails), Google (autenticação OAuth — apenas se você usar login com Google).",
          },
          {
            title: "5. Leads e WhatsApp",
            text: "Quando um cliente clica no botão de WhatsApp de um profissional, registramos a data, hora, cidade e bairro do contato. Essas informações são exibidas ao profissional como métricas de leads. Não compartilhamos o número do cliente com terceiros.",
          },
          {
            title: "6. Cookies e armazenamento local",
            text: "Utilizamos localStorage para salvar preferências de localização (cidade e bairro) e cookies de sessão para autenticação. Não utilizamos cookies de rastreamento ou publicidade.",
          },
          {
            title: "7. Segurança",
            text: "Seus dados são armazenados com criptografia no Supabase (infraestrutura AWS). Utilizamos Row Level Security (RLS) para garantir que cada usuário acesse apenas seus próprios dados. Senhas são hasheadas e nunca armazenadas em texto simples.",
          },
          {
            title: "8. Seus direitos (LGPD)",
            text: "Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a: acessar seus dados, corrigir informações incorretas, solicitar exclusão da conta e dos dados, portabilidade dos dados e revogar consentimento a qualquer momento.",
          },
          {
            title: "9. Retenção de dados",
            text: "Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, os dados são removidos em até 30 dias, exceto quando a retenção for exigida por lei.",
          },
          {
            title: "10. Menores de idade",
            text: "O UDIHUB não é destinado a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos um cadastro de menor de idade, a conta será removida imediatamente.",
          },
          {
            title: "11. Alterações nesta política",
            text: "Podemos atualizar esta política periodicamente. Notificaremos por email sobre mudanças significativas. O uso continuado da plataforma após as alterações implica aceitação da nova política.",
          },
          {
            title: "12. Contato e DPO",
            text: "Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato: Udihub@outlook.com. Respondemos em até 72 horas.",
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
