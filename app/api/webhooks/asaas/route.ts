import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("asaas-access-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event, payment } = body;

    if (!payment?.externalReference) {
      return NextResponse.json({ ok: true });
    }

    const [professionalId, plan] = payment.externalReference.split("|");
    if (!professionalId) return NextResponse.json({ ok: true });

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      // Ativa o profissional
      await supabase.from("professionals")
        .update({ status: "active", plan: plan || "basic" })
        .eq("id", professionalId);

      // ✅ CORRIGIDO: asaas_subscription_id
      await supabase.from("subscriptions")
        .update({ status: "active", asaas_subscription_id: payment.subscription || payment.id })
        .eq("professional_id", professionalId);

      // Envia email de confirmação
      const { data: prof } = await supabase
        .from("professionals")
        .select("users(name, email)")
        .eq("id", professionalId)
        .single();

      if (prof?.users) {
        const { name, email } = prof.users as { name: string; email: string };
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "professional_active", to: email, name }),
        }).catch(() => {});
      }
    }

    if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_DELETED" || event === "SUBSCRIPTION_DELETED") {
      // Desativa o profissional quando não pagar
      await supabase.from("professionals")
        .update({ status: "inactive" })
        .eq("id", professionalId);

      await supabase.from("subscriptions")
        .update({ status: "inactive" })
        .eq("professional_id", professionalId);
    }

    if (event === "SUBSCRIPTION_RENEWED") {
      // Renova mensalmente
      await supabase.from("subscriptions")
        .update({ status: "active" })
        .eq("professional_id", professionalId);

      await supabase.from("professionals")
        .update({ status: "active" })
        .eq("id", professionalId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
