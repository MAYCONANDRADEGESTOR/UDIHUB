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

    // Verifica limite do plano Gratuito (cliente único / 30 dias) ANTES de logar o clique.
    // Função roda no banco via SECURITY DEFINER, então funciona mesmo com RLS ativo.
    const { data: checkResult, error: checkError } = await supabase.rpc(
      "check_and_register_unique_client",
      {
        p_professional_id: professional_id,
        p_clicker_id: user?.id ?? null,
      }
    );

    if (checkError) {
      console.error("Unique client check error:", checkError);
      // Falha na checagem não deve travar o profissional injustamente nem liberar
      // sem controle — registra o erro e segue permitindo o clique (fail-open),
      // já que o objetivo é não perder lead por bug de infraestrutura.
    }

    if (checkResult?.blocked) {
      return NextResponse.json(
        {
          error: "FREE_LIMIT_REACHED",
          message: "Você atingiu o limite gratuito de 5 clientes neste mês.",
          upgradeMessage: "Continue recebendo clientes ilimitados por apenas R$ 59,90/mês.",
          used: checkResult.used,
          limit: checkResult.limit,
        },
        { status: 403 }
      );
    }

    // Registra o lead (sempre — inclusive cliques repetidos do mesmo cliente já contado)
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

    // Busca dados do profissional para enviar email
    const { data: prof } = await supabase
      .from("professionals")
      .select("users(name, email)")
      .eq("id", professional_id)
      .single();

    if (prof?.users) {
      const { name, email } = prof.users as { name: string; email: string };
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_lead",
          to: email,
          name,
          data: { neighborhood: neighborhood || city || "Uberlândia" },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      isNewUniqueClient: checkResult?.is_new_unique_client ?? false,
      used: checkResult?.used ?? null,
      limit: checkResult?.limit ?? null,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
