import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMeuPerfil } from "@/lib/assinatura.functions";
import { STATUS_LABEL, SUPORTE_EMAIL, type StatusAssinatura } from "@/lib/plano";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Nina Fit IA" },
      { name: "description", content: "Veja seu e-mail, status da assinatura e próxima cobrança." },
      { property: "og:title", content: "Minha conta — Nina Fit IA" },
      { property: "og:description", content: "Gerencie sua assinatura da Nina." },
    ],
  }),
  component: ContaPage,
});

function ContaPage() {
  const fetchPerfil = useServerFn(getMeuPerfil);
  const { data: perfil, isPending } = useQuery({
    queryKey: ["perfil"],
    queryFn: () => fetchPerfil(),
  });
  const [mostrarCancelamento, setMostrarCancelamento] = useState(false);

  const status = (perfil?.status_assinatura ?? "nenhuma") as StatusAssinatura;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg px-5 py-8">
        <h1 className="text-3xl font-extrabold">Minha conta</h1>

        <section className="mt-6 space-y-4 rounded-3xl bg-card p-6 shadow-card">
          <Linha rotulo="E-mail" valor={isPending ? "..." : (perfil?.email ?? "—")} />
          <Linha rotulo="Assinatura" valor={STATUS_LABEL[status] ?? status} />
          <Linha
            rotulo="Próxima cobrança"
            valor={formataData(perfil?.data_proxima_cobranca ?? null)}
          />
        </section>

        {status === "nenhuma" || status === "cancelado" ? (
          <Button asChild variant="hero" size="lg" className="mt-6 w-full">
            <a href="/assinar">Ativar minha assinatura</a>
          </Button>
        ) : (
          <div className="mt-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setMostrarCancelamento(true)}
            >
              Cancelar assinatura
            </Button>
            {mostrarCancelamento && (
              <div className="mt-4 rounded-3xl bg-secondary p-5 text-sm text-secondary-foreground">
                <p className="font-bold">Quer cancelar? Sem problema.</p>
                <p className="mt-1">
                  Mande um e-mail para <span className="font-bold">{SUPORTE_EMAIL}</span> com o
                  assunto “Cancelar assinatura”. A gente responde em até 1 dia útil e o acesso
                  segue até o fim do período pago.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{rotulo}</span>
      <span className="text-right text-sm font-bold">{valor}</span>
    </div>
  );
}

function formataData(data: string | null) {
  if (!data) return "—";
  const d = new Date(`${data}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}