import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { criarCheckout, getMeuPerfil } from "@/lib/assinatura.functions";
import { PLANO, podeAcessarChat } from "@/lib/plano";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated/assinar")({
  head: () => ({
    meta: [
      { title: "Assinar — Nina Fit IA" },
      { name: "description", content: "Ative sua assinatura mensal e libere o chat com a Nina." },
      { property: "og:title", content: "Assinar a Nina Fit IA" },
      { property: "og:description", content: "Plano mensal, cancele quando quiser." },
    ],
  }),
  component: AssinarPage,
});

function AssinarPage() {
  const navigate = useNavigate();
  const fetchPerfil = useServerFn(getMeuPerfil);
  const iniciarCheckout = useServerFn(criarCheckout);
  const [aguardando, setAguardando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const { data: perfil } = useQuery({
    queryKey: ["perfil"],
    queryFn: () => fetchPerfil(),
    refetchInterval: aguardando ? 5000 : false,
  });

  useEffect(() => {
    if (podeAcessarChat(perfil?.status_assinatura)) navigate({ to: "/dashboard", replace: true });
  }, [perfil?.status_assinatura, navigate]);

  async function assinar() {
    setCarregando(true);
    try {
      const { checkoutUrl } = await iniciarCheckout();
      setAguardando(true);
      window.open(checkoutUrl, "_blank", "noopener");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não deu certo agora. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg px-5 py-8">
        <h1 className="text-3xl font-extrabold">Falta pouco 💛</h1>
        <p className="mt-2 text-muted-foreground">
          Ative seu plano mensal e comece a conversar com a Nina agora.
        </p>

        <section className="mt-6 rounded-3xl bg-card p-6 shadow-card">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">{PLANO.nome}</p>
          <p className="mt-2 flex items-end gap-2">
            <span className="font-display text-5xl font-extrabold">{PLANO.valorFormatado}</span>
            <span className="pb-2 text-muted-foreground">{PLANO.ciclo}</span>
          </p>
          <ul className="mt-5 space-y-3">
            {PLANO.beneficios.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 text-accent" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <Button
            variant="hero"
            size="lg"
            className="mt-6 w-full"
            onClick={assinar}
            disabled={carregando}
          >
            {carregando ? "Gerando seu link..." : "Assinar agora"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pagamento no cartão, cobrança mensal. Cancele quando quiser.
          </p>
        </section>

        {aguardando && (
          <div className="mt-6 flex items-start gap-3 rounded-3xl bg-secondary p-5 text-secondary-foreground">
            <Loader2 className="mt-0.5 size-5 animate-spin" />
            <div>
              <p className="font-bold">Estamos confirmando seu pagamento</p>
              <p className="text-sm">
                Pode deixar essa tela aberta. Assim que cair, sua Nina libera sozinha.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}