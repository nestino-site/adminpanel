"use client";

import { useEffect, useState } from "react";
import { setAccessToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

function syncTokenFromStore() {
  const token = useAuthStore.getState().accessToken;
  setAccessToken(token);
}

/** Wait for zustand persist to load session from localStorage before auth checks. */
export function useAuthHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      syncTokenFromStore();
      setHydrated(true);
      return;
    }

    const finish = () => {
      syncTokenFromStore();
      setHydrated(true);
    };

    if (persist.hasHydrated()) {
      finish();
      return;
    }

    return persist.onFinishHydration(finish);
  }, []);

  return hydrated;
}
