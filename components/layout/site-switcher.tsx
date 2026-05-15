"use client";

import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSites } from "@/hooks/use-sites";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SiteSwitcher() {
  const router = useRouter();
  const { activeSiteId, setActiveSiteId } = useAuthStore();
  const { data: sites, isLoading } = useSites();
  const active = sites?.find((s) => s.id === activeSiteId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[200px] justify-between gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="truncate">{active?.name ?? "Select site"}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Sites</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sites?.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => {
              setActiveSiteId(site.id);
              router.push(`/sites/${site.id}`);
            }}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                activeSiteId === site.id ? "opacity-100" : "opacity-0",
              )}
            />
            <div className="flex flex-col">
              <span>{site.name}</span>
              <span className="text-xs text-muted-foreground">{site.domain}</span>
            </div>
          </DropdownMenuItem>
        ))}
        {!sites?.length && (
          <DropdownMenuItem onClick={() => router.push("/sites")}>
            Create your first site
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
