// Camada de integração com a API do GPT Maker (somente servidor).
// Configure os segredos GPTMAKER_API_URL e GPTMAKER_API_KEY para ativar.

export type HistoricoItem = { role: "user" | "assistant"; content: string };

export function integracaoConfigurada() {
  return Boolean(process.env["GPTMAKER_API_URL"] && process.env["GPTMAKER_API_KEY"]);
}

function extrairResposta(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, any>;
  const candidatos = [
    p["message"],
    p["answer"],
    p["response"],
    p["content"],
    p["text"],
    p["data"]?.message,
    p["data"]?.answer,
    p["data"]?.content,
    p["choices"]?.[0]?.message?.content,
  ];
  const achado = candidatos.find((c) => typeof c === "string" && c.trim().length > 0);
  return achado ?? null;
}

export async function perguntarNina(params: {
  userId: string;
  mensagem: string;
  historico: HistoricoItem[];
}): Promise<string> {
  const url = process.env["GPTMAKER_API_URL"];
  const apiKey = process.env["GPTMAKER_API_KEY"];

  if (!url || !apiKey) {
    throw new Error(
      "A Nina ainda não está conectada. Configure a integração de IA para começar a conversar.",
    );
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        message: params.mensagem,
        sessionId: params.userId,
        messages: params.historico,
      }),
    });
  } catch (err) {
    console.error("GPT Maker network error", err);
    throw new Error("Não consegui falar com a Nina agora. Tenta de novo em instantes.");
  }

  const texto = await res.text();
  if (!res.ok) {
    console.error("GPT Maker error", res.status, texto);
    throw new Error("A Nina teve um probleminha para responder. Tenta de novo?");
  }

  let payload: unknown = texto;
  try {
    payload = JSON.parse(texto);
  } catch {
    // resposta em texto puro
  }

  const resposta = extrairResposta(payload);
  if (!resposta) {
    console.error("GPT Maker resposta inesperada", texto.slice(0, 500));
    throw new Error("Não entendi a resposta da Nina. Tenta mandar de novo?");
  }
  return resposta;
}
