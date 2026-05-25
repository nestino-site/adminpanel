"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useAuthHydration } from "@/lib/use-auth-hydration";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydration();
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    async function verify() {
      if (!accessToken) {
        router.replace("/login");
        return;
      }

      setAccessToken(accessToken);

      if (user) {
        setReady(true);
        return;
      }

      try {
        const me = await api.get<{
          id: string;
          email: string;
          displayName: string;
          role: string;
        }>("/identity/me");
        if (!cancelled) {
          setAuth(accessToken, me as Parameters<typeof setAuth>[1]);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
          router.replace("/login");
        }
      }
    }

    setReady(false);
    verify();
    return () => {
      cancelled = true;
    };
  }, [hydrated, accessToken, user, setAuth, clearAuth, router]);

  if (!hydrated || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-4 p-8">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
