import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      .from("professionals").select("id, status").eq("user_id", user.id).single();

    if (!prof) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    const price = PLAN_PRICE[plan];
    const planName = PLAN_LABEL[plan];
    const cycle = PLAN_CYCLE[plan];
    const apiUrl = process.env.ASAAS_API_URL;
    const apiKey = process.env.ASAAS_API_KEY!;

    if (!apiUrl || !apiKey) {
      console.error("Asaas env vars missing");
      return NextResponse.json({ error: "Configuração de pagamento incompleta" }, { status: 500 });
    }

    // 1. Verifica se cliente já existe no Asaas (evita duplicatas)
    let customerId: string | null = null;
    try {
      const existingRes = await fetch(`${apiUrl}/customers?externalReference=${user.id}`, {
        headers: { "access_token": apiKey },
      });
      const existingData = await existingRes.json();
      if (existingData?.data?.[0]?.id) {
        customerId = existingData.data[0].id;
      }
    } catch {}

    // 2. Cria cliente se não existir
    if (!customerId) {
      const customerBody: Record<string, any> = {
        name: userData?.name || "Profissional",
        email: userData?.email,
        externalReference: user.id,
      };
      const cpfClean = userData?.cpf?.replace(/\D/g, "");
      if (cpfClean && cpfClean.length >= 11) customerBody.cpfCnpj = cpfClean;
      const phoneClean = userData?.phone?.replace(/\D/g, "");
      if (phoneClean) customerBody.mobilePhone = phoneClean;

      const customerRes = await fetch(`${apiUrl}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "access_token": apiKey },
        body: JSON.stringify(customerBody),
      });
      const customer = await customerRes.json();
      if (!customer.id) {
        const errMsg = customer.errors?.[0]?.description || JSON.stringify(customer);
        console.error("Asaas customer error:", errMsg);
        return NextResponse.json({ error: "Erro ao criar cliente Asaas", details: errMsg }, { status: 500 });
      }
      customerId = customer.id;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split("T")[0];

    // 3. Cria assinatura — apenas campos obrigatórios, sem posPayment nem callback
    const subRes = await fetch(`${apiUrl}/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "access_token": apiKey },
      body: JSON.stringify({
        customer: customerId,
        billingType: "UNDEFINED",
        cycle,
        value: price,
        nextDueDate: dueDate,
        description: `${planName} — Assinatura UDIHUB`,
      }),
    });
    const subscription = await subRes.json();

    if (!subscription.id) {
      const errMsg = subscription.errors?.[0]?.description || JSON.stringify(subscription);
      console.error("Asaas subscription error:", errMsg);
      return NextResponse.json({ error: "Erro ao criar assinatura", details: errMsg }, { status: 500 });
    }

    // 4. Busca a primeira cobrança gerada para obter a URL de pagamento
    await new Promise(r => setTimeout(r, 2000));
    const paymentsRes = await fetch(`${apiUrl}/payments?subscription=${subscription.id}&limit=1`, {
      headers: { "access_token": apiKey },
    });
    const paymentsData = await paymentsRes.json();
    const firstPayment = paymentsData?.data?.[0];
    const paymentUrl = firstPayment?.invoiceUrl || firstPayment?.bankSlipUrl || null;

    if (!paymentUrl) {
      console.error("Payment URL not found:", JSON.stringify(paymentsData));
    }

    // 5. Salva no banco
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
