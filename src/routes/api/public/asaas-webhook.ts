import { createFileRoute } from "@tanstack/react-router";

type AsaasEvent = {
  event?: string;
  payment?: {
    customer?: string;
    subscription?: string;
    dueDate?: string;
    nextDueDate?: string;
  };
  subscription?: {
    id?: string;
    customer?: string;
    nextDueDate?: string;
  };
};

const ATIVOS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
const CANCELADOS = ["SUBSCRIPTION_DELETED", "SUBSCRIPTION_INACTIVATED", "PAYMENT_REFUNDED"];

export const Route = createFileRoute("/api/public/asaas-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["STRIPE_WEBHOOK_SECRET"];
        const received = request.headers.get("asaas-access-token");
        if (!expected || received !== expected) {
          return new Response("unauthorized", { status: 401 });
        }

        let body: AsaasEvent;
        try {
          body = (await request.json()) as AsaasEvent;
        } catch {
          return new Response("ok", { status: 200 });
        }

        const evento = body.event ?? "";
        const customerId = body.payment?.customer ?? body.subscription?.customer ?? null;
        const subscriptionId = body.payment?.subscription ?? body.subscription?.id ?? null;

        let novoStatus: string | null = null;
        if (ATIVOS.includes(evento)) novoStatus = "ativo";
        else if (CANCELADOS.includes(evento)) novoStatus = "cancelado";
        else if (evento === "PAYMENT_OVERDUE") novoStatus = "atrasado";

        if (!novoStatus || (!customerId && !subscriptionId)) {
          return new Response("ok", { status: 200 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const update: { status_assinatura: string; data_proxima_cobranca?: string } = {
            status_assinatura: novoStatus,
          };

          if (novoStatus === "ativo") {
            const proxima =
              body.subscription?.nextDueDate ??
              body.payment?.nextDueDate ??
              proximaCobrancaPadrao(body.payment?.dueDate);
            if (proxima) update.data_proxima_cobranca = proxima;
          }

          const query = supabaseAdmin.from("profiles").update(update);
          const { error } = subscriptionId
            ? await query.eq("asaas_subscription_id", subscriptionId)
            : await query.eq("asaas_customer_id", customerId!);

          if (error) console.error("Falha ao atualizar perfil via webhook", error.message);
        } catch (err) {
          console.error("Erro no webhook Asaas", err);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

function proximaCobrancaPadrao(dueDate?: string) {
  const base = dueDate ? new Date(dueDate) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  base.setMonth(base.getMonth() + 1);
  return base.toISOString().slice(0, 10);
}