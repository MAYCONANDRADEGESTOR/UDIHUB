import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { professionalId, plan } = await req.json();
    if (!professionalId || !plan) {
      return NextResponse.json({ error: "professionalId e plan são obrigatórios" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Mesmo cálculo do webhook do Asaas: mensal soma 1 mês, anual soma 1 ano.
    const nextBilling = new Date();
    if (plan === "professional_annual") {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    } else {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    }

    await supabase.from("professionals")
      .update({ status: "active", plan })
      .eq("id", professionalId);

    await supabase.from("subscriptions")
      .update({ status: "active", next_billing: nextBilling.toISOString() })
      .eq("professional_id", professionalId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirmar pagamento API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
