import { Link } from "@tanstack/react-router";
import logo from "@/assets/nina-logo.png";

export function BrandLogo({ to = "/" }: { to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <img src={logo} alt="Logo Nina Fit IA" width={40} height={40} className="h-10 w-10" />
      <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
        Nina Fit <span className="text-primary">IA</span>
      </span>
    </Link>
  );
}