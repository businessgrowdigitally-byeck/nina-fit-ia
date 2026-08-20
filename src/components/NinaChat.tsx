import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import { enviarMensagem, listarMensagens } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Mensagem = { id: string; role: string; content: string; created_at: string };

export function NinaChat({ liberado }: { liberado: boolean }) {
  const queryClient = useQueryClient();
  const fetchMensagens = useServerFn(listarMensagens);
  const enviar = useServerFn(enviarMensagem);
  const [texto, setTexto] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  const { data: mensagens = [], isPending } = useQuery({
    queryKey: ["chat-mensagens"],
    queryFn: () => fetchMensagens() as Promise<Mensagem[]>,
  });

  const mutation = useMutation({
    mutationFn: (mensagem: string) => enviar({ data: { mensagem } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat-mensagens"] }),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Não deu certo agora. Tenta de novo."),
  });

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length, mutation.isPending]);

  function submeter() {
    const valor = texto.trim();
    if (!valor || mutation.isPending || !liberado) return;
    setTexto("");
    mutation.mutate(valor);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {isPending ? (
          <p className="text-center text-sm text-muted-foreground">Carregando sua conversa...</p>
        ) : mensagens.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl bg-card p-6 text-center shadow-card">
            <p className="font-bold">Oi! Eu sou a Nina 💚</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Me conta sua rotina, seu objetivo e o que você gosta de comer. Eu monto sua dieta e
              seu treino do jeito que cabe no seu dia.
            </p>
          </div>
        ) : (
          mensagens.map((m) => <Bolha key={m.id} role={m.role} content={m.content} />)
        )}

        {mutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Nina está digitando...
          </div>
        )}
        <div ref={fimRef} />
      </div>

      <div className="border-t border-border bg-card p-3">
        {liberado ? (
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submeter();
                }
              }}
              placeholder="Escreva pra Nina..."
              rows={1}
              className="max-h-32 min-h-11 resize-none rounded-2xl"
            />
            <Button
              size="icon"
              variant="hero"
              className="size-11 shrink-0 rounded-2xl"
              onClick={submeter}
              disabled={mutation.isPending || !texto.trim()}
              aria-label="Enviar mensagem"
            >
              <Send className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">
            <Lock className="size-4" />
            Assine um plano para conversar com seu treinador
          </div>
        )}
      </div>
    </div>
  );
}

function Bolha({ role, content }: { role: string; content: string }) {
  const daNina = role === "assistant";
  return (
    <div className={daNina ? "flex justify-start" : "flex justify-end"}>
      <div
        className={
          daNina
            ? "max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-bl-md bg-card px-4 py-3 text-sm shadow-card"
            : "max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground"
        }
      >
        {content}
      </div>
    </div>
  );
}
