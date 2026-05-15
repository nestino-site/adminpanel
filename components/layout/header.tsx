"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteSwitcher } from "@/components/layout/site-switcher";
import { useAuthStore } from "@/lib/store";

export function Header({ title }: { title?: string }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card/80 px-6 backdrop-blur">
      <div>
        {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        <SiteSwitcher />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{user?.displayName}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            clearAuth();
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
