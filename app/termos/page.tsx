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
            title: "1. Sobre a UDIHUB",
            text: "A UDIHUB é uma plataforma digital de intermediação que conecta clientes a profissionais autônomos prestadores de serviços na região do Triângulo Mineiro. A UDIHUB não presta, executa, supervisiona, fiscaliza ou se responsabiliza pela execução de nenhum serviço anunciado na plataforma. Atuamos exclusivamente como canal de divulgação e aproximação entre as partes, de forma semelhante a um classificado digital, sem participação na transação comercial entre cliente e profissional.",
          },
          {
            title: "2. Natureza da Relação e Ausência de Verificação",
            text: "Os profissionais cadastrados na UDIHUB são prestadores de serviço autônomos e independentes, não sendo empregados, prepostos, representantes, sócios, parceiros comerciais ou mandatários da UDIHUB sob nenhuma hipótese. A UDIHUB NÃO realiza verificação de antecedentes criminais, NÃO confirma registros profissionais, certificações, diplomas, licenças, seguros ou qualificações técnicas de nenhum profissional cadastrado, e NÃO garante a idoneidade, capacidade técnica, honestidade, segurança ou conduta de qualquer profissional. Cabe exclusivamente ao cliente realizar sua própria avaliação, pesquisa e diligência antes de contratar qualquer serviço, especialmente em categorias que envolvam acesso à residência, cuidado de pessoas, crianças, idosos ou animais.",
          },
          {
            title: "3. Selo \"Profissional Verificado\"",
            text: "O selo \"Profissional Verificado\" ou \"PRO\" exibido em alguns perfis indica exclusivamente que o profissional mantém uma assinatura paga ativa na plataforma. Este selo NÃO representa, implica ou sugere qualquer verificação de antecedentes, qualificação técnica, registro profissional, idoneidade ou capacidade do profissional. Trata-se de um indicador comercial de assinatura, não um atestado de qualidade, segurança ou confiabilidade.",
          },
          {
            title: "4. Cadastro e Conta",
            text: "Para utilizar recursos completos da plataforma, é necessário criar uma conta com informações verídicas. O usuário é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta. A UDIHUB pode suspender ou excluir contas que forneçam informações falsas, a seu exclusivo critério.",
          },
          {
            title: "5. Para Clientes",
            text: "O uso da plataforma é totalmente gratuito para clientes. O cliente é o único responsável por avaliar, selecionar e contratar o profissional de sua escolha, bem como por negociar valores, prazos, condições e formas de pagamento diretamente com o profissional, fora da plataforma. Qualquer dano, prejuízo, vício do serviço, atraso, descumprimento contratual, furto, ou conduta inadequada por parte do profissional é de responsabilidade exclusiva do profissional contratado, não cabendo à UDIHUB nenhuma responsabilidade civil, criminal ou administrativa decorrente dessa relação.",
          },
          {
            title: "6. Para Profissionais",
            text: "O cadastro de profissionais é gratuito (Plano Gratuito), permitindo a criação de perfil e aparição nas buscas. Profissionais que desejarem destaque e clientes ilimitados podem assinar o Plano Profissional (R$59,90/mês) ou o Plano Profissional Anual (R$499,90/ano). O pagamento é processado pelo Asaas via PIX ou cartão de crédito. O perfil pago é desativado automaticamente em caso de inadimplência, voltando ao Plano Gratuito. O profissional declara, sob as penas da lei, ser prestador de serviço autônomo, sendo o único responsável por seus tributos, obrigações trabalhistas de eventuais auxiliares, registros profissionais exigidos por lei e pela qualidade, segurança e legalidade dos serviços que presta.",
          },
          {
            title: "7. Limitação de Responsabilidade",
            text: "A UDIHUB atua exclusivamente como intermediária tecnológica e não integra, participa ou interfere na relação contratual formada entre cliente e profissional. A UDIHUB não se responsabiliza, em nenhuma hipótese, por: (a) qualidade, segurança, legalidade ou adequação dos serviços prestados pelos profissionais; (b) danos materiais, morais, corporais ou de qualquer outra natureza decorrentes da relação entre cliente e profissional; (c) descumprimento de acordos, atrasos, cancelamentos ou condutas dos profissionais; (d) veracidade das informações, fotos, avaliações ou descrições publicadas pelos profissionais em seus perfis. Caso, ainda assim, a UDIHUB venha a ser responsabilizada judicialmente por ato de terceiro usuário da plataforma, fica desde já estabelecido o direito de regresso integral contra o responsável direto pelo dano, conforme cláusula de indenização abaixo. Em qualquer hipótese de responsabilização reconhecida judicialmente, o valor de eventual indenização devida pela UDIHUB fica limitado ao total efetivamente recebido por ela do usuário responsável pelo fato gerador nos 12 (doze) meses anteriores ao evento.",
          },
          {
            title: "8. Indenização",
            text: "O profissional e o cliente concordam em indenizar e manter a UDIHUB indene de qualquer reclamação, processo judicial ou administrativo, multa, condenação, custo ou despesa (incluindo honorários advocatícios) decorrente de: (a) sua própria conduta na execução ou contratação do serviço; (b) violação destes termos; (c) violação de direitos de terceiros; (d) informações falsas ou imprecisas fornecidas à plataforma.",
          },
          {
            title: "9. Conteúdo Proibido",
            text: "É proibido publicar informações falsas, números de WhatsApp inválidos, avaliações fraudulentas ou qualquer conteúdo que viole a legislação brasileira. Perfis que violem estas regras serão banidos sem aviso prévio.",
          },
          {
            title: "10. Avaliações",
            text: "As avaliações publicadas na plataforma refletem exclusivamente a opinião pessoal do cliente que as escreveu, com base em sua experiência individual, e não constituem verificação, aval ou endosso da UDIHUB sobre sua veracidade. Apenas clientes que entraram em contato via WhatsApp com um profissional podem avaliá-lo. Avaliações fraudulentas resultarão em remoção e banimento.",
          },
          {
            title: "11. Denúncias e Moderação",
            text: "A UDIHUB disponibiliza um canal de denúncias para relatos de conduta inadequada, conteúdo falso ou violação destes termos. A análise de denúncias é feita em caráter de melhor esforço, sem prazo ou resultado garantido. A UDIHUB se reserva o direito de remover perfis, conteúdos ou suspender contas a seu exclusivo critério, sem que isso configure reconhecimento de responsabilidade por fatos ocorridos antes, durante ou após qualquer denúncia.",
          },
          {
            title: "12. Cancelamento",
            text: "Profissionais podem cancelar sua assinatura paga a qualquer momento pelo painel. O perfil pago permanece ativo até o fim do período pago, voltando então ao Plano Gratuito. Clientes podem excluir sua conta a qualquer momento pelo perfil.",
          },
          {
            title: "13. Privacidade",
            text: "O tratamento de dados pessoais é realizado conforme nossa Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
          },
          {
            title: "14. Alterações",
            text: "A UDIHUB reserva o direito de alterar estes termos a qualquer momento. Alterações significativas serão comunicadas por email. O uso continuado da plataforma após as alterações implica aceitação dos novos termos.",
          },
          {
            title: "15. Legislação Aplicável e Foro",
            text: "Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Uberlândia, Minas Gerais, para dirimir quaisquer controvérsias decorrentes destes termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
          },
          {
            title: "16. Contato",
            text: "Para dúvidas sobre estes termos, entre em contato pelo email: udihub@outlook.com",
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
            <a href="mailto:udihub@outlook.com" style={{ color: "#3B82F6" }}>
              udihub@outlook.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
