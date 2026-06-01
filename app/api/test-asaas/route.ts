import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.ASAAS_API_URL;
  const apiKey = process.env.ASAAS_API_KEY;

  const diagnostico: any = {
    url_configurada: apiUrl || "AUSENTE",
    key_existe: !!apiKey,
    key_formato: apiKey ? apiKey.substring(0, 6) + "..." : "AUSENTE",
    key_comeca_com_aact: apiKey?.startsWith("$aact_") || false,
  };

  if (!apiUrl || !apiKey) {
    return NextResponse.json({ erro: "Variaveis ausentes", diagnostico });
  }

  try {
    const res = await fetch(`${apiUrl}/customers?limit=1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access_token": apiKey,
      },
    });
    const data = await res.json();
    diagnostico.status_http = res.status;
    diagnostico.resposta_asaas = data;
    return NextResponse.json({ ok: res.ok, diagnostico });
  } catch (err) {
    diagnostico.erro_conexao = String(err);
    return NextResponse.json({ erro: "Falha na conexao", diagnostico });
  }
}
