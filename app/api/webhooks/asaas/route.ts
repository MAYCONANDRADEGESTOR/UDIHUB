import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("asaas-access-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await request.json();
    const { event: eventType, subscription } = event;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (eventType === "PAYMENT_CONFIRMED" || eventType === "PAYMENT_RECEIVED") {
      if (subscription?.id) {
        const { data: sub } = await supabase.from("subscriptions").select("professional_id").eq("asaas_subscription_id", subscription.id).single();
        if (sub?.professional_id) {
          await supabase.from("professionals").update({ status: "active" }).eq("id", sub.professional_id);
          await supabase.from("subscriptions").update({ status: "active" }).eq("asaas_subscription_id", subscription.id);
        }
      }
    }

    if (eventType === "PAYMENT_OVERDUE" || eventType === "SUBSCRIPTION_DELETED") {
      if (subscription?.id) {
        const { data: sub } = await supabase.from("subscriptions").select("professional_id").eq("asaas_subscription_id", subscription.id).single();
        if (sub?.professional_id) {
          await supabase.from("professionals").update({ status: "inactive" }).eq("id", sub.professional_id);
          await supabase.from("subscriptions").update({ status: "inactive" }).eq("asaas_subscription_id", subscription.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Asaas Webhook Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
