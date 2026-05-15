import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/api";
import { setAccessToken } from "@/lib/api";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  activeSiteId: string | null;
  siteApiKeys: Record<string, string>;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setActiveSiteId: (siteId: string | null) => void;
  setSiteApiKey: (siteId: string, key: string) => void;
  getSiteApiKey: (siteId: string) => string | undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      activeSiteId: null,
      siteApiKeys: {},
      setAuth: (token, user) => {
        setAccessToken(token);
        set({ accessToken: token, user });
      },
      clearAuth: () => {
        setAccessToken(null);
        set({ accessToken: null, user: null, activeSiteId: null });
      },
      setActiveSiteId: (siteId) => set({ activeSiteId: siteId }),
      setSiteApiKey: (siteId, key) =>
        set((s) => ({
          siteApiKeys: { ...s.siteApiKeys, [siteId]: key },
        })),
      getSiteApiKey: (siteId) => get().siteApiKeys[siteId],
    }),
    {
      name: "nestino-admin",
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        activeSiteId: s.activeSiteId,
        siteApiKeys: s.siteApiKeys,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
        }
      },
    },
  ),
);
