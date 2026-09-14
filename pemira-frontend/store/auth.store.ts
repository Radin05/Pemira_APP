"use client";

import { create } from "zustand";
import { configureAuth } from "@/lib/api/client";
import { authService, type AuthResponse, type AuthUser } from "@/lib/api/auth.service";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  /** Belum selesai mencoba silent-refresh saat pertama load. */
  initializing: boolean;

  setSession: (res: AuthResponse) => void;
  clear: () => void;
  /** Coba pulihkan sesi dari cookie refresh (dipanggil saat app load). */
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = "pemira_auth_session";

function loadSavedSession(): { accessToken: string; user: AuthUser } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(res: AuthResponse | null) {
  if (typeof window === "undefined") return;
  try {
    if (res) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: res.accessToken, user: res.user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  initializing: true,

  setSession: (res) => {
    persistSession(res);
    set({ accessToken: res.accessToken, user: res.user, initializing: false });
  },
  clear: () => {
    persistSession(null);
    set({ accessToken: null, user: null });
  },

  bootstrap: async () => {
    const saved = loadSavedSession();
    if (saved) {
      set({ accessToken: saved.accessToken, user: saved.user, initializing: false });
    }

    try {
      const res = await authService.refresh();
      persistSession(res);
      set({ accessToken: res.accessToken, user: res.user });
    } catch {
      if (!saved) {
        set({ accessToken: null, user: null });
      }
    } finally {
      set({ initializing: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Abaikan; tetap bersihkan sesi lokal.
    }
    persistSession(null);
    set({ accessToken: null, user: null });
  },
}));

// Hubungkan store ke apiClient: cara mengambil token & menyegarkan sesi saat 401.
configureAuth({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshSession: async () => {
    try {
      const res = await authService.refresh();
      useAuthStore.getState().setSession(res);
      return res.accessToken;
    } catch {
      useAuthStore.getState().clear();
      return null;
    }
  },
});

/** Cek role. Dipakai guard & UI kondisional. */
export function useHasRole(...roles: string[]): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}
