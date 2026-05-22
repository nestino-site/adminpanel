import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatPercent(value: number | undefined) {
  if (value === undefined || value === null) return "—";
  return `${Math.round(value * 100)}%`;
}

export function formatShortId(id: string | number | null | undefined) {
  if (id === null || id === undefined || id === "") return "—";
  const value = String(id);
  return value.length > 8 ? value.slice(0, 8) : value;
}
