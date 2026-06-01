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
      // Calcula próximo vencimento: 1 mês após a data de vencimento do pagamento atual
      const dueDate = payment.dueDate ? new Date(payment.dueDate) : new Date();
      const nextBilling = new Date(dueDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      // Ativa o profissional
      await supabase.from("professionals")
        .update({ status: "active", plan: plan || "basic" })
        .eq("id", professionalId);

      // Atualiza assinatura com próximo vencimento
      await supabase.from("subscriptions")
        .update({
          status: "active",
          asaas_subscription_id: payment.subscription || payment.id,
          next_billing: nextBilling.toISOString(),
        })
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

    if (event === "PAYMENT_OVERDUE") {
      // Desativa o profissional quando não pagar no vencimento
      await supabase.from("professionals")
        .update({ status: "inactive" })
        .eq("id", professionalId);

      await supabase.from("subscriptions")
        .update({ status: "inactive" })
        .eq("professional_id", professionalId);
    }

    if (event === "PAYMENT_DELETED" || event === "SUBSCRIPTION_DELETED") {
      await supabase.from("professionals")
        .update({ status: "inactive" })
        .eq("id", professionalId);

      await supabase.from("subscriptions")
        .update({ status: "inactive", next_billing: null })
        .eq("professional_id", professionalId);
    }

    if (event === "SUBSCRIPTION_RENEWED") {
      // Renovação mensal — atualiza próximo vencimento
      const dueDate = payment?.dueDate ? new Date(payment.dueDate) : new Date();
      const nextBilling = new Date(dueDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      await supabase.from("subscriptions")
        .update({ status: "active", next_billing: nextBilling.toISOString() })
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
