import { apiGet, authPost } from "@/lib/api/client";

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
};

export type AuthResponse = {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
};

export const authService = {
  login: (email: string, password: string) =>
    authPost<AuthResponse>("/auth/login", { email, password }),

  requestOtp: (email: string, npm: string) =>
    authPost<null>("/auth/otp/request", { email, npm }),

  verifyOtp: (email: string, code: string) =>
    authPost<AuthResponse>("/auth/otp/verify", { email, code }),

  refresh: () => authPost<AuthResponse>("/auth/refresh"),

  logout: () => authPost<null>("/auth/logout"),

  me: () => apiGet<AuthUser>("/auth/me", true),
};
