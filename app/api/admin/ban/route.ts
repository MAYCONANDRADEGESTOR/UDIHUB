import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId, action } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (action === "ban") {
      // Invalida todas as sessões do usuário banido — força logout imediato
      await supabase.auth.admin.signOut(userId, "others");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ban API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
