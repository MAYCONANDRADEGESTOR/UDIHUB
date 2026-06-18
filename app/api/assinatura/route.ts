import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Preços reais do modelo Freemium. "pro" e "basic" mantidos como legado
// apenas como fallback de segurança — não devem ser atribuídos a ninguém.
const PLAN_PRICE: Record<string, number> = {
  professional: 59.90,
  professional_annual: 499.90,
  pro: 99,
  basic: 69,
};

const PLAN_CYCLE: Record<string, "MONTHLY" | "YEARLY"> = {
  professional: "MONTHLY",
  professional_annual: "YEARLY",
  pro: "MONTHLY",
  basic: "MONTHLY",
};

const PLAN_LABEL: Record<string, string> = {
  professional: "UDIHUB Profissional",
  professional_annual: "UDIHUB Profissional Anual",
  pro: "UDIHUB Pro (legado)",
  basic: "UDIHUB Básico (legado)",
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!PLAN_PRICE[plan]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData } = await supabase
      .from("users").select("name, email, phone, cpf").eq("id", user.id).single();

    const { data: prof } = await supabase
      .from("professionals")
      .select("id, status")
      .eq("user_id", user.id).single();

    if (!prof) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    const price = PLAN_PRICE[plan];
    const planName = PLAN_LABEL[plan];
    const cycle = PLAN_CYCLE[plan];
    const apiUrl = process.env.ASAAS_API_URL;
    const apiKey = process.env.ASAAS_API_KEY!;

    // 1. Cria cliente no Asaas
    const customerRes = await fetch(`${apiUrl}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "access_token": apiKey },
      body: JSON.stringify({
        name: userData?.name || "Profissional",
        email: userData?.email,
        cpfCnpj: userData?.cpf?.replace(/\D/g, "") || undefined,
        mobilePhone: userData?.phone?.replace(/\D/g, "") || undefined,
        externalReference: user.id,
      }),
    });
    const customer = await customerRes.json();
    if (!customer.id) {
      console.error("Asaas customer error:", JSON.stringify(customer));
      return NextResponse.json({ error: "Erro ao criar cliente", details: customer.errors?.[0]?.description || JSON.stringify(customer) }, { status: 500 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split("T")[0];

    // 2. Cria assinatura (mensal ou anual, conforme o plano) com URL de retorno
    const subRes = await fetch(`${apiUrl}/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "access_token": apiKey },
      body: JSON.stringify({
        customer: customer.id,
        billingType: "UNDEFINED",
        cycle,
        value: price,
        nextDueDate: dueDate,
        description: `${planName} — Assinatura UDIHUB`,
        externalReference: `${prof.id}|${plan}`,
        posPayment: {
          type: "FIXED",
          url: "https://udihub.com.br/painel/retorno",
        },
      }),
    });
    const subscription = await subRes.json();
    if (!subscription.id) {
      console.error("Asaas subscription error:", JSON.stringify(subscription));
      return NextResponse.json({ error: "Erro ao criar assinatura", details: subscription.errors?.[0]?.description || JSON.stringify(subscription) }, { status: 500 });
    }

    // 3. Busca a primeira cobrança gerada (tem a URL de pagamento)
    await new Promise(r => setTimeout(r, 1500));
    const paymentsRes = await fetch(`${apiUrl}/payments?subscription=${subscription.id}&limit=1`, {
      headers: { "access_token": apiKey },
    });
    const paymentsData = await paymentsRes.json();
    const firstPayment = paymentsData?.data?.[0];
    const paymentUrl = firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || subscription.url || null;

    // 4. Salva no banco
    await supabase.from("subscriptions").upsert({
      professional_id: prof.id,
      plan,
      status: "pending",
      asaas_subscription_id: subscription.id,
    }, { onConflict: "professional_id" });

    return NextResponse.json({
      paymentUrl,
      subscriptionId: subscription.id,
      paymentId: firstPayment?.id,
    });
  } catch (err) {
    console.error("Assinatura error:", err);
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: prof } = await supabase
      .from("professionals")
      .select("id, plan, status, unique_clients_limit, free_cycle_started_at")
      .eq("user_id", user.id).single();

    if (!prof) return NextResponse.json({ subscription: null });

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status, created_at, asaas_subscription_id, next_billing")
      .eq("professional_id", prof.id).single();

    return NextResponse.json({ subscription: sub, professional: prof });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 });
  }
}
