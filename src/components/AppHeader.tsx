import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <BrandLogo to="/dashboard" />
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link to="/conta">Minha conta</Link>
        </Button>
        <Button variant="soft" size="sm" onClick={sair}>
          Sair
        </Button>
      </div>
    </header>
  );
}