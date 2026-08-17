import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/nina-logo.png.asset.json";

export function BrandLogo({ to = "/" }: { to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <img
        src={logoAsset.url}
        alt="Logo Nina Fit IA"
        width={40}
        height={40}
        className="h-10 w-10 rounded-xl object-cover"
      />
      <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
        NINA FIT <span className="text-primary">IA</span>
      </span>
    </Link>
  );
}