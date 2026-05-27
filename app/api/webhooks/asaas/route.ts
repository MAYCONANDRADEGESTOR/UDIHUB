import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase admin client (service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token
    const token = request.headers.get("asaas-access-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await request.json();
    const { event: eventType, payment, subscription } = event;

    console.log("[Asaas Webhook]", eventType, subscription?.id);

    switch (eventType) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Activate subscription
        if (subscription?.id) {
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              next_billing: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            })
            .eq("asaas_subscription_id", subscription.id);

          // Also activate professional profile
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("professional_id")
            .eq("asaas_subscription_id", subscription.id)
            .single();

          if (sub?.professional_id) {
            await supabase
              .from("professionals")
              .update({ status: "active" })
              .eq("id", sub.professional_id);
          }
        }
        break;
      }

      case "PAYMENT_OVERDUE":
      case "SUBSCRIPTION_DELETED": {
        // Inactivate subscription
        if (subscription?.id) {
          await supabase
            .from("subscriptions")
            .update({ status: "inactive" })
            .eq("asaas_subscription_id", subscription.id);

          const { data: sub } = await supabase
            .from("subscriptions")
            .select("professional_id")
            .eq("asaas_subscription_id", subscription.id)
            .single();

          if (sub?.professional_id) {
            await supabase
              .from("professionals")
              .update({ status: "inactive" })
              .eq("id", sub.professional_id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Asaas Webhook Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
