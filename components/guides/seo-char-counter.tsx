import { cn } from "@/lib/utils";

type CharCounterVariant = "red" | "yellow" | "green";

function getVariant(length: number, min: number, max: number): CharCounterVariant {
  if (length < min || length > max) return "red";
  if (length < min + 5 || length > max - 5) return "yellow";
  return "green";
}

const variantClasses: Record<CharCounterVariant, string> = {
  red: "text-destructive",
  yellow: "text-amber-600 dark:text-amber-400",
  green: "text-emerald-600 dark:text-emerald-400",
};

export function SeoCharCounter({
  value,
  min,
  max,
  label,
}: {
  value: string;
  min: number;
  max: number;
  label: string;
}) {
  const length = value.length;
  const variant = getVariant(length, min, max);

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium tabular-nums", variantClasses[variant])}>
        {length} / {min}–{max}
        {variant === "red" && length > 0 && " (out of range)"}
      </span>
    </div>
  );
}
