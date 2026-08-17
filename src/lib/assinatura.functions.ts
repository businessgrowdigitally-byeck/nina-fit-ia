import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLANO } from "@/lib/plano";

export const getMeuPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, nome, email, status_assinatura, data_proxima_cobranca, asaas_subscription_id")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  });

export const criarCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { ensureCustomer, createSubscription, getSubscriptionCheckoutUrl } = await import(
      "@/lib/asaas.server"
    );

    const { data: perfil, error } = await context.supabase
      .from("profiles")
      .select("id, nome, email, asaas_customer_id, asaas_subscription_id")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    const email = perfil?.email ?? (context.claims as { email?: string })?.email;
    if (!email) throw new Error("Não encontramos seu e-mail. Faça login novamente.");

    const customerId = await ensureCustomer({
      existingId: perfil?.asaas_customer_id ?? null,
      nome: perfil?.nome || email.split("@")[0]!,
      email,
    });

    const subscription = await createSubscription({
      customerId,
      valor: PLANO.valor,
      descricao: PLANO.nome,
    });

    await context.supabase
      .from("profiles")
      .update({
        asaas_customer_id: customerId,
        asaas_subscription_id: subscription.id,
      })
      .eq("id", context.userId);

    const checkoutUrl = await getSubscriptionCheckoutUrl(subscription.id);
    if (!checkoutUrl) throw new Error("Não conseguimos gerar o link de pagamento. Tente de novo.");

    return { checkoutUrl };
  });