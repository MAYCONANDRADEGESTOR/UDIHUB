import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@udihub.com.br";

export async function POST(request: NextRequest) {
  try {
    const { type, to, name, data } = await request.json();

    let subject = "";
    let html = "";

    if (type === "welcome") {
      subject = "Bem-vindo ao UDIHUB! 🎉";
      html = `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#FAFAFA;padding:32px;border-radius:16px;">
          <img src="https://udihub.com.br/logo.png" width="56" height="56" style="border-radius:12px;margin-bottom:20px;" />
          <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;">Bem-vindo, ${name}! 👋</h1>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Sua conta no UDIHUB foi criada com sucesso. Agora você pode encontrar profissionais de confiança no seu bairro em Uberlândia.
          </p>
          <a href="https://udihub.com.br/servicos" style="display:inline-block;background:linear-gradient(135deg,#3B82F6,#1d4ed8);color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
            Buscar profissionais →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px;">
            UDIHUB · Uberlândia, MG · <a href="https://udihub.com.br" style="color:#3B82F6;">udihub.com.br</a>
          </p>
        </div>
      `;
    }

    if (type === "professional_active") {
      subject = "Seu perfil está ativo no UDIHUB! ✅";
      html = `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#FAFAFA;padding:32px;border-radius:16px;">
          <img src="https://udihub.com.br/logo.png" width="56" height="56" style="border-radius:12px;margin-bottom:20px;" />
          <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;">Perfil ativo, ${name}! 🚀</h1>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Seu perfil profissional está ativo e aparecendo nas buscas. Clientes da sua região já podem te encontrar e entrar em contato pelo WhatsApp.
          </p>
          <a href="https://udihub.com.br/painel" style="display:inline-block;background:linear-gradient(135deg,#3B82F6,#1d4ed8);color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
            Acessar meu painel →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px;">
            UDIHUB · Uberlândia, MG · <a href="https://udihub.com.br" style="color:#3B82F6;">udihub.com.br</a>
          </p>
        </div>
      `;
    }

    if (type === "new_lead") {
      subject = `Novo cliente quer seu contato! 📱`;
      html = `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#FAFAFA;padding:32px;border-radius:16px;">
          <img src="https://udihub.com.br/logo.png" width="56" height="56" style="border-radius:12px;margin-bottom:20px;" />
          <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;">Novo lead, ${name}! 💬</h1>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 8px;">
            Um cliente clicou no seu WhatsApp agora mesmo.
          </p>
          ${data?.neighborhood ? `<p style="color:#3B82F6;font-size:14px;font-weight:600;margin:0 0 24px;">📍 Bairro: ${data.neighborhood}</p>` : ""}
          <a href="https://udihub.com.br/painel/leads" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
            Ver meus leads →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px;">
            UDIHUB · Uberlândia, MG · <a href="https://udihub.com.br" style="color:#3B82F6;">udihub.com.br</a>
          </p>
        </div>
      `;
    }

    if (type === "subscription_reminder") {
      subject = "Sua assinatura vence em breve ⚠️";
      html = `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#09090B;color:#FAFAFA;padding:32px;border-radius:16px;">
          <img src="https://udihub.com.br/logo.png" width="56" height="56" style="border-radius:12px;margin-bottom:20px;" />
          <h1 style="font-size:22px;font-weight:800;margin:0 0 8px;">Atenção, ${name}!</h1>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Sua assinatura do UDIHUB vence em <strong style="color:#FBBF24;">${data?.days || 3} dias</strong>. Renove para continuar aparecendo nas buscas e recebendo clientes.
          </p>
          <a href="https://udihub.com.br/painel/assinatura" style="display:inline-block;background:linear-gradient(135deg,#3B82F6,#1d4ed8);color:white;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
            Renovar assinatura →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px;">
            UDIHUB · Uberlândia, MG · <a href="https://udihub.com.br" style="color:#3B82F6;">udihub.com.br</a>
          </p>
        </div>
      `;
    }

    if (!subject) {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const { data: emailData, error } = await resend.emails.send({
      from: `UDIHUB <${FROM}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error]", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: emailData?.id });
  } catch (err) {
    console.error("[Email Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
