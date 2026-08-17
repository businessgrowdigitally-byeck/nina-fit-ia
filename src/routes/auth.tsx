import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Nina Fit IA" },
      {
        name: "description",
        content: "Crie sua conta e comece a conversar com a Nina hoje mesmo.",
      },
      { property: "og:title", content: "Entrar na Nina Fit IA" },
      { property: "og:description", content: "Sua conta para acessar a Nina no chat." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("criar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      if (modo === "criar") {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin,
            data: { nome },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Vamos ativar sua assinatura 💛");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? traduzErro(err.message) : "Algo deu errado. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-soft px-5 py-8">
      <BrandLogo />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="rounded-3xl bg-card p-6 shadow-card">
          <h1 className="text-2xl font-extrabold">
            {modo === "criar" ? "Criar minha conta" : "Bem-vinda de volta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {modo === "criar"
              ? "Leva menos de 1 minuto."
              : "Entre para continuar conversando com a Nina."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {modo === "criar" && (
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como a Nina deve te chamar?"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete={modo === "criar" ? "new-password" : "current-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={carregando}>
              {carregando ? "Um instante..." : modo === "criar" ? "Quero minha Nina" : "Entrar"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setModo(modo === "criar" ? "entrar" : "criar")}
            className="mt-5 w-full text-sm font-semibold text-primary"
          >
            {modo === "criar" ? "Já tenho conta — entrar" : "Ainda não tenho conta — criar"}
          </button>
        </div>

        <Link to="/" className="mt-6 text-center text-sm text-muted-foreground">
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}

function traduzErro(msg: string) {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("already registered")) return "Esse e-mail já tem conta. Tente entrar.";
  if (msg.toLowerCase().includes("password")) return "Senha muito curta ou fraca.";
  return msg;
}