import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { getMeuPerfil } from "@/lib/assinatura.functions";
import { PLANO, STATUS_LABEL, podeAcessarChat, type StatusAssinatura } from "@/lib/plano";
import { AppHeader } from "@/components/AppHeader";
import { NinaChat } from "@/components/NinaChat";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Minha Dieta & Treino — Nina Fit IA" },
      { name: "description", content: "Seu chat com a Nina: dieta, treino e ajustes na rotina." },
      { property: "og:title", content: "Minha Dieta & Treino" },
      { property: "og:description", content: "Seu chat de dieta e treino, sempre disponível." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchPerfil = useServerFn(getMeuPerfil);
  const { data: perfil } = useQuery({ queryKey: ["perfil"], queryFn: () => fetchPerfil() });

  const status = (perfil?.status_assinatura ?? "nenhuma") as StatusAssinatura;
  const liberado = podeAcessarChat(status);

  return (
    <div className="flex h-screen flex-col bg-gradient-soft">
      <AppHeader />
      <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList className="mx-auto mt-3 w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <TabsTrigger value="chat" className="flex-1 rounded-xl">
            Minha Dieta &amp; Treino
          </TabsTrigger>
          <TabsTrigger value="assinatura" className="flex-1 rounded-xl">
            Assinatura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-3 min-h-0 flex-1">
          {status === "atrasado" && (
            <p className="bg-secondary px-4 py-2 text-center text-sm font-semibold text-secondary-foreground">
              Seu último pagamento não caiu ainda. Você segue com acesso, mas dá uma olhada em
              Minha conta 💛
            </p>
          )}
          <NinaChat liberado={liberado} />
        </TabsContent>

        <TabsContent value="assinatura" className="mt-3 min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-lg px-5 pb-10">
            <section className="rounded-3xl bg-card p-6 shadow-card">
              <p className="text-sm text-muted-foreground">Status da sua assinatura</p>
              <p className="mt-1 text-2xl font-extrabold">{STATUS_LABEL[status] ?? status}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Próxima cobrança: <span className="font-bold text-foreground">
                  {formataData(perfil?.data_proxima_cobranca ?? null)}
                </span>
              </p>
            </section>

            <section className="mt-5 rounded-3xl bg-card p-6 shadow-card">
              <p className="text-sm font-bold uppercase tracking-wide text-primary">{PLANO.nome}</p>
              <p className="mt-2 flex items-end gap-2">
                <span className="font-display text-4xl font-extrabold">{PLANO.valorFormatado}</span>
                <span className="pb-1 text-muted-foreground">{PLANO.ciclo}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {PLANO.beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 text-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {liberado ? (
                <Button asChild variant="outline" size="lg" className="mt-6 w-full">
                  <Link to="/conta">Gerenciar assinatura</Link>
                </Button>
              ) : (
                <Button asChild variant="hero" size="lg" className="mt-6 w-full">
                  <Link to="/assinar">Assinar plano</Link>
                </Button>
              )}
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formataData(data: string | null) {
  if (!data) return "—";
  const d = new Date(`${data}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}
