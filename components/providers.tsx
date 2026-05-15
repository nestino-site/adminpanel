"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { setUnauthorizedHandler } from "@/lib/api";
import { makeQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      router.push("/login");
    });
  }, [clearAuth, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
