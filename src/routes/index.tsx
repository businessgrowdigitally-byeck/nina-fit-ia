import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, Sparkles, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { PLANO } from "@/lib/plano";
import heroImg from "@/assets/hero-nina.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nina Fit IA — sua nutri e personal no bolso" },
      {
        name: "description",
        content:
          "Dieta e treino que cabem na sua rotina, por assinatura, no chat. Sem dieta impossível.",
      },
      { property: "og:title", content: "Nina Fit IA — sua nutri e personal no bolso" },
      {
        property: "og:description",
        content: "Assine e converse com a Nina quando quiser: comida de verdade e treino real.",
      },
    ],
  }),
  component: Landing,
});

const PASSOS = [
  {
    icone: Sparkles,
    titulo: "1. Crie sua conta",
    texto: "E-mail e senha. Menos de 1 minuto.",
  },
  {
    icone: MessageCircle,
    titulo: "2. Conte sua rotina",
    texto: "Horários, o que você gosta de comer, se treina em casa ou na academia.",
  },
  {
    icone: Utensils,
    titulo: "3. Receba seu plano",
    texto: "Cardápio e treino na hora. Mudou a rotina? É só pedir ajuste no chat.",
  },
];

const DEPOIMENTOS = [
  {
    nome: "Camila, 29",
    texto: "Eu comia mal por falta de tempo. Agora pergunto pra Nina e ela monta com o que tem na geladeira.",
  },
  {
    nome: "Jé, 34",
    texto: "Treino em casa 3x na semana e ela vai ajustando. Sem promessa maluca, só constância.",
  },
  {
    nome: "Rafa, 41",
    texto: "O que mais gosto: respondo a qualquer hora, sem precisar marcar consulta.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-5 py-4">
        <BrandLogo />
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Entrar</Link>
        </Button>
      </header>

      <main>
        <section className="bg-gradient-soft px-5 pb-12 pt-6">
          <div className="mx-auto max-w-md">
            <p className="inline-flex rounded-full bg-card px-3 py-1 text-xs font-bold text-primary shadow-card">
              Assinatura mensal • cancele quando quiser
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">
              Sua nutricionista e personal no bolso, sem dieta impossível.
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              A Nina monta seu cardápio e seu treino com o que você já tem e o tempo que você tem
              de verdade. Tudo no chat.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-6 w-full">
              <Link to="/auth">Quero minha Nina</Link>
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {PLANO.valorFormatado} {PLANO.ciclo} • sem fidelidade
            </p>

            <img
              src={heroImg}
              alt="Mulher sorrindo com o celular na cozinha, conversando com a Nina"
              width={1200}
              height={1408}
              className="mt-8 w-full rounded-3xl object-cover shadow-card"
            />
          </div>
        </section>

        <section className="px-5 py-12">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-extrabold">Como funciona</h2>
            <div className="mt-5 space-y-4">
              {PASSOS.map(({ icone: Icone, titulo, texto }) => (
                <div key={titulo} className="flex gap-3 rounded-3xl bg-card p-5 shadow-card">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Icone className="size-5 text-secondary-foreground" />
                  </span>
                  <div>
                    <p className="font-bold">{titulo}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-soft px-5 py-12">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-extrabold">Quem já usa</h2>
            <div className="mt-5 space-y-4">
              {DEPOIMENTOS.map((d) => (
                <blockquote key={d.nome} className="rounded-3xl bg-card p-5 shadow-card">
                  <p className="text-sm">“{d.texto}”</p>
                  <footer className="mt-3 text-xs font-bold text-primary">{d.nome}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-12">
          <div className="mx-auto max-w-md rounded-3xl bg-card p-6 shadow-card">
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Plano único</p>
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
            <Button asChild variant="hero" size="lg" className="mt-6 w-full">
              <Link to="/auth">Quero minha Nina</Link>
            </Button>
          </div>
        </section>

        <section className="px-5 pb-16">
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm text-muted-foreground">
              A Nina é uma assistente de IA criada pela equipe da Alice Mayer. Ela ajuda na rotina
              e não substitui acompanhamento médico.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">
        Nina Fit IA • por Alice Mayer
      </footer>
    </div>
  );
}
