import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { podeAcessarChat } from "@/lib/plano";

export const listarMensagens = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const enviarMensagem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ mensagem: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { perguntarNina } = await import("@/lib/gptmaker.server");

    const { data: perfil } = await context.supabase
      .from("profiles")
      .select("status_assinatura")
      .eq("id", context.userId)
      .maybeSingle();

    if (!podeAcessarChat(perfil?.status_assinatura)) {
      throw new Error("Assine um plano para conversar com seu treinador");
    }

    const { data: historicoDb } = await context.supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const historico = (historicoDb ?? [])
      .slice()
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const { data: msgUsuario, error: erroInsert } = await context.supabase
      .from("chat_messages")
      .insert({ user_id: context.userId, role: "user", content: data.mensagem })
      .select("id, role, content, created_at")
      .single();

    if (erroInsert) throw new Error(erroInsert.message);

    const resposta = await perguntarNina({
      userId: context.userId,
      mensagem: data.mensagem,
      historico,
    });

    const { data: msgNina, error: erroResposta } = await context.supabase
      .from("chat_messages")
      .insert({ user_id: context.userId, role: "assistant", content: resposta })
      .select("id, role, content, created_at")
      .single();

    if (erroResposta) throw new Error(erroResposta.message);

    return { usuario: msgUsuario, nina: msgNina };
  });
