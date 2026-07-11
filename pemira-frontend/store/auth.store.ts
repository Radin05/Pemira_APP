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

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  initializing: true,

  // initializing:false — begitu sesi diset (login/OTP), guard tak perlu menunggu
  // bootstrap. Tanpa ini, layout dashboard mentok di loader setelah login.
  setSession: (res) => set({ accessToken: res.accessToken, user: res.user, initializing: false }),
  clear: () => set({ accessToken: null, user: null }),

  bootstrap: async () => {
    try {
      const res = await authService.refresh();
      set({ accessToken: res.accessToken, user: res.user });
    } catch {
      set({ accessToken: null, user: null });
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
