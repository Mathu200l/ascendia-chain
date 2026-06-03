import { Boxes } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="flex items-center gap-3">
      <div className={`grid ${dim} place-items-center rounded-xl bg-gradient-primary shadow-glow`}>
        <Boxes className="h-1/2 w-1/2 text-primary-foreground" />
      </div>
      <div className="leading-tight">
        <div className={`font-display ${text} font-bold tracking-tight`}>
          Ascendia<span className="text-gradient">-Chain</span>
        </div>
        {size !== "sm" && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            AI Supply Chain
          </div>
        )}
      </div>
    </div>
  );
}
