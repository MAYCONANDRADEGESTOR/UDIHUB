import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { professional_id, city, neighborhood } = body;

    if (!professional_id) {
      return NextResponse.json({ error: "Missing professional_id" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Register the WhatsApp click as a lead
    const { error } = await supabase.from("whatsapp_clicks").insert({
      professional_id,
      clicker_id: user?.id ?? null,
      city: city ?? null,
      neighborhood: neighborhood ?? null,
    });

    if (error) {
      console.error("Lead registration error:", error);
      return NextResponse.json({ error: "Failed to register lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
