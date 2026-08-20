const DEFAULT_BASE_URL = "https://api.asaas.com/v3";

function baseUrl() {
  return process.env["ASAAS_BASE_URL"] || DEFAULT_BASE_URL;
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env["ASAAS_API_KEY"];
  if (!apiKey) throw new Error("Integração de pagamento não configurada.");

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("Asaas error", path, res.status, text);
    throw new Error(explicaErroAsaas(res.status));
  }
  return (text ? JSON.parse(text) : {}) as T;
}

// A causa real fica no log do servidor, que o usuário não vê. Traz o suficiente para a
// tela para dar de diagnosticar sem precisar abrir log — sem vazar chave nem corpo da resposta.
function explicaErroAsaas(status: number) {
  const ambiente = baseUrl().includes("sandbox") ? "sandbox" : "produção";
  if (status === 401 || status === 403) {
    return `O Asaas recusou a chave (${status}). Confira se a chave e a URL são do mesmo ambiente — a URL configurada é de ${ambiente}.`;
  }
  if (status >= 500) {
    return `O Asaas está fora do ar no momento (${status}). Tente de novo em alguns minutos.`;
  }
  return `O Asaas recusou a requisição (${status}).`;
}

type AsaasList<T> = { data: T[] };

export async function ensureCustomer(params: {
  existingId: string | null;
  nome: string;
  email: string;
}): Promise<string> {
  if (params.existingId) return params.existingId;

  const found = await asaasFetch<AsaasList<{ id: string }>>(
    `/customers?email=${encodeURIComponent(params.email)}`,
  );
  if (found.data?.length) return found.data[0]!.id;

  const created = await asaasFetch<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify({ name: params.nome, email: params.email }),
  });
  return created.id;
}

export async function createSubscription(params: {
  customerId: string;
  valor: number;
  descricao: string;
}) {
  const nextDueDate = new Date().toISOString().slice(0, 10);
  return asaasFetch<{ id: string; nextDueDate?: string }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "CREDIT_CARD",
      chargeType: "RECURRENT",
      cycle: "MONTHLY",
      value: params.valor,
      nextDueDate,
      description: params.descricao,
    }),
  });
}

export async function getSubscriptionCheckoutUrl(subscriptionId: string): Promise<string | null> {
  const payments = await asaasFetch<AsaasList<{ invoiceUrl?: string }>>(
    `/subscriptions/${subscriptionId}/payments`,
  );
  return payments.data?.find((p) => p.invoiceUrl)?.invoiceUrl ?? null;
}