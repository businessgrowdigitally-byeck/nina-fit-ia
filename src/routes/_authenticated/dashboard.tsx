import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { getMeuPerfil } from "@/lib/assinatura.functions";
import { podeAcessarChat } from "@/lib/plano";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Conversar com a Nina — Nina Fit IA" },
      { name: "description", content: "Seu chat com a Nina: dieta, treino e ajustes na rotina." },
      { property: "og:title", content: "Conversar com a Nina" },
      { property: "og:description", content: "Seu chat de dieta e treino, sempre disponível." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const fetchPerfil = useServerFn(getMeuPerfil);
  const { data: perfil, isPending } = useQuery({
    queryKey: ["perfil"],
    queryFn: () => fetchPerfil(),
  });

  const status = perfil?.status_assinatura;
  const liberado = podeAcessarChat(status);

  useEffect(() => {
    if (isPending || liberado) return;
    if (!status || status === "nenhuma") navigate({ to: "/assinar", replace: true });
    else navigate({ to: "/acesso-bloqueado", replace: true });
  }, [isPending, liberado, status, navigate]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      {liberado ? (
        <>
          {status === "atrasado" && (
            <p className="bg-secondary px-4 py-2 text-center text-sm font-semibold text-secondary-foreground">
              Seu último pagamento não caiu ainda. Você segue com acesso, mas dá uma olhada em
              Minha conta 💛
            </p>
          )}
          <div className="flex-1">
            <iframe
              title="Chat com a Nina"
              src="https://app.gptmaker.ai/widget/3F7BFB0E3763533B3176862D20D40BD5/iframe"
              width="100%"
              style={{ height: "100%", minHeight: 700 }}
              allow="microphone;"
              frameBorder="0"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-muted-foreground">
          Carregando sua Nina...
        </div>
      )}
    </div>
  );
}