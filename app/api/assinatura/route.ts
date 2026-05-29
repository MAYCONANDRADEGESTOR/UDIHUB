import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: userData } = await supabase
      .from("users").select("name, email").eq("id", user.id).single();

    const { data: prof } = await supabase
      .from("professionals").select("id").eq("user_id", user.id).single();

    if (!prof) return NextResponse.json({ error: "Professional not found" }, { status: 404 });

    const price = plan === "pro" ? 99 : 69;
    const planName = plan === "pro" ? "UDIHUB Pro" : "UDIHUB Básico";

    // Cria cliente no Asaas
    const customerRes = await fetch(`${process.env.ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        name: userData?.name || "Profissional",
        email: userData?.email,
        externalReference: user.id,
      }),
    });
    const customer = await customerRes.json();

    // Cria cobrança
    const chargeRes = await fetch(`${process.env.ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": process.env.ASAAS_API_KEY!,
      },
      body: JSON.stringify({
        customer: customer.id,
        billingType: "UNDEFINED",
        value: price,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: `${planName} - Assinatura mensal`,
        externalReference: `${prof.id}|${plan}`,
        postalService: false,
      }),
    });
    const charge = await chargeRes.json();

    // Salva assinatura pendente no banco
    await supabase.from("subscriptions").upsert({
      professional_id: prof.id,
      plan,
      status: "pending",
      asaas_payment_id: charge.id,
    }, { onConflict: "professional_id" });

    return NextResponse.json({
      paymentUrl: charge.invoiceUrl || charge.bankSlipUrl,
      paymentId: charge.id,
    });
  } catch (err) {
    console.error("Assinatura error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: prof } = await supabase
      .from("professionals")
      .select("id, plan, status")
      .eq("user_id", user.id).single();

    if (!prof) return NextResponse.json({ subscription: null });

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status, created_at, asaas_payment_id")
      .eq("professional_id", prof.id).single();

    return NextResponse.json({ subscription: sub, professional: prof });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
