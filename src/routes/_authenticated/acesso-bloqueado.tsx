import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { getMeuPerfil } from "@/lib/assinatura.functions";
import { podeAcessarChat } from "@/lib/plano";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/_authenticated/acesso-bloqueado")({
  head: () => ({
    meta: [
      { title: "Acesso pausado — Nina Fit IA" },
      { name: "description", content: "Sua assinatura está pausada. Reative para voltar ao chat." },
      { property: "og:title", content: "Acesso pausado — Nina Fit IA" },
      { property: "og:description", content: "Reative sua assinatura e volte a falar com a Nina." },
    ],
  }),
  component: AcessoBloqueadoPage,
});

function AcessoBloqueadoPage() {
  const navigate = useNavigate();
  const fetchPerfil = useServerFn(getMeuPerfil);
  const { data: perfil } = useQuery({ queryKey: ["perfil"], queryFn: () => fetchPerfil() });

  useEffect(() => {
    if (podeAcessarChat(perfil?.status_assinatura)) navigate({ to: "/dashboard", replace: true });
  }, [perfil?.status_assinatura, navigate]);

  const cancelada = perfil?.status_assinatura === "cancelado";

  return (
    <div className="min-h-screen bg-gradient-soft">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-secondary">
          <Lock className="size-7 text-secondary-foreground" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">
          {cancelada ? "Sua assinatura está cancelada" : "Seu acesso está pausado"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {cancelada
            ? "A Nina fica te esperando. Quando quiser voltar, é só reativar — sua conta continua aqui."
            : "Para conversar com a Nina, você precisa de uma assinatura ativa."}
        </p>
        <Button asChild variant="hero" size="lg" className="mt-7 w-full">
          <a href="/assinar">{cancelada ? "Reativar minha Nina" : "Quero minha Nina"}</a>
        </Button>
        <Button asChild variant="ghost" size="sm" className="mt-2">
          <a href="/conta">Ver minha conta</a>
        </Button>
      </main>
    </div>
  );
}